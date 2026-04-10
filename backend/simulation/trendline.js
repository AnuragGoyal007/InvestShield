/**
 * Trendline & Growth Analysis Module
 * 
 * Generates time-series growth data for visualization.
 * Detects growth acceleration and risk dips (drawdowns).
 */

const { runMonteCarloSimulation } = require('./monteCarlo');

/**
 * Generate detailed trendline data for multiple scenarios
 * @param {Object} params - User inputs
 * @returns {Object} Trendline data with annotations
 */
function generateTrendlines({ sip, years, goal, stepUp = 0, riskPreference = 'medium' }) {
  const months = years * 12;

  // Generate trendlines for three key scenarios
  const currentPlan = runMonteCarloSimulation({
    sip, years, goal, stepUp: 0, riskPreference, numSimulations: 1000,
  });

  const stepUpPlan = runMonteCarloSimulation({
    sip, years, goal, stepUp: stepUp || Math.ceil(sip * 0.1), riskPreference, numSimulations: 1000,
  });

  const bestPlan = runMonteCarloSimulation({
    sip: Math.ceil(sip * 1.2), years, goal,
    stepUp: stepUp || Math.ceil(sip * 0.15),
    riskPreference: 'medium',
    numSimulations: 1000,
  });

  // Build combined trendline data for charting
  const trendData = [];
  for (let m = 0; m < months; m++) {
    trendData.push({
      month: m + 1,
      currentSIP: currentPlan.trendline[m] || 0,
      stepUpSIP: stepUpPlan.trendline[m] || 0,
      bestStrategy: bestPlan.trendline[m] || 0,
      goalLine: goal, // Flat goal reference line
    });
  }

  // Detect growth acceleration zones (where month-over-month growth exceeds 3%)
  const accelerationZones = detectAccelerationZones(bestPlan.trendline);
  
  // Detect risk dips / drawdowns
  const drawdowns = detectDrawdowns(currentPlan.trendline);

  // Sample for chart performance
  const sampledData = sampleForChart(trendData, 60);

  return {
    trendData: sampledData,
    annotations: {
      accelerationZones,
      drawdowns,
    },
    scenarios: {
      currentPlan: { average: currentPlan.average, probability: currentPlan.probability },
      stepUpPlan: { average: stepUpPlan.average, probability: stepUpPlan.probability },
      bestPlan: { average: bestPlan.average, probability: bestPlan.probability },
    },
  };
}

/**
 * Detect months where growth rate exceeds typical pace
 */
function detectAccelerationZones(trendline) {
  const zones = [];
  for (let i = 1; i < trendline.length; i++) {
    if (trendline[i - 1] > 0) {
      const growthRate = (trendline[i] - trendline[i - 1]) / trendline[i - 1];
      if (growthRate > 0.03) { // >3% monthly growth
        zones.push({ month: i + 1, growthRate: Math.round(growthRate * 100) });
      }
    }
  }
  // Return only significant clusters
  return zones.slice(0, 5);
}

/**
 * Detect portfolio drawdowns (value drops from recent peak)
 */
function detectDrawdowns(trendline) {
  const drawdowns = [];
  let peak = 0;

  for (let i = 0; i < trendline.length; i++) {
    if (trendline[i] > peak) {
      peak = trendline[i];
    } else if (peak > 0) {
      const drawdown = (peak - trendline[i]) / peak;
      if (drawdown > 0.05) { // >5% drawdown
        drawdowns.push({
          month: i + 1,
          drawdownPercent: Math.round(drawdown * 100),
          value: trendline[i],
          peak,
        });
      }
    }
  }

  return drawdowns.slice(0, 5);
}

/**
 * Sample trendline data points for chart performance
 */
function sampleForChart(data, maxPoints) {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  const sampled = [];
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }
  if (sampled[sampled.length - 1]?.month !== data[data.length - 1]?.month) {
    sampled.push(data[data.length - 1]);
  }
  return sampled;
}

module.exports = { generateTrendlines };
