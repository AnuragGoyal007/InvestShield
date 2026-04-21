import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ML_BASE = process.env.REACT_APP_ML_URL || 'http://127.0.0.1:8000';

const formatMarketCap = (val) => {
  if (!val) return 'N/A';
  if (val >= 1e12) return `₹${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `₹${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)}Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)}L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const formatVolume = (val) => {
  if (!val) return 'N/A';
  if (val >= 1e7) return `${(val / 1e7).toFixed(2)}Cr`;
  if (val >= 1e5) return `${(val / 1e5).toFixed(2)}L`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`;
  return val.toLocaleString('en-IN');
};

const PERIOD_OPTIONS = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
];

export default function StockMarket() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quote, setQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('1mo');
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [chartType, setChartType] = useState('area'); // 'area' or 'volume'
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch trending stocks on mount + auto-refresh every 60s
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${ML_BASE}/api/stock/trending`);
        setTrending(res.data.stocks || []);
      } catch (err) {
        console.warn('Failed to fetch trending stocks');
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
    const interval = setInterval(fetchTrending, 60000);
    return () => clearInterval(interval);
  }, []);

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(`${ML_BASE}/api/stock/search?q=${searchQuery}`);
        setSearchResults(res.data.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Search failed');
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Fetch stock quote
  const fetchQuote = useCallback(async (symbol) => {
    setLoading(true);
    try {
      const res = await axios.get(`${ML_BASE}/api/stock/quote?symbol=${symbol}`);
      setQuote(res.data);
      setSelectedStock(symbol);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Quote fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh quote every 15 seconds when a stock is selected
  useEffect(() => {
    if (!selectedStock) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${ML_BASE}/api/stock/quote?symbol=${selectedStock}`);
        setQuote(res.data);
        setLastUpdated(new Date());
      } catch (err) {
        console.warn('Auto-refresh quote failed');
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  // Fetch historical data
  const fetchHistory = useCallback(async (symbol, p) => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${ML_BASE}/api/stock/history?symbol=${symbol}&period=${p}`);
      setHistory(res.data.data || []);
    } catch (err) {
      console.error('History fetch failed:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // When stock is selected
  const handleSelectStock = (symbol) => {
    setSearchQuery('');
    setShowDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchQuote(symbol);
    fetchHistory(symbol, period);
  };

  // When period changes
  useEffect(() => {
    if (selectedStock) {
      fetchHistory(selectedStock, period);
    }
  }, [period, selectedStock, fetchHistory]);

  const isPositive = quote && quote.change >= 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05080f',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: '#fff',
    }}>

      {/* ─── Header / Nav Bar ─── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5, 8, 15, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '8px 16px', color: '#a1a1aa', cursor: 'pointer',
              fontSize: 14, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#a1a1aa'; }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            <span style={{ color: '#00e5ff' }}>Stock</span> Terminal
          </h1>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: 420 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, padding: '10px 16px', transition: 'all 0.3s',
          }}>
            <span style={{ color: '#71717a', fontSize: 18 }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks... (e.g. RELIANCE, TCS, INFY)"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 15, fontFamily: 'Outfit', width: '100%',
              }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: 16 }}>✕</button>
            )}
          </div>

          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
              background: 'rgba(15, 20, 30, 0.98)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', zIndex: 200,
            }}>
              {searchResults.map((s, i) => (
                <div key={i} onClick={() => handleSelectStock(s.symbol)}
                  style={{
                    padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,229,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.symbol.replace('.NS', '').replace('.BO', '')}</div>
                    <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{s.name}</div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6,
                    background: s.exchange === 'NSE' ? 'rgba(0,229,255,0.12)' : 'rgba(168,85,247,0.12)',
                    color: s.exchange === 'NSE' ? '#00e5ff' : '#a855f7', fontWeight: 600,
                  }}>{s.exchange}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-glow 2s infinite' }}></span>
          <span style={{ fontSize: 12, color: '#71717a', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
            Yahoo Finance API
          </span>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Stock Detail View */}
        {quote && !quote.error ? (
          <div style={{ marginBottom: 40 }}>
            {/* Quote Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: 32, flexWrap: 'wrap', gap: 20,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: '#fff' }}>
                    {quote.symbol?.replace('.NS', '').replace('.BO', '')}
                  </h2>
                  <span style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 8,
                    background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontWeight: 600,
                  }}>{quote.exchange}</span>
                  <span style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 8,
                    background: quote.marketState === 'REGULAR' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: quote.marketState === 'REGULAR' ? '#10b981' : '#f59e0b', fontWeight: 600,
                  }}>{quote.marketState === 'REGULAR' ? '● LIVE' : '● CLOSED'}</span>
                </div>
                <div style={{ fontSize: 14, color: '#71717a', marginBottom: 4 }}>{quote.name}</div>
                <div style={{ fontSize: 13, color: '#52525b' }}>{quote.sector} • {quote.industry}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                  ₹{quote.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 700, marginTop: 4,
                  color: isPositive ? '#10b981' : '#ef4444',
                }}>
                  {isPositive ? '▲' : '▼'} {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.changePercent).toFixed(2)}%)
                </div>
                {lastUpdated && (
                  <div style={{ fontSize: 11, color: '#52525b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse-glow 2s infinite', display: 'inline-block' }}></span>
                    Auto-refreshing every 15s • Updated {lastUpdated.toLocaleTimeString('en-IN')}
                  </div>
                )}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12, marginBottom: 32,
            }}>
              {[
                { label: 'Day High', value: `₹${quote.dayHigh?.toLocaleString('en-IN')}` },
                { label: 'Day Low', value: `₹${quote.dayLow?.toLocaleString('en-IN')}` },
                { label: 'Prev Close', value: `₹${quote.previousClose?.toLocaleString('en-IN')}` },
                { label: '52W High', value: `₹${quote.fiftyTwoWeekHigh?.toLocaleString('en-IN')}` },
                { label: '52W Low', value: `₹${quote.fiftyTwoWeekLow?.toLocaleString('en-IN')}` },
                { label: 'Volume', value: formatVolume(quote.volume) },
                { label: 'Market Cap', value: formatMarketCap(quote.marketCap) },
                { label: 'P/E Ratio', value: quote.pe ? quote.pe.toFixed(2) : 'N/A' },
                { label: 'EPS', value: quote.eps ? `₹${quote.eps.toFixed(2)}` : 'N/A' },
                { label: 'Div Yield', value: quote.dividend ? `${(quote.dividend * 100).toFixed(2)}%` : 'N/A' },
              ].map((m, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Chart Section */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 24, marginBottom: 32,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                {/* Period Selector */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {PERIOD_OPTIONS.map(p => (
                    <button key={p.value} onClick={() => setPeriod(p.value)}
                      style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, fontFamily: 'Outfit', transition: 'all 0.2s',
                        background: period === p.value ? (isPositive ? '#10b981' : '#ef4444') : 'rgba(255,255,255,0.06)',
                        color: period === p.value ? '#fff' : '#a1a1aa',
                      }}
                    >{p.label}</button>
                  ))}
                </div>

                {/* Chart Type Toggle */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setChartType('area')}
                    style={{
                      padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, fontFamily: 'Outfit',
                      background: chartType === 'area' ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)',
                      color: chartType === 'area' ? '#00e5ff' : '#71717a',
                    }}>📈 Price</button>
                  <button onClick={() => setChartType('volume')}
                    style={{
                      padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, fontFamily: 'Outfit',
                      background: chartType === 'volume' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.06)',
                      color: chartType === 'volume' ? '#a855f7' : '#71717a',
                    }}>📊 Volume</button>
                </div>
              </div>

              {historyLoading ? (
                <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 16, color: '#71717a' }}>Loading chart data...</div>
                </div>
              ) : history.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  {chartType === 'area' ? (
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                          <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={v => { const d = v.split(' ')[0]; const parts = d.split('-'); return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : v; }}
                        interval={Math.floor(history.length / 6)} />
                      <YAxis tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false}
                        domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} width={70} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Outfit' }}
                        labelStyle={{ color: '#71717a', fontSize: 12 }}
                        formatter={(val) => [`₹${val.toFixed(2)}`, 'Close']}
                      />
                      <Area type="monotone" dataKey="close" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2}
                        fill="url(#chartGrad)" dot={false} />
                    </AreaChart>
                  ) : (
                    <BarChart data={history}>
                      <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={v => { const parts = v.split('-'); return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : v; }}
                        interval={Math.floor(history.length / 6)} />
                      <YAxis tick={{ fill: '#52525b', fontSize: 11 }} tickLine={false} axisLine={false}
                        tickFormatter={v => formatVolume(v)} width={60} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontFamily: 'Outfit' }}
                        formatter={(val) => [formatVolume(val), 'Volume']}
                      />
                      <Bar dataKey="volume" fill="rgba(168,85,247,0.6)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 16, color: '#71717a' }}>No chart data available</div>
                </div>
              )}
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
            <div style={{ fontSize: 20, color: '#71717a', fontWeight: 600 }}>Fetching market data...</div>
          </div>
        ) : null}

        {/* ─── Trending / Market Overview ─── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#fff' }}>
              {selectedStock ? 'Other Trending Stocks' : '🔥 Trending on NSE'}
            </h2>
            <span style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 8,
              background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontWeight: 600,
            }}>NIFTY 50 Components</span>
          </div>

          {trendingLoading ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16,
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: 20, height: 120, animation: 'pulse 1.5s infinite',
                }} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16,
            }}>
              {trending.map((s, i) => {
                const up = s.change >= 0;
                return (
                  <div key={i} onClick={() => handleSelectStock(s.symbol)}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.25s',
                      position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = up ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{s.symbol.replace('.NS', '')}</div>
                        <div style={{ fontSize: 12, color: '#71717a', marginTop: 2, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      </div>
                      <div style={{
                        fontSize: 12, padding: '4px 10px', borderRadius: 8, fontWeight: 700,
                        background: up ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: up ? '#10b981' : '#ef4444',
                      }}>
                        {up ? '▲' : '▼'} {Math.abs(s.changePercent).toFixed(2)}%
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                        ₹{s.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11, color: '#52525b' }}>Vol: {formatVolume(s.volume)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {trending.length === 0 && !trendingLoading && (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Market Data Loading</div>
              <div style={{ fontSize: 14, color: '#71717a', maxWidth: 400, margin: '0 auto' }}>
                Trending stock data is being fetched from Yahoo Finance. Try searching for a specific stock above.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer Attribution ─── */}
      <div style={{
        textAlign: 'center', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.04)',
        marginTop: 40,
      }}>
        <span style={{ fontSize: 12, color: '#3f3f46', fontFamily: 'Outfit' }}>
          Market data provided by <span style={{ color: '#71717a', fontWeight: 600 }}>Yahoo Finance</span> • InvestShield AI
        </span>
      </div>
    </div>
  );
}
