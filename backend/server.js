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
const { analyzePortfolio } = require('./simulation/portfolioAnalysis');
const { initDB, getDBConnection } = require('./db');
const { authRouter, authenticateToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/auth', authRouter);

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
      
      baseSip: Number(sip),
      baseGoal: Number(goal)
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

/**
 * POST /analyze-portfolio
 * 
 * Analyze an array of holdings uploaded by the user via CSV.
 */
app.post('/analyze-portfolio', authenticateToken, async (req, res) => {
  try {
    const { holdings } = req.body;
    if (!holdings || !Array.isArray(holdings)) {
      return res.status(400).json({ error: 'Invalid or missing holdings array' });
    }
    
    const analysis = analyzePortfolio(holdings);
    if (analysis.error) {
      return res.status(400).json({ error: analysis.error });
    }

    if (req.user) {
      const db = await getDBConnection();
      
      // Deduplicate: Check if the last upload was identical
      const lastRecord = await db.get(
        'SELECT payload_json FROM portfolio_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', 
        [req.user.id]
      );
      
      const newPayload = JSON.stringify(analysis);
      if (!lastRecord || lastRecord.payload_json !== newPayload) {
        await db.run(
          'INSERT INTO portfolio_history (user_id, total_value, health_score, payload_json) VALUES (?, ?, ?, ?)',
          [req.user.id, analysis.totalValue, analysis.healthScore, newPayload]
        );
      }
    }

    res.json(analysis);
  } catch (error) {
    console.error('Portfolio Analysis error:', error);
    res.status(500).json({ error: 'Portfolio Analysis failed', message: error.message });
  }
});

/**
 * GET /history
 * Fetch past portfolio uploads for the authenticated user.
 */
app.get('/history', authenticateToken, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const db = await getDBConnection();
    const rows = await db.all('SELECT id, timestamp, total_value, health_score, payload_json FROM portfolio_history WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id]);
    res.json(rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      totalValue: row.total_value,
      healthScore: row.health_score,
      analysis: JSON.parse(row.payload_json)
    })));
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🛡️  InvestShield AI Backend running on http://localhost:${PORT}`);
    console.log(`   POST /simulate  — Full simulation + AI analysis`);
    console.log(`   POST /compare   — Strategy comparison`);
    console.log(`   POST /analyze-portfolio — Portfolio parsing & history`);
    console.log(`   GET  /history  — History log retrieval\n`);
  });
});
