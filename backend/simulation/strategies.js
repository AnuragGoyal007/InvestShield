/**
 * Investment Strategy Comparison Engine
 * 
 * Compares five investment strategies side-by-side:
 * 1. Fixed SIP (no step-up, user's risk profile)
 * 2. Step-up SIP (with step-up, user's risk profile)
 * 3. Conservative Portfolio (FD, debt funds — low risk)
 * 4. Balanced Portfolio (mutual funds — moderate risk)
 * 5. Aggressive Portfolio (stocks, small-cap, crypto — high risk)
 * 
 * Each strategy is simulated using Monte Carlo to provide
 * realistic variance-aware projections.
 */

const { runMonteCarloSimulation } = require('./monteCarlo');

/**
 * Strategy definitions with their characteristics
 */
const STRATEGY_DEFINITIONS = [
  {
    id: 'fixed_sip',
    name: 'Fixed SIP',
    description: 'Regular monthly SIP without yearly increment',
    icon: '📊',
    useStepUp: false,
    riskOverride: null, // Use user's preference
  },
  {
    id: 'stepup_sip',
    name: 'Step-up SIP',
    description: 'SIP with annual increment for accelerated growth',
    icon: '📈',
    useStepUp: true,
    riskOverride: null,
  },
  {
    id: 'conservative',
    name: 'Conservative Portfolio',
    description: 'FDs, debt funds, government bonds — lowest risk',
    icon: '🛡️',
    useStepUp: true,
    riskOverride: 'low',
  },
  {
    id: 'balanced',
    name: 'Balanced Portfolio',
    description: 'Diversified mutual funds — moderate risk & returns',
    icon: '⚖️',
    useStepUp: true,
    riskOverride: 'medium',
  },
  {
    id: 'aggressive',
    name: 'Aggressive Portfolio',
    description: 'Stocks, small-cap, crypto — highest growth potential',
    icon: '🚀',
    useStepUp: true,
    riskOverride: 'high',
  },
];

/**
 * Compare all strategies for given user inputs
 * @param {Object} params - User inputs
 * @returns {Object} Comparison results with strategies and trendlines
 */
function compareStrategies({ sip, years, goal, stepUp = 0, riskPreference = 'medium' }) {
  const months = years * 12;
  const strategies = [];
  const trendData = [];

  for (const stratDef of STRATEGY_DEFINITIONS) {
    // Determine parameters for this strategy
    const stratStepUp = stratDef.useStepUp ? stepUp : 0;
    const stratRisk = stratDef.riskOverride || riskPreference;

    // Run Monte Carlo for this strategy
    const result = runMonteCarloSimulation({
      sip,
      years,
      goal,
      stepUp: stratStepUp,
      riskPreference: stratRisk,
      numSimulations: 1500, // Slightly fewer for comparison (performance)
    });

    strategies.push({
      id: stratDef.id,
      name: stratDef.name,
      description: stratDef.description,
      icon: stratDef.icon,
      finalValue: result.average,
      worstCase: result.worstCase,
      bestCase: result.bestCase,
      probability: result.probability,
      volatility: result.volatility,
      totalInvested: result.totalInvested,
      goalAchievable: result.goalAchievable,
      roi: result.totalInvested > 0
        ? Math.round(((result.average - result.totalInvested) / result.totalInvested) * 100)
        : 0,
    });

    // Build trendline data (month-wise) for this strategy
    if (result.trendline && result.trendline.length > 0) {
      result.trendline.forEach((value, idx) => {
        if (!trendData[idx]) {
          trendData[idx] = { month: idx + 1 };
        }
        trendData[idx][stratDef.id] = value;
      });
    }
  }

  // Find best strategy (highest probability, then highest final value)
  const bestStrategy = [...strategies].sort((a, b) => {
    if (b.probability !== a.probability) return b.probability - a.probability;
    return b.finalValue - a.finalValue;
  })[0];

  // Sample trendData to reduce payload — every Nth month for charts
  const sampledTrendData = sampleTrendData(trendData, months);

  return {
    strategies,
    bestStrategy: bestStrategy.id,
    trendData: sampledTrendData,
    goal,
  };
}

/**
 * Sample trendline data to keep payload manageable
 * Shows ~60 data points max regardless of duration
 */
function sampleTrendData(trendData, months) {
  if (trendData.length <= 60) return trendData;
  
  const step = Math.ceil(trendData.length / 60);
  const sampled = [];
  for (let i = 0; i < trendData.length; i += step) {
    sampled.push(trendData[i]);
  }
  // Always include the last point
  if (sampled[sampled.length - 1]?.month !== trendData[trendData.length - 1]?.month) {
    sampled.push(trendData[trendData.length - 1]);
  }
  return sampled;
}

module.exports = { compareStrategies, STRATEGY_DEFINITIONS };
