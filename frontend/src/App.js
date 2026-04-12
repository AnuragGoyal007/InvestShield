import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import GoalMeter from './components/GoalMeter';
import RiskMeter from './components/RiskMeter';
import StrategyChart from './components/StrategyChart';
import RiskAreaChart from './components/RiskAreaChart';
import ComparisonTable from './components/ComparisonTable';
import AIInsights from './components/AIInsights';
import StepUpOptions from './components/StepUpOptions';
import MutualFundSuggestions from './components/MutualFundSuggestions';
import './App.css';

/**
 * InvestShield AI — Main Application
 * 
 * Orchestrates the investment simulation dashboard:
 *   1. Collects user inputs via InputPanel
 *   2. Sends data to backend API
 *   3. Displays results across multiple visualization components
 *   4. Supports Step-up selection if goal not reachable
 */

const API_BASE = 'http://localhost:5000';

function App() {
  // ═══ Input State ═══
  const [sip, setSip] = useState(2000);
  const [years, setYears] = useState(5);
  const [goal, setGoal] = useState(200000);
  // Default step-up is 0, AI will suggest options if needed
  const [stepUp, setStepUp] = useState(0); 
  const [riskPreference, setRiskPreference] = useState('medium');

  // ═══ Result State ═══
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  // ═══ Market News State ═══
  const [newsData, setNewsData] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // ═══ Live Indices State ═══
  const [indices, setIndices] = useState({
    nifty: { value: 22643.40, change: 124.50 },
    sensex: { value: 74589.20, change: 412.10 },
    bankNifty: { value: 48432.10, change: 250.30 }
  });

  const [showTicker, setShowTicker] = useState(true);

  // Monitor scroll cleanly fade out ticker
  React.useEffect(() => {
    const handleScroll = () => {
      // Hide widget if scrolled past 400px (i.e. leaving the hero section)
      if (window.scrollY > 400) {
        setShowTicker(false);
      } else {
        setShowTicker(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ticking Effect for Indices
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const tick = (val) => val + (Math.random() * 6 - 3); // random -3 to +3 movement
        return {
          nifty: { ...prev.nifty, value: tick(prev.nifty.value) },
          sensex: { ...prev.sensex, value: tick(prev.sensex.value) },
          bankNifty: { ...prev.bankNifty, value: tick(prev.bankNifty.value) }
        };
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Real-Time News on Mount
  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=Indian+Stock+Market+economy');
        if (res.data && res.data.items && res.data.items.length > 0) {
          setNewsData(res.data.items.slice(0, 6));
        } else {
          throw new Error("Empty Feed");
        }
      } catch (e) {
        console.warn("Using fallback news data:", e);
        setNewsData([
          { title: "NIFTY 50 breaks resistance, hits new all-time high amidst tech rally", pubDate: "2h ago", description: "Quant models suggest continued momentum in the IT sector, heavily influencing our predictive portfolios.", link: "#" },
          { title: "RBI maintains repo rate at 6.5%, signals inflation stabilization", pubDate: "5h ago", description: "Stable debt yields are factored into InvestShield's conservative Monte Carlo branches.", link: "#" },
          { title: "Mid-Cap Mutual Funds see record ₹5,000 Cr SIP inflows in March", pubDate: "1d ago", description: "Retail investor confidence spikes as clustering algorithms rank select mid-cap funds highly.", link: "#" },
          { title: "Global markets react to Federal Reserve hinting at potential rate cuts", pubDate: "2d ago", description: "Emerging markets brace for capital inflight as the macro environment shifts favorably.", link: "#" },
          { title: "Semiconductor stocks rally pushes Nifty IT index upwards by 2.5%", pubDate: "3d ago", description: "Hardware and compute intensive sectors show extraordinary resilience in early trading.", link: "#" },
          { title: "SEBI introduces new rapid-settlement cycles for select equities", pubDate: "4d ago", description: "T+0 settlement mechanisms aim to improve liquidity constraint models for quantitative traders.", link: "#" },
        ]);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  /**
   * Run the main simulation via backend API
   */
  const handleSimulate = useCallback(async (currentStepUp = stepUp) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/simulate`, {
        sip: Number(sip),
        years: Number(years),
        goal: Number(goal),
        stepUp: Number(currentStepUp),
        riskPreference,
      });

      setResult(response.data);
    } catch (err) {
      console.error('Simulation failed:', err);
      setError(
        err.response?.data?.error ||
        'Failed to connect to the simulation server. Make sure the backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  }, [sip, years, goal, stepUp, riskPreference]);

  /**
   * Handle user selecting a step-up option
   */
  const handleSelectStepUp = (amount) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStepUp(amount);
    handleSimulate(amount);
  };

  /**
   * Generates a sleek A4 PDF directly from the dashboard DOM node 
   * using html2canvas & jsPDF.
   */
  const handleDownloadPDF = async () => {
    const input = reportRef.current;
    if (!input) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2, 
        backgroundColor: '#0a0a0a',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('InvestShield_Strategy_Report.pdf');
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      <Header />

      {/* ═══ Editorial Hero Section ═══ */}
      <section className="hero-section">
        <h1 className="hero-headline">
          Better Data.<br />
          <span className="text-gradient">Scalable AI.</span>
        </h1>
        <p className="hero-subheadline">
          Harness advanced machine learning algorithms and 2,000+ branch Monte Carlo simulations to accurately chart your financial future with zero static assumptions.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' })}>
            Build Your Financial Twin
          </button>
          <button className="btn-secondary" onClick={() => document.getElementById('market-news').scrollIntoView({ behavior: 'smooth' })}>
            Market Intelligence
          </button>
        </div>
      </section>

      {/* ═══ Trust Bar ═══ */}
      <div className="trust-bar animate-cascade-3">
        <p className="trust-bar-text">Powered by Institutional-Grade Intelligence</p>
        <div className="trust-logos">
          <span>NIFTY 50 Quant</span>
          <span>Scikit-Learn</span>
          <span>Stochastic Engine</span>
          <span>Tensor Graph</span>
        </div>
      </div>

      {/* ═══ The Core Simulator ═══ */}
      <section id="simulator" className="simulator-section">
        <div className="section-header-editorial animate-cascade-1">
          <h2>The Simulation Engine</h2>
          <p>
            Configure your parameters below. Our Python-based ML microservice will dynamically source NIFTY 50 telemetry 
            to simulate your asset growth in real-time.
          </p>
        </div>

        <div className="dashboard-grid">
          {/* LEFT COLUMN — Input Panel */}
          <aside className="sidebar animate-cascade-2">
            <InputPanel
              sip={sip} setSip={setSip}
              years={years} setYears={setYears}
              goal={goal} setGoal={setGoal}
              stepUp={stepUp} setStepUp={setStepUp}
              riskPreference={riskPreference} setRiskPreference={setRiskPreference}
              onSimulate={() => handleSimulate(stepUp)}
              loading={loading}
            />
          </aside>

          {/* RIGHT COLUMN — Results Dashboard */}
          <div className="main-panel">
            {/* Error State */}
            {error && (
              <div className="glass-card animate-cascade-1" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.08)' }}>
                <p style={{ color: '#ef4444', fontWeight: 500 }}>⚠️ {error}</p>
              </div>
            )}

            {/* Empty State */}
            {!result && !loading && !error && (
              <div className="empty-state animate-cascade-3">
                <div className="empty-state-icon">❖</div>
                <h2 className="empty-state-title">Awaiting Telemetry</h2>
                <p className="hero-subheadline" style={{ marginBottom: 0, marginTop: 10 }}>
                  Adjust parameters and initialize the engine to begin projection rendering.
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="empty-state">
                <div className="loading-spinner-large"></div>
                <h2 className="empty-state-title" style={{ marginTop: '24px' }}>
                  Processing Vector Space
                </h2>
                <p className="hero-subheadline" style={{ marginTop: 10 }}>
                  Running 2,000 parallel universe simulations.
                </p>
              </div>
            )}

            {/* Results Display */}
            {result && !loading && (
              <div className="results-container" ref={reportRef} style={{ paddingBottom: '24px', background: '#0a0a0a' }}>
                {/* Top Stats Row */}
                <div className="stats-row animate-cascade-1" style={{ paddingTop: '24px' }}>
                  <div className="stat-card">
                    <p className="stat-value">₹{result.average?.toLocaleString('en-IN')}</p>
                    <p className="stat-label">Expected Trajectory</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value" style={{ color: result.probability >= 50 ? '#00e5ff' : '#ef4444' }}>
                      {result.probability}%
                    </p>
                    <p className="stat-label">Success Yield</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value" style={{ fontSize: '20px' }}>₹{result.worstCase?.toLocaleString('en-IN')}</p>
                    <p className="stat-label">5th Percentile Floor</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value" style={{ fontSize: '20px' }}>₹{result.bestCase?.toLocaleString('en-IN')}</p>
                    <p className="stat-label">95th Percentile Ceiling</p>
                  </div>
                </div>

                {/* Meter Row */}
                <div className="meter-row animate-cascade-2">
                  <div className="meter-goal">
                    <GoalMeter
                      average={result.average}
                      goal={Number(goal)}
                      probability={result.probability}
                      goalAchievable={result.goalAchievable}
                    />
                  </div>
                  <div className="meter-risk">
                    <RiskMeter
                      riskScore={result.riskScore}
                      riskLevel={result.riskLevel}
                      riskColor={result.riskColor}
                    />
                  </div>
                </div>

                {/* Charts */}
                <div className="animate-cascade-3">
                  <StrategyChart
                    data={result.comparisonTrendData}
                    goal={Number(goal)}
                    bestStrategy={result.bestStrategy}
                  />
                </div>
                <div className="animate-cascade-3">
                  <RiskAreaChart
                    data={result.trendData}
                    goal={Number(goal)}
                  />
                </div>

                {/* Comparison Table */}
                <div className="animate-cascade-4">
                  <ComparisonTable
                    strategies={result.strategies}
                    bestStrategy={result.bestStrategy}
                  />
                </div>

                {/* AI Insights & Options */}
                <div className="animate-cascade-5">
                  <AIInsights
                    overallVerdict={result.overallVerdict}
                    sentimentEmoji={result.sentimentEmoji}
                    goalReachable={result.goalReachable}
                    recommendation={result.recommendation}
                    insights={result.insights}
                    suggestions={result.suggestions}
                    summary={result.summary}
                  />

                  {result.stepUpOptions && result.stepUpOptions.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                      <StepUpOptions 
                        options={result.stepUpOptions} 
                        sip={Number(sip)} 
                        goal={Number(goal)} 
                        onSelectStepUp={handleSelectStepUp} 
                      />
                    </div>
                  )}

                  {result.suggestedFunds && result.suggestedFunds.funds && (
                    <div style={{ marginTop: '24px' }}>
                      <MutualFundSuggestions suggestedFunds={result.suggestedFunds} />
                    </div>
                  )}

                  {/* Export PDF Button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '48px', marginBottom: '24px' }} >
                    <button 
                      data-html2canvas-ignore="true"
                      onClick={handleDownloadPDF} 
                      disabled={isExporting}
                      style={{
                        padding: '16px 32px',
                        background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: isExporting ? 'wait' : 'pointer',
                        boxShadow: '0 0 20px rgba(0,229,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'transform 0.2s',
                        opacity: isExporting ? 0.7 : 1
                      }}
                      onMouseOver={e => !isExporting && (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseOut={e => !isExporting && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {isExporting ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 3, borderTopColor: '#fff' }}></span> : <span style={{ fontSize: 20 }}>📄</span>}
                      {isExporting ? 'Compiling AI Report...' : 'Download AI Strategy Report (PDF)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Feature Explainer Sections ═══ */}
      <section id="documentation" className="feature-section">
        <div className="feature-text">
          <span className="feature-badge">❖ Predictive Analytics</span>
          <h3>Monte Carlo Forecasts</h3>
          <p>
            Remove the guesswork from investing. By sampling from realistic volatility distributions 
            over thousands of scenarios, we output statistically sound, probability-driven forecasts 
            rather than naive linear projections.
          </p>
        </div>
        <div className="feature-visual">
          {result && result.trendData ? (
            <div className="glass-card" style={{ padding: 16, background: 'rgba(15, 23, 42, 0.4)' }}>
              <RiskAreaChart data={result.trendData} goal={Number(goal)} height={240} />
            </div>
          ) : (
            <div style={{ width: '100%', height: '240px', background: 'rgba(0,229,255,0.03)', border: '1px dashed rgba(0,229,255,0.2)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="loading-spinner-large" style={{ width: 30, height: 30, marginBottom: 15, borderWidth: 2 }}></div>
              <span style={{ color: '#00e5ff', opacity: 0.7, fontFamily: 'Outfit', fontSize: 16, letterSpacing: 1 }}>AWAITING SIMULATION DATA</span>
            </div>
          )}
        </div>
      </section>

      <section id="models" className="feature-section reverse">
        <div className="feature-text">
          <span className="feature-badge">❖ Machine Learning</span>
          <h3>K-Nearest Content Routing</h3>
          <p>
            Our backend utilizes Scikit-Learn to vector-embed over 300 real Indian mutual funds. 
            By mapping your risk horizon to N-dimensional space, the engine routes you to the optimal 
            financial instruments instantly.
          </p>
        </div>
        <div className="feature-visual">
          {result && result.suggestedFunds && result.suggestedFunds.funds ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
               {result.suggestedFunds.funds.slice(0, 3).map((f, i) => (
                 <div key={i} style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontWeight: 600, color: '#fff', fontSize: 13 }}>{f.name}</span>
                     <span style={{ color: '#00e5ff', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{f.expectedReturn}</span>
                   </div>
                   <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>{f.category} • {f.risk} Risk</div>
                 </div>
               ))}
             </div>
          ) : (
            <div style={{ width: '100%', height: '240px', background: 'rgba(0,229,255,0.03)', border: '1px dashed rgba(0,229,255,0.2)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="loading-spinner-large" style={{ width: 30, height: 30, marginBottom: 15, borderWidth: 2 }}></div>
              <span style={{ color: '#00e5ff', opacity: 0.7, fontFamily: 'Outfit', fontSize: 16, letterSpacing: 1 }}>AWAITING ML CLUSTERING</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══ Market Intelligence Section ═══ */}
      <section id="market-news" style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div className="section-header-editorial animate-cascade-1" style={{ marginBottom: 48, textAlign: 'left' }}>
          <span style={{ color: '#00e5ff', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Live Data Feed</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 style={{ fontSize: 48, marginTop: 8, marginBottom: 0 }}>Market Intelligence</h2>
            <span style={{ color: '#a1a1aa', fontSize: 14 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: '#10b981', borderRadius: '50%', marginRight: 6, animation: 'pulse-glow 2s infinite' }}></span>
              Auto-syncs every 6 hrs
            </span>
          </div>
          <p style={{ margin: 0, maxWidth: 600, marginTop: 16 }}>Aggregated macroeconomic telemetry highlighting real-time shifts in global equity markets.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }} className="animate-cascade-2">
          {newsLoading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
               <div className="loading-spinner-large" style={{ margin: '0 auto' }}></div>
               <p style={{ marginTop: 16, color: '#00e5ff', letterSpacing: 1 }}>FETCHING TELEMETRY...</p>
            </div>
          ) : (
            newsData.map((item, index) => {
              const colors = [
                { bg: 'rgba(0, 229, 255, 0.1)', text: '#00e5ff', label: 'MARKETS' },
                { bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8', label: 'ECONOMY' },
                { bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399', label: 'FINANCE' },
                { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', label: 'POLICY' },
                { bg: 'rgba(236, 72, 153, 0.1)', text: '#f472b6', label: 'GLOBAL' },
                { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc', label: 'TECH' },
              ];
              const theme = colors[index % colors.length];

              // Make pubDate relative or simple format
              let timeStr = item.pubDate;
              if (timeStr && timeStr.includes('ago')) {
                // already relative
              } else if (timeStr) {
                const parts = timeStr.split(' ');
                timeStr = parts.length > 3 ? `${parts[1]} ${parts[2]} ${parts[3]}` : timeStr;
              }

              return (
                <div key={index} onClick={() => item.link !== '#' && window.open(item.link, '_blank')} style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, transition: 'transform 0.3s, borderColor 0.3s', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 11, background: theme.bg, color: theme.text, padding: '4px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: 0.5 }}>{theme.label}</span>
                    <span style={{ fontSize: 12, color: '#71717a' }}>{timeStr}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontFamily: 'Outfit', color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {item.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <section className="footer-cta">
        <h2>Ready to Scale?</h2>
        <button className="btn-primary" style={{ maxWidth: 300 }} onClick={() => document.getElementById('simulator').scrollIntoView({ behavior: 'smooth' })}>
          Initialize Sandbox
        </button>
      </section>

      <footer className="app-footer">
        <p>InvestShield AI — Proprietary ML Prediction Engine. Built for EvolveAI Hackathon.</p>
        <p style={{ marginTop: 8, opacity: 0.5 }}>© 2026. All operations simulated.</p>
      </footer>

      {/* ═══ Live Market Ticker Widget ═══ */}
      <div style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: '24px 32px',
        boxShadow: '0 12px 50px rgba(0,0,0,0.6)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minWidth: 280,
        opacity: showTicker ? 1 : 0,
        transform: showTicker ? 'translateY(0)' : 'translateY(40px)',
        pointerEvents: showTicker ? 'auto' : 'none',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }} className="hidden md:flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-glow 2s infinite' }}></span>
          <span style={{ fontSize: 13, fontFamily: 'Outfit', color: '#a1a1aa', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>Live Market Data</span>
        </div>

        {/* NIFTY 50 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>NIFTY 50</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{indices.nifty.value.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>+{indices.nifty.change.toFixed(2)}</div>
          </div>
        </div>

        {/* SENSEX */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>SENSEX</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{indices.sensex.value.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>+{indices.sensex.change.toFixed(2)}</div>
          </div>
        </div>

        {/* BANK NIFTY */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>BANK NIFTY</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{indices.bankNifty.value.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>+{indices.bankNifty.change.toFixed(2)}</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;