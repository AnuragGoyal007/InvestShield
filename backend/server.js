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
const axiosNode = require('axios'); // use explicit name to avoid conflict if axios is imported elsewhere or just use axios directly.

app.post('/simulate', async (req, res) => {
  try {
    const { sip, years, goal, stepUp = 0, riskPreference = 'medium' } = req.body;

    // Validate inputs
    if (!sip || !years || !goal) {
      return res.status(400).json({ error: 'Missing required fields: sip, years, goal' });
    }

    // A. Fetch Dynamic Market Stats from ML API
    let dynamicMean = 0.12;
    let dynamicVol = 0.15;
    try {
      const marketRes = await axiosNode.get('http://127.0.0.1:8000/api/market-conditions');
      dynamicMean = marketRes.data.expected_return / 100;
      dynamicVol = marketRes.data.volatility;
    } catch (e) {
      console.warn("ML API unreachable, using fallback market stats");
    }

    // Override the moderate profile dynamically
    const { RETURN_PROFILES } = require('./simulation/monteCarlo');
    RETURN_PROFILES.moderate.meanAnnual = dynamicMean;
    RETURN_PROFILES.moderate.stdDevAnnual = dynamicVol;

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

    // 4. Generate AI analysis (base rules + step-up options)
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

    // B. Fetch Real ML Mutual Fund Recommendations
    try {
      const requiredReturn = (goal / (sip * years * 12)) * 10; // rough proxy for needed returns
      const mfRes = await axiosNode.post('http://127.0.0.1:8000/api/recommend-funds', {
        riskPreference,
        requiredReturn: simulationResult.probability >= 65 ? dynamicMean*100 : (dynamicMean*100)+4
      });
      // Override the fake static funds with the real ML funds
      if (mfRes.data && mfRes.data.funds) {
        aiAnalysis.suggestedFunds.funds = mfRes.data.funds;
      }
    } catch (e) {
      console.warn("ML Recommend API unreachable, using static fallback.");
    }

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
      average: simulationResult.average,
      median: simulationResult.median,
      worstCase: simulationResult.worstCase,
      bestCase: simulationResult.bestCase,
      probability: simulationResult.probability,
      totalInvested: simulationResult.totalInvested,
      goalAchievable: simulationResult.goalAchievable,

      riskScore: riskScoreResult.riskScore,
      riskLevel: riskScoreResult.riskLevel,
      riskColor: riskScoreResult.riskColor,
      riskBreakdown: riskScoreResult.breakdown,

      strategies: comparisonResult.strategies,
      bestStrategy: comparisonResult.bestStrategy,
      trendData: trendlineResult.trendData,
      comparisonTrendData: comparisonResult.trendData,

      recommendation: aiAnalysis.recommendation,
      overallVerdict: aiAnalysis.overallVerdict,
      sentimentEmoji: aiAnalysis.sentimentEmoji,
      goalReachable: aiAnalysis.goalReachable,
      insights: aiAnalysis.insights,
      suggestions: aiAnalysis.suggestions,
      summary: aiAnalysis.summary,

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
