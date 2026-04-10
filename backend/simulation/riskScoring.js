/**
 * Risk Scoring Engine
 * 
 * Calculates a composite risk score (0–100) based on:
 *   1. Portfolio volatility (how much returns vary)
 *   2. Probability of loss (chance of ending below invested amount)
 *   3. Portfolio type risk inherent rating
 * 
 * Classification:
 *   0–30:  Low Risk    (green zone)
 *   31–60: Medium Risk (amber zone)  
 *   61–100: High Risk  (red zone)
 */

// Base risk scores for portfolio types
const PORTFOLIO_BASE_RISK = {
  low: 15,        // Conservative
  medium: 45,     // Balanced
  high: 75,       // Aggressive
};

/**
 * Calculate risk score from simulation results
 * @param {Object} params
 * @param {number} params.volatility - Standard deviation of final values
 * @param {number} params.average - Average final portfolio value
 * @param {number} params.worstCase - 5th percentile value
 * @param {number} params.totalInvested - Total amount invested
 * @param {string} params.riskPreference - 'low' | 'medium' | 'high'
 * @param {number} params.probability - Probability of achieving goal (0–100)
 * @returns {Object} Risk score details
 */
function calculateRiskScore({
  volatility,
  average,
  worstCase,
  totalInvested,
  riskPreference,
  probability,
}) {
  // Component 1: Volatility score (0–40 points)
  // Higher volatility relative to average = higher risk
  const coefficientOfVariation = average > 0 ? volatility / average : 0;
  const volatilityScore = Math.min(40, Math.round(coefficientOfVariation * 100));

  // Component 2: Loss probability score (0–30 points)
  // If worst case is below invested amount, that's risky
  const lossRatio = totalInvested > 0
    ? Math.max(0, (totalInvested - worstCase) / totalInvested)
    : 0;
  const lossScore = Math.min(30, Math.round(lossRatio * 60));

  // Component 3: Portfolio type base risk (0–30 points)
  const baseRisk = PORTFOLIO_BASE_RISK[riskPreference] || 45;
  const typeScore = Math.round(baseRisk * 0.4); // Scale to 0–30

  // Composite score (0–100)
  let riskScore = Math.min(100, volatilityScore + lossScore + typeScore);

  // Adjust: if goal probability is very high, reduce perceived risk slightly
  if (probability > 80) {
    riskScore = Math.max(0, riskScore - 5);
  }

  // Classify risk level
  let riskLevel, riskColor;
  if (riskScore <= 30) {
    riskLevel = 'Low Risk';
    riskColor = '#10b981'; // emerald
  } else if (riskScore <= 60) {
    riskLevel = 'Medium Risk';
    riskColor = '#f59e0b'; // amber
  } else {
    riskLevel = 'High Risk';
    riskColor = '#ef4444'; // red
  }

  return {
    riskScore,
    riskLevel,
    riskColor,
    breakdown: {
      volatilityScore,
      lossScore,
      typeScore,
    },
  };
}

module.exports = { calculateRiskScore };
