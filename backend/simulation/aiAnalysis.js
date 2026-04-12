/**
 * AI Portfolio Analysis Engine (Rule-based + Intelligent Logic)
 * 
 * FLOW:
 *   1. First evaluates user's plan WITHOUT step-up (stepUp = 0)
 *   2. If goal is NOT reachable → generates step-up options (10%, 15%, 20%, 25%)
 *      with simulated outcomes for each
 *   3. Suggests mutual fund types based on risk profile, duration, and goal gap
 *   4. Provides clear YES/NO verdict on goal achievability
 *   5. Returns everything for the user to choose their preferred step-up
 */

const { runMonteCarloSimulation } = require('./monteCarlo');

/**
 * Mutual fund database — categorized by risk profile and investment horizon
 */
const MUTUAL_FUND_DATABASE = {
  // Conservative funds (low risk)
  conservative: [
    { name: 'SBI Magnum Gilt Fund', category: 'Debt - Gilt', expectedReturn: '6-7%', risk: 'Low', minSIP: 500, description: 'Government securities fund, ideal for capital preservation' },
    { name: 'HDFC Corporate Bond Fund', category: 'Debt - Corporate Bond', expectedReturn: '7-8%', risk: 'Low', minSIP: 500, description: 'High-quality corporate bonds with stable returns' },
    { name: 'ICICI Prudential Short Term Fund', category: 'Debt - Short Duration', expectedReturn: '6-7%', risk: 'Low', minSIP: 100, description: 'Short-term debt instruments, very low volatility' },
    { name: 'Axis Banking & PSU Debt Fund', category: 'Debt - Banking & PSU', expectedReturn: '6.5-7.5%', risk: 'Low', minSIP: 500, description: 'Banking & PSU debt securities with high credit quality' },
  ],
  // Balanced / Moderate funds
  moderate: [
    { name: 'Parag Parikh Flexi Cap Fund', category: 'Equity - Flexi Cap', expectedReturn: '12-15%', risk: 'Moderate', minSIP: 1000, description: 'Diversified across market caps and geographies' },
    { name: 'HDFC Balanced Advantage Fund', category: 'Hybrid - Balanced', expectedReturn: '10-12%', risk: 'Moderate', minSIP: 500, description: 'Dynamic allocation between equity and debt' },
    { name: 'Mirae Asset Large Cap Fund', category: 'Equity - Large Cap', expectedReturn: '11-14%', risk: 'Moderate', minSIP: 1000, description: 'Blue-chip large cap stocks with proven track record' },
    { name: 'Kotak Equity Hybrid Fund', category: 'Hybrid - Aggressive', expectedReturn: '10-13%', risk: 'Moderate', minSIP: 500, description: '65-80% equity with debt cushion for stability' },
    { name: 'UTI Nifty 50 Index Fund', category: 'Index Fund', expectedReturn: '10-12%', risk: 'Moderate', minSIP: 500, description: 'Low-cost Nifty 50 index tracking, great for beginners' },
  ],
  // Aggressive funds (high risk)
  aggressive: [
    { name: 'Quant Small Cap Fund', category: 'Equity - Small Cap', expectedReturn: '18-25%', risk: 'High', minSIP: 1000, description: 'High-growth small cap exposure with quant strategy' },
    { name: 'Nippon India Small Cap Fund', category: 'Equity - Small Cap', expectedReturn: '16-22%', risk: 'High', minSIP: 500, description: 'Diversified small cap portfolio with strong AUM' },
    { name: 'Axis Midcap Fund', category: 'Equity - Mid Cap', expectedReturn: '14-18%', risk: 'High', minSIP: 500, description: 'Quality mid-cap stocks with growth potential' },
    { name: 'Motilal Oswal Nasdaq 100 Fund', category: 'International - US Tech', expectedReturn: '15-20%', risk: 'High', minSIP: 500, description: 'Exposure to top US tech companies (Apple, Google, etc.)' },
    { name: 'SBI Small Cap Fund', category: 'Equity - Small Cap', expectedReturn: '16-22%', risk: 'High', minSIP: 500, description: 'Well-managed small cap fund with long track record' },
  ],
};

/**
 * Generate comprehensive AI analysis and recommendations
 * Now operates in two phases:
 *   Phase 1: Evaluate current plan (no step-up)
 *   Phase 2: If goal not reachable, generate step-up options with simulated outcomes
 */
function generateAIAnalysis({
  sip,
  years,
  goal,
  stepUp,          // Will be 0 on first run
  riskPreference,
  simulationResult,
  riskScoreResult,
  comparisonResult,
}) {
  const insights = [];
  const suggestions = [];
  let overallVerdict = '';
  let sentimentEmoji = '';

  const { average, probability, totalInvested, worstCase, bestCase } = simulationResult;
  const { riskScore, riskLevel } = riskScoreResult;
  const gap = goal - average;
  const gapPercentage = goal > 0 ? Math.round((gap / goal) * 100) : 0;

  // ═══════════════════════════════════════
  // CLEAR YES/NO GOAL VERDICT
  // ═══════════════════════════════════════
  const goalReachable = probability >= 65; // 65%+ = YES

  if (goalReachable) {
    overallVerdict = `YES — Your goal of ₹${goal.toLocaleString('en-IN')} is achievable! Your current SIP plan has a strong ${probability}% probability of success.`;
    sentimentEmoji = '✅';
    insights.push({
      type: 'success',
      title: '🎉 Goal is Reachable!',
      text: `With a ${probability}% success rate, your current SIP of ₹${sip.toLocaleString('en-IN')}/month is sufficient to reach ₹${goal.toLocaleString('en-IN')} in ${years} years. Keep investing consistently!`,
    });
  } else {
    overallVerdict = `NO — Your current SIP of ₹${sip.toLocaleString('en-IN')}/month alone is unlikely to reach ₹${goal.toLocaleString('en-IN')} in ${years} years (only ${probability}% chance). But don't worry — our AI has optimized step-up plans for you below!`;
    sentimentEmoji = '⚠️';
    insights.push({
      type: 'danger',
      title: '📉 Goal Not Reachable with Current Plan',
      text: `Your fixed SIP of ₹${sip.toLocaleString('en-IN')}/month gives only a ${probability}% chance of reaching ₹${goal.toLocaleString('en-IN')}. The expected value is ₹${average.toLocaleString('en-IN')}, which is ₹${Math.max(0, gap).toLocaleString('en-IN')} short. Scroll down to see AI-recommended step-up options!`,
    });
  }

  // ═══════════════════════════════════════
  // STEP-UP OPTIONS (only when goal not reachable)
  // ═══════════════════════════════════════
  let stepUpOptions = [];

  if (!goalReachable && stepUp === 0) {
    // Generate options at 10%, 15%, 20%, 25% of SIP
    const percentages = [10, 15, 20, 25];

    for (const pct of percentages) {
      const stepUpAmount = Math.ceil(sip * pct / 100);
      
      // Simulate this step-up option
      const simResult = runMonteCarloSimulation({
        sip,
        years,
        goal,
        stepUp: stepUpAmount,
        riskPreference,
        numSimulations: 1000, // Fewer for quick comparison
      });

      stepUpOptions.push({
        percentage: pct,
        amount: stepUpAmount,
        label: `${pct}% Step-up`,
        description: `Increase SIP by ₹${stepUpAmount.toLocaleString('en-IN')} every year`,
        projectedValue: simResult.average,
        probability: simResult.probability,
        totalInvested: simResult.totalInvested,
        goalReachable: simResult.probability >= 65,
        roi: simResult.totalInvested > 0
          ? Math.round(((simResult.average - simResult.totalInvested) / simResult.totalInvested) * 100)
          : 0,
      });
    }

    // Add custom affordable option at ₹500 flat if SIP is relatively high
    if (sip >= 3000) {
      const customStep = 500;
      const customSim = runMonteCarloSimulation({
        sip, years, goal, stepUp: customStep, riskPreference, numSimulations: 1000,
      });
      stepUpOptions.unshift({
        percentage: Math.round((customStep / sip) * 100),
        amount: customStep,
        label: '₹500 Fixed',
        description: `Increase SIP by ₹500 every year (most affordable)`,
        projectedValue: customSim.average,
        probability: customSim.probability,
        totalInvested: customSim.totalInvested,
        goalReachable: customSim.probability >= 65,
        roi: customSim.totalInvested > 0
          ? Math.round(((customSim.average - customSim.totalInvested) / customSim.totalInvested) * 100)
          : 0,
      });
    }

    // Find the minimum step-up needed to reach goal (>= 65% probability)
    let optimalOption = stepUpOptions.find(opt => opt.goalReachable);
    
    if (!optimalOption) {
      // Find an extreme step-up if standard ones fail, to show an unrealistic warning option
      const extremePcts = [40, 50, 75, 100, 150, 200, 300, 500];
      for (const pct of extremePcts) {
        const stepUpAmount = Math.ceil(sip * pct / 100);
        const simResult = runMonteCarloSimulation({
          sip, years, goal, stepUp: stepUpAmount, riskPreference, numSimulations: 500,
        });
        if (simResult.probability >= 65) {
          optimalOption = {
            percentage: pct,
            amount: stepUpAmount,
            label: `${pct}% Step-up ⚠️`,
            description: `Extreme Step-up Needed! Increase SIP by ₹${stepUpAmount.toLocaleString('en-IN')}/yr`,
            projectedValue: simResult.average,
            probability: simResult.probability,
            totalInvested: simResult.totalInvested,
            goalReachable: true,
            roi: simResult.totalInvested > 0 ? Math.round(((simResult.average - simResult.totalInvested) / simResult.totalInvested) * 100) : 0,
            unrealisticWarning: true
          };
          stepUpOptions.push(optimalOption);
          break;
        }
      }
    }

    if (optimalOption && optimalOption.unrealisticWarning) {
      insights.push({
        type: 'danger',
        title: '⚠️ Unrealistic Goal Detected',
        text: `Your goal is extremely aggressive for this timeline. You would need a massive ${optimalOption.label} to reach it, which is likely unsustainable. Please increase your base capital or extend your time horizon!`,
      });
    } else {
      insights.push({
        type: 'info',
        title: '💡 Step-up SIP Can Bridge The Gap',
        text: optimalOption
          ? `A ${optimalOption.label} (₹${optimalOption.amount.toLocaleString('en-IN')}/year increase) boosts your success probability to ${optimalOption.probability}%. Choose the option that fits your budget below!`
          : `Even with extreme step-ups, reaching ₹${goal.toLocaleString('en-IN')} in ${years} years is near impossible mathematically. Consider increasing your base SIP drastically or extending the duration.`,
      });
    }
  }

  // If user already selected a step-up (re-simulation), evaluate the chosen plan
  if (stepUp > 0) {
    if (goalReachable) {
      insights.push({
        type: 'success',
        title: '🎯 Step-up Plan Working!',
        text: `With your step-up of ₹${stepUp.toLocaleString('en-IN')}/year, your success probability has improved to ${probability}%. This plan is solid!`,
      });
    } else {
      insights.push({
        type: 'warning',
        title: '📊 Step-up Helps, But Not Enough',
        text: `Your step-up of ₹${stepUp.toLocaleString('en-IN')}/year improves things, but the probability is still at ${probability}%. Consider a higher step-up or increasing your base SIP.`,
      });
    }
  }

  // ═══════════════════════════════════════
  // SIP ADEQUACY CHECK
  // ═══════════════════════════════════════
  const requiredMonthlySIP = Math.ceil(goal / (years * 12));
  if (sip < requiredMonthlySIP * 0.7) {
    insights.push({
      type: 'danger',
      title: 'SIP Amount Too Low',
      text: `Your SIP of ₹${sip.toLocaleString('en-IN')}/month is quite low for your goal. Even without market returns, you'd need ₹${requiredMonthlySIP.toLocaleString('en-IN')}/month just to match the goal amount.`,
    });
    suggestions.push({
      action: 'Increase Base SIP',
      detail: `If possible, increase your monthly SIP to at least ₹${Math.ceil(requiredMonthlySIP * 0.9).toLocaleString('en-IN')}/month.`,
      impact: 'high',
    });
  }

  // ═══════════════════════════════════════
  // RISK ASSESSMENT ADVICE
  // ═══════════════════════════════════════
  if (riskScore > 70 && years <= 3) {
    suggestions.push({
      action: 'Reduce Risk for Short Duration',
      detail: 'For investment horizons under 3 years, aggressive portfolios carry significant risk. Consider shifting to a balanced approach.',
      impact: 'high',
    });
  } else if (riskScore < 25 && !goalReachable) {
    suggestions.push({
      action: 'Consider Slightly Higher Risk',
      detail: 'Your conservative portfolio limits growth potential. Shifting a portion to balanced mutual funds could improve returns without excessive risk.',
      impact: 'medium',
    });
  }

  // ═══════════════════════════════════════
  // DURATION ASSESSMENT
  // ═══════════════════════════════════════
  if (years < 3 && !goalReachable) {
    suggestions.push({
      action: 'Extend Investment Duration',
      detail: `Extending from ${years} to ${years + 2} years would give compounding more time to work, significantly improving your chances.`,
      impact: 'medium',
    });
  }

  // ═══════════════════════════════════════
  // BEST STRATEGY HIGHLIGHT
  // ═══════════════════════════════════════
  if (comparisonResult && comparisonResult.strategies) {
    const best = comparisonResult.strategies.find(s => s.id === comparisonResult.bestStrategy);
    if (best) {
      insights.push({
        type: 'success',
        title: `⭐ Best Strategy: ${best.name}`,
        text: `Among all strategies, "${best.name}" gives the best outcome with ₹${best.finalValue.toLocaleString('en-IN')} average return and ${best.probability}% success probability.`,
      });
    }
  }

  // ═══════════════════════════════════════
  // MUTUAL FUND SUGGESTIONS
  // ═══════════════════════════════════════
  const suggestedFunds = generateMutualFundSuggestions({
    sip, years, goal, riskPreference, probability, gap, goalReachable,
  });

  // ═══════════════════════════════════════
  // BUILD RECOMMENDATION TEXT
  // ═══════════════════════════════════════
  const recommendation = buildRecommendation({
    sip, goal, probability, stepUp, riskLevel, average, gap, gapPercentage, years, goalReachable,
  });

  return {
    overallVerdict,
    sentimentEmoji,
    goalReachable,
    recommendation,
    insights,
    suggestions,
    stepUpOptions,
    suggestedFunds,
    summary: {
      totalInvested,
      expectedReturn: average,
      gap: Math.max(0, gap),
      roi: totalInvested > 0 ? Math.round(((average - totalInvested) / totalInvested) * 100) : 0,
    },
  };
}

/**
 * Generate mutual fund suggestions based on user profile
 */
function generateMutualFundSuggestions({ sip, years, goal, riskPreference, probability, gap, goalReachable }) {
  const suggestions = [];

  // Primary allocation based on risk preference
  const riskMap = { low: 'conservative', medium: 'moderate', high: 'aggressive' };
  const primaryCategory = riskMap[riskPreference] || 'moderate';
  const primaryFunds = MUTUAL_FUND_DATABASE[primaryCategory] || [];

  // Pick top 3 primary funds
  const selected = primaryFunds.slice(0, 3).map(fund => ({
    ...fund,
    allocation: 'Primary',
    allocationPercent: 70,
  }));
  suggestions.push(...selected);

  // If goal not reachable, suggest adding growth-oriented funds
  if (!goalReachable && riskPreference !== 'high') {
    const growthFunds = MUTUAL_FUND_DATABASE.moderate.slice(0, 2).map(fund => ({
      ...fund,
      allocation: 'Growth Booster',
      allocationPercent: 20,
    }));
    suggestions.push(...growthFunds);
  }

  // Add one stable/debt fund for diversification (if not already conservative)
  if (riskPreference !== 'low') {
    const stableFund = {
      ...MUTUAL_FUND_DATABASE.conservative[0],
      allocation: 'Stability',
      allocationPercent: 10,
    };
    suggestions.push(stableFund);
  }

  // Build portfolio allocation advice
  let allocationAdvice = '';
  if (years <= 2) {
    allocationAdvice = 'For your short duration, keep 70% in debt funds and 30% in balanced funds for safety.';
  } else if (years <= 5) {
    allocationAdvice = 'A balanced mix of 60% equity funds and 40% debt/hybrid funds suits your 3-5 year horizon.';
  } else if (years <= 10) {
    allocationAdvice = 'With 5-10 years, you can go 70-80% equity and 20-30% debt for optimal growth.';
  } else {
    allocationAdvice = 'With 10+ years, maximize equity at 85-90% for compounding power. Keep 10-15% in debt for rebalancing.';
  }

  return {
    funds: suggestions,
    allocationAdvice,
    portfolioSplit: getPortfolioSplit(riskPreference, years),
  };
}

/**
 * Get recommended portfolio split percentages
 */
function getPortfolioSplit(riskPreference, years) {
  if (riskPreference === 'low') {
    return { equity: 20, debt: 60, hybrid: 20 };
  } else if (riskPreference === 'medium') {
    if (years <= 3) return { equity: 40, debt: 40, hybrid: 20 };
    if (years <= 7) return { equity: 60, debt: 25, hybrid: 15 };
    return { equity: 70, debt: 20, hybrid: 10 };
  } else {
    if (years <= 3) return { equity: 60, debt: 20, hybrid: 20 };
    if (years <= 7) return { equity: 75, debt: 15, hybrid: 10 };
    return { equity: 85, debt: 10, hybrid: 5 };
  }
}

/**
 * Build a human-readable recommendation paragraph
 */
function buildRecommendation({ sip, goal, probability, stepUp, riskLevel, average, gap, gapPercentage, years, goalReachable }) {
  let rec = '';

  if (goalReachable) {
    rec = `Great news! Your SIP of ₹${sip.toLocaleString('en-IN')}/month over ${years} years has a ${probability}% chance of reaching your goal of ₹${goal.toLocaleString('en-IN')}. `;
    if (stepUp > 0) {
      rec += `Your step-up of ₹${stepUp.toLocaleString('en-IN')}/year is boosting your success significantly. `;
    }
    rec += 'Stay consistent, and your goal is well within reach!';
  } else {
    rec = `Your current SIP of ₹${sip.toLocaleString('en-IN')}/month has only a ${probability}% chance of reaching ₹${goal.toLocaleString('en-IN')} in ${years} years. `;
    rec += `The expected value of ₹${average.toLocaleString('en-IN')} falls short by ₹${Math.max(0, gap).toLocaleString('en-IN')}. `;
    
    if (stepUp === 0) {
      rec += 'The most effective solution is to add a step-up SIP — increasing your monthly investment annually as your income grows. ';
      rec += 'Choose a step-up percentage below that fits your budget to see the projected improvement.';
    } else {
      rec += `Your current step-up of ₹${stepUp.toLocaleString('en-IN')}/year helps but isn't quite enough. Consider a higher step-up or increasing your base SIP.`;
    }
  }

  return rec;
}

module.exports = { generateAIAnalysis };
