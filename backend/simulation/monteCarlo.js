/**
 * Monte Carlo Simulation Engine
 * 
 * Simulates thousands of investment scenarios using randomized monthly returns
 * to estimate portfolio outcomes. Uses Box-Muller transform for normal distribution.
 * 
 * Return profiles by risk category:
 *   Conservative: 0–6% annualized (FDs, debt funds)
 *   Moderate:     6–12% annualized (mutual funds, balanced)
 *   Aggressive:   12–20% annualized (stocks, small-cap, crypto)
 */

// Return profiles: { meanAnnual, stdDevAnnual }
const RETURN_PROFILES = {
  conservative: { meanAnnual: 0.03, stdDevAnnual: 0.03 },   // 0–6%
  moderate:     { meanAnnual: 0.09, stdDevAnnual: 0.06 },    // 6–12%
  aggressive:   { meanAnnual: 0.16, stdDevAnnual: 0.10 },    // 12–20%
};

/**
 * Box-Muller transform — generates normally distributed random numbers
 * from uniform random numbers (no external dependency needed).
 */
function normalRandom(mean = 0, stdDev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * stdDev + mean;
}

/**
 * Run a single Monte Carlo simulation path
 * @param {number} monthlySIP - Monthly investment amount
 * @param {number} months - Total investment duration in months
 * @param {number} stepUp - Annual SIP increment
 * @param {string} riskProfile - 'conservative' | 'moderate' | 'aggressive'
 * @returns {{ finalValue: number, monthlyValues: number[] }}
 */
function simulateSinglePath(monthlySIP, months, stepUp, riskProfile) {
  const profile = RETURN_PROFILES[riskProfile] || RETURN_PROFILES.moderate;
  
  // Convert annual returns to monthly
  const monthlyMean = profile.meanAnnual / 12;
  const monthlyStdDev = profile.stdDevAnnual / Math.sqrt(12);
  
  let portfolioValue = 0;
  let currentSIP = monthlySIP;
  const monthlyValues = [];

  for (let m = 0; m < months; m++) {
    // Generate random monthly return
    const monthlyReturn = normalRandom(monthlyMean, monthlyStdDev);
    
    // Add SIP and apply return
    portfolioValue = (portfolioValue + currentSIP) * (1 + monthlyReturn);
    
    // Ensure portfolio doesn't go below zero (floor at 0)
    portfolioValue = Math.max(0, portfolioValue);
    
    monthlyValues.push(Math.round(portfolioValue));

    // Step-up SIP annually
    if ((m + 1) % 12 === 0 && stepUp > 0) {
      currentSIP += stepUp;
    }
  }

  return {
    finalValue: Math.round(portfolioValue),
    monthlyValues,
  };
}

/**
 * Run full Monte Carlo simulation with N scenarios
 * @param {Object} params
 * @param {number} params.sip - Monthly SIP amount
 * @param {number} params.years - Investment duration in years
 * @param {number} params.goal - Target amount
 * @param {number} params.stepUp - Annual SIP increment
 * @param {string} params.riskPreference - 'low' | 'medium' | 'high'
 * @param {number} [params.numSimulations=2000] - Number of scenarios
 * @returns {Object} Simulation results
 */
function runMonteCarloSimulation({
  sip,
  years,
  goal,
  stepUp = 0,
  riskPreference = 'medium',
  numSimulations = 2000,
}) {
  const months = years * 12;
  
  // Map user risk preference to profile
  const riskMap = { low: 'conservative', medium: 'moderate', high: 'aggressive' };
  const riskProfile = riskMap[riskPreference] || 'moderate';

  const allFinalValues = [];
  const allPaths = [];

  for (let i = 0; i < numSimulations; i++) {
    const result = simulateSinglePath(sip, months, stepUp, riskProfile);
    allFinalValues.push(result.finalValue);
    
    // Store a subset of paths for trendline visualization (every 200th)
    if (i % 200 === 0) {
      allPaths.push(result.monthlyValues);
    }
  }

  // Sort for percentile calculations
  allFinalValues.sort((a, b) => a - b);

  const average = Math.round(allFinalValues.reduce((a, b) => a + b, 0) / allFinalValues.length);
  const median = allFinalValues[Math.floor(allFinalValues.length / 2)];
  const worstCase = allFinalValues[Math.floor(allFinalValues.length * 0.05)];   // 5th percentile
  const bestCase = allFinalValues[Math.floor(allFinalValues.length * 0.95)];    // 95th percentile
  const successCount = allFinalValues.filter(v => v >= goal).length;
  const probability = Math.round((successCount / numSimulations) * 100);

  // Calculate volatility (standard deviation of final values)
  const mean = allFinalValues.reduce((a, b) => a + b, 0) / allFinalValues.length;
  const variance = allFinalValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allFinalValues.length;
  const volatility = Math.round(Math.sqrt(variance));

  // Generate average trendline from sample paths
  const avgTrendline = [];
  if (allPaths.length > 0) {
    for (let m = 0; m < months; m++) {
      const sum = allPaths.reduce((acc, path) => acc + (path[m] || 0), 0);
      avgTrendline.push(Math.round(sum / allPaths.length));
    }
  }

  return {
    average,
    median,
    worstCase,
    bestCase,
    probability,
    volatility,
    riskProfile,
    goalAchievable: probability >= 50,
    trendline: avgTrendline,
    totalInvested: calculateTotalInvested(sip, months, stepUp),
  };
}

/**
 * Calculate total amount invested (without any returns)
 */
function calculateTotalInvested(sip, months, stepUp) {
  let total = 0;
  let currentSIP = sip;
  for (let m = 0; m < months; m++) {
    total += currentSIP;
    if ((m + 1) % 12 === 0 && stepUp > 0) {
      currentSIP += stepUp;
    }
  }
  return Math.round(total);
}

module.exports = { runMonteCarloSimulation, simulateSinglePath, RETURN_PROFILES };
