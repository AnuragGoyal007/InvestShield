/**
 * InvestShield AI — Portfolio Analysis Module
 * 
 * Provides an analysis of an imported holdings portfolio, including:
 * - Health Score (/100)
 * - Diversification Metric
 * - Risk Assessment
 * - AI Generated Actions (Buy/Sell/Hold)
 */

// A simple deterministic sector mapper since many Indian CSVs don't have this.
const SECTOR_MAP = {
  'TCS': 'Technology',
  'INFY': 'Technology',
  'HCLTECH': 'Technology',
  'WIPRO': 'Technology',
  'RELIANCE': 'Energy & Telecom',
  'HDFCBANK': 'Financials',
  'ICICIBANK': 'Financials',
  'SBIN': 'Financials',
  'AXISBANK': 'Financials',
  'ITC': 'Consumer Goods',
  'HUN': 'Consumer Goods',
  'TATOMAC': 'Automobile',
  'MARUTI': 'Automobile',
  'M&M': 'Automobile',
  'LT': 'Infrastructure',
  'SUNPHARMA': 'Pharmaceuticals',
  'CIPLA': 'Pharmaceuticals'
};

function inferSector(stockName) {
  const upper = stockName.toUpperCase();
  for (const [key, sector] of Object.entries(SECTOR_MAP)) {
    if (upper.includes(key)) return sector;
  }
  return 'Other/Diversified';
}

/**
 * Robust numerical parser to handle "1,200.50", "₹500", etc.
 */
function cleanNumericString(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/₹/g, '').replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

function analyzePortfolio(holdings) {
  let totalValue = 0;
  let totalInvested = 0;
  let sectorAllocation = {};

  // 1. Process array with robust normalizer
  holdings.forEach(item => {
    // Normalize keys (lower case, remove extra spaces)
    const normalized = {};
    for (const k in item) {
      if (item.hasOwnProperty(k)) {
        const cleanKey = k.toLowerCase().replace(/\s+/g, '').replace(/\W/g, '');
        normalized[cleanKey] = item[k];
      }
    }

    // Skip empty rows
    if (Object.keys(normalized).length === 0) return;

    // Map common CSV messy headers
    let name = normalized.stock || normalized.name || normalized.ticker || normalized.symbol || normalized.instrument || normalized.script || normalized.scrip || normalized.company || 'Unknown';
    if (typeof name === 'string' && (name.trim() === '' || name.toLowerCase().includes('total'))) return; // Ignore aggregate rows
    if (name === 'Unknown') name = 'Other Asset';

    const currentPrice = cleanNumericString(normalized.currentprice || normalized.price || normalized.ltp || normalized.nav);
    const shares = cleanNumericString(normalized.quantity || normalized.shares || normalized.qty || normalized.units || normalized.balance);
    const avgPrice = cleanNumericString(normalized.avgprice || normalized.avgcost || normalized.buyprice || normalized.averageprice || normalized.buyavg);

    // Value calculation fallback
    const value = (currentPrice * shares) || cleanNumericString(normalized.currentvalue || normalized.value || normalized.presentvalue || normalized.amount);
    const costBasis = (avgPrice * shares) || cleanNumericString(normalized.investedvalue || normalized.totalcost || normalized.investment || normalized.investedamount || normalized.principal);

    if (value === 0 && costBasis === 0) return;

    totalValue += value;
    totalInvested += costBasis;

    const sector = normalized.sector || inferSector(name);
    if (!sectorAllocation[sector]) {
      sectorAllocation[sector] = 0;
    }
    sectorAllocation[sector] += value;
  });

  if (totalValue === 0) {
    return {
      error: "No valid financial data could be extracted. Please ensure your CSV contains standard headers like 'Script/Name' and 'Current Value', 'Invested Value', or 'Quantity' and 'Price'."
    };
  }

  // Calculate sector percentages
  let maxConcentration = 0;
  const sectorData = Object.keys(sectorAllocation).map(sector => {
    const amount = sectorAllocation[sector];
    const percentage = ((amount / totalValue) * 100).toFixed(2);
    if (Number(percentage) > maxConcentration) {
      maxConcentration = Number(percentage);
    }
    return { name: sector, value: amount, percentage: Number(percentage) };
  });

  // 2. Compute Health Score (0-100)
  let healthScore = 85; 
  let risks = [];
  
  if (Object.keys(sectorAllocation).length < 3 && totalValue > 10000) {
    healthScore -= 15;
    risks.push("Low sector diversification");
  }
  if (maxConcentration > 40) {
    healthScore -= 10;
    risks.push(`Over-exposed to a single sector (${maxConcentration}% concentration)`);
  }
  if (healthScore > 100) healthScore = 100;

  // 3. Risk Level
  let riskLevel = "Medium";
  let diversificationScore = "Very Good";
  if (maxConcentration > 50) {
    riskLevel = "High";
    diversificationScore = "Poor";
  } else if (maxConcentration < 20 && Object.keys(sectorAllocation).length >= 5) {
    riskLevel = "Low";
    diversificationScore = "Excellent";
  }

  // 4. Generate Recommended Actions
  let recommendations = [];
  if (maxConcentration > 50) {
    const topSector = sectorData.sort((a,b) => b.percentage - a.percentage)[0].name;
    recommendations.push(
      `Sell 15-20% of your ${topSector} holdings to securely lock in gains, and reinvest into Broad Index Funds to reduce concentration risk.`
    );
  } else {
    recommendations.push('Hold current assets; your sectoral allocation looks statistically sound.');
  }
  
  if (!sectorData.some(s => s.name === "Financials")) {
    recommendations.push('Consider buying banking or financial ETFs (like Bank Nifty) as they historically form the backbone of the Indian growth story.');
  }

  const overallProfit = totalValue - totalInvested;
  if (overallProfit > 100000) {
    recommendations.push('Tax-Loss Harvesting Alert: You have significant unrealized gains. Consider booking some profits up to ₹1 Lakh to utilize the tax-free LTCG limit (if applicable).');
  } else if (overallProfit < -10000) {
    recommendations.push('Opportunity: Consider tax-loss harvesting by booking some depreciated volatile stocks to offset future gains.');
  }

  // 5. Savings Strategy Framework
  const savingsStrategy = {
    framework: riskLevel === 'High' ? 'Aggressive Satellite Split' : riskLevel === 'Medium' ? 'Core-Satellite Split' : 'Capital Preservation Split',
    allocations: riskLevel === 'High' 
        ? [ { bucket: 'Core Equity', percentage: 50, detail: 'Nifty 50 / Large Cap Funds' }, { bucket: 'Satellite Growth', percentage: 40, detail: 'Small/Mid Caps & Thematic' }, { bucket: 'Hedge/Debt', percentage: 10, detail: 'Liquid Funds or Gold' } ]
        : riskLevel === 'Medium'
        ? [ { bucket: 'Core Index', percentage: 60, detail: 'Broad Market Index Funds' }, { bucket: 'Satellite Equity', percentage: 20, detail: 'Flexi Cap / Mid Cap' }, { bucket: 'Stability', percentage: 20, detail: 'Short Duration Debt' } ]
        : [ { bucket: 'Stability/Debt', percentage: 60, detail: 'Corporate Bonds, FDs' }, { bucket: 'Core Equity', percentage: 30, detail: 'Large Cap Blue-chips' }, { bucket: 'Hedge', percentage: 10, detail: 'Gold ETFs' } ],
    recommendation: 'Automate this division using multiple SIPs on payday to build wealth systematically without emotion.'
  };

  // Add beginner friendly explanations
  const beginnerExplanation = "Your Portfolio Health Score acts like a credit score for your investments. A score of 80+ is great! If you have too many eggs in one basket (one sector), your score drops. By spreading your investments (diversifying), you lower your chances of sudden losses.";

  return {
    totalValue,
    totalInvested,
    overallProfit,
    healthScore,
    riskLevel,
    diversificationScore,
    sectorData,
    risks,
    recommendations,
    savingsStrategy,
    beginnerExplanation,
    improvedPortfolio: sectorData.map(s => {
      // Create a theoretical better balance
      if (s.percentage > 30) return { ...s, projectedPercentage: (s.percentage * 0.8).toFixed(1), action: 'Trim (Sell Some)' };
      if (s.percentage < 5) return { ...s, projectedPercentage: (s.percentage * 1.5).toFixed(1), action: 'Increase (Buy More)' };
      return { ...s, projectedPercentage: s.percentage, action: 'Hold' };
    })
  };
}

module.exports = {
  analyzePortfolio
};
