/**
 * InvestShield AI — Express Backend Server
 * 
 * API Endpoints:
 *   POST /simulate — Full Monte Carlo simulation + risk score + AI analysis
 *   POST /compare  — Strategy comparison with trendlines
 * 
 * All responses return structured JSON for the React frontend.
 */

const express = require('express');
const cors = require('cors');
const { runMonteCarloSimulation } = require('./simulation/monteCarlo');
const { compareStrategies } = require('./simulation/strategies');
const { calculateRiskScore } = require('./simulation/riskScoring');
const { generateAIAnalysis } = require('./simulation/aiAnalysis');
const { generateTrendlines } = require('./simulation/trendline');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'InvestShield AI Backend', version: '1.0.0' });
});

/**
 * POST /simulate
 * 
 * Main simulation endpoint. Runs Monte Carlo, calculates risk score,
 * compares strategies, and generates AI recommendations.
 * 
 * Body: { sip, years, goal, stepUp, riskPreference }
 * Returns: Complete analysis payload
 */
app.post('/simulate', (req, res) => {
  try {
    const { sip, years, goal, stepUp = 0, riskPreference = 'medium' } = req.body;

    // Validate inputs
    if (!sip || !years || !goal) {
      return res.status(400).json({ error: 'Missing required fields: sip, years, goal' });
    }

    // 1. Run Monte Carlo simulation
    const simulationResult = runMonteCarloSimulation({
      sip: Number(sip),
      years: Number(years),
      goal: Number(goal),
      stepUp: Number(stepUp),
      riskPreference,
      numSimulations: 2000,
    });

    // 2. Calculate risk score
    const riskScoreResult = calculateRiskScore({
      volatility: simulationResult.volatility,
      average: simulationResult.average,
      worstCase: simulationResult.worstCase,
      totalInvested: simulationResult.totalInvested,
      riskPreference,
      probability: simulationResult.probability,
    });

    // 3. Compare strategies
    const comparisonResult = compareStrategies({
      sip: Number(sip),
      years: Number(years),
      goal: Number(goal),
      stepUp: Number(stepUp),
      riskPreference,
    });

    // 4. Generate AI analysis
    const aiAnalysis = generateAIAnalysis({
      sip: Number(sip),
      years: Number(years),
      goal: Number(goal),
      stepUp: Number(stepUp),
      riskPreference,
      simulationResult,
      riskScoreResult,
      comparisonResult,
    });

    // 5. Generate trendlines
    const trendlineResult = generateTrendlines({
      sip: Number(sip),
      years: Number(years),
      goal: Number(goal),
      stepUp: Number(stepUp),
      riskPreference,
    });

    // Compose response
    res.json({
      // Core simulation data
      average: simulationResult.average,
      median: simulationResult.median,
      worstCase: simulationResult.worstCase,
      bestCase: simulationResult.bestCase,
      probability: simulationResult.probability,
      totalInvested: simulationResult.totalInvested,
      goalAchievable: simulationResult.goalAchievable,

      // Risk assessment
      riskScore: riskScoreResult.riskScore,
      riskLevel: riskScoreResult.riskLevel,
      riskColor: riskScoreResult.riskColor,
      riskBreakdown: riskScoreResult.breakdown,

      // Strategy comparison
      strategies: comparisonResult.strategies,
      bestStrategy: comparisonResult.bestStrategy,

      // Trendline data for charts
      trendData: trendlineResult.trendData,
      comparisonTrendData: comparisonResult.trendData,

      // AI analysis — core
      recommendation: aiAnalysis.recommendation,
      overallVerdict: aiAnalysis.overallVerdict,
      sentimentEmoji: aiAnalysis.sentimentEmoji,
      goalReachable: aiAnalysis.goalReachable,
      insights: aiAnalysis.insights,
      suggestions: aiAnalysis.suggestions,
      summary: aiAnalysis.summary,

      // AI analysis — new: step-up options & mutual fund suggestions
      stepUpOptions: aiAnalysis.stepUpOptions,
      suggestedFunds: aiAnalysis.suggestedFunds,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation failed', message: error.message });
  }
});

/**
 * POST /compare
 * 
 * Strategy comparison endpoint. Lighter than /simulate —
 * returns only strategy comparison and trendline data.
 * 
 * Body: { sip, years, goal, stepUp, riskPreference }
 */
app.post('/compare', (req, res) => {
  try {
    const { sip, years, goal, stepUp = 0, riskPreference = 'medium' } = req.body;

    if (!sip || !years || !goal) {
      return res.status(400).json({ error: 'Missing required fields: sip, years, goal' });
    }

    const comparisonResult = compareStrategies({
      sip: Number(sip),
      years: Number(years),
      goal: Number(goal),
      stepUp: Number(stepUp),
      riskPreference,
    });

    const trendlineResult = generateTrendlines({
      sip: Number(sip),
      years: Number(years),
      goal: Number(goal),
      stepUp: Number(stepUp),
      riskPreference,
    });

    res.json({
      strategies: comparisonResult.strategies,
      bestStrategy: comparisonResult.bestStrategy,
      trendData: trendlineResult.trendData,
      comparisonTrendData: comparisonResult.trendData,
      scenarios: trendlineResult.scenarios,
      goal: Number(goal),
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Comparison failed', message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🛡️  InvestShield AI Backend running on http://localhost:${PORT}`);
  console.log(`   POST /simulate  — Full simulation + AI analysis`);
  console.log(`   POST /compare   — Strategy comparison\n`);
});
