import React from 'react';

/**
 * MutualFundSuggestions Component
 * 
 * Displays AI-suggested mutual funds based on risk profile, duration, and goal.
 * Shows:
 *   - Portfolio allocation advice (equity/debt/hybrid split)
 *   - Individual fund recommendations with key details
 *   - Allocation category badges (Primary / Growth Booster / Stability)
 */
export default function MutualFundSuggestions({ suggestedFunds }) {
  if (!suggestedFunds || !suggestedFunds.funds || suggestedFunds.funds.length === 0) return null;

  const { funds, allocationAdvice, portfolioSplit } = suggestedFunds;

  const splitColors = {
    equity: '#10b981',
    debt: '#06b6d4',
    hybrid: '#f59e0b',
  };

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">🏦</div>
        <div>
          <h2 className="section-title">Suggested Mutual Funds</h2>
          <p className="section-subtitle">AI-curated portfolio recommendations</p>
        </div>
      </div>

      {/* Portfolio Split Visual */}
      {portfolioSplit && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{
            fontSize: '12px', fontWeight: 600, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px',
          }}>
            Recommended Portfolio Split
          </p>

          {/* Split bar */}
          <div style={{
            display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden',
            marginBottom: '10px',
          }}>
            <div style={{ width: `${portfolioSplit.equity}%`, background: splitColors.equity, transition: 'width 1s ease' }}></div>
            <div style={{ width: `${portfolioSplit.debt}%`, background: splitColors.debt, transition: 'width 1s ease' }}></div>
            <div style={{ width: `${portfolioSplit.hybrid}%`, background: splitColors.hybrid, transition: 'width 1s ease' }}></div>
          </div>

          {/* Split labels */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(portfolioSplit).map(([type, pct]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: splitColors[type],
                }}></span>
                <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' }}>
                  {type}: <strong style={{ color: '#f1f5f9' }}>{pct}%</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allocation Advice */}
      {allocationAdvice && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.12)',
          borderRadius: '10px',
          marginBottom: '20px',
        }}>
          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
            📊 <strong style={{ color: '#10b981' }}>AI Advice:</strong> {allocationAdvice}
          </p>
        </div>
      )}

      {/* Fund Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {funds.map((fund, idx) => (
          <div key={idx} style={{
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.2s ease',
          }}
          className="fund-card"
          >
            {/* Fund icon based on risk */}
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
              background: fund.risk === 'Low' ? 'rgba(6, 182, 212, 0.1)'
                : fund.risk === 'Moderate' ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            }}>
              {fund.risk === 'Low' ? '🛡️' : fund.risk === 'Moderate' ? '⚖️' : '🚀'}
            </div>

            {/* Fund info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                  {fund.name}
                </p>
                <span style={{
                  padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  background: fund.allocation === 'Primary' ? 'rgba(16, 185, 129, 0.15)'
                    : fund.allocation === 'Growth Booster' ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(6, 182, 212, 0.15)',
                  color: fund.allocation === 'Primary' ? '#10b981'
                    : fund.allocation === 'Growth Booster' ? '#f59e0b'
                    : '#06b6d4',
                }}>
                  {fund.allocation}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {fund.category} • {fund.description}
              </p>
            </div>

            {/* Return & Risk */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700, fontSize: '14px', color: '#10b981',
              }}>
                {fund.expectedReturn}
              </p>
              <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                Expected p.a.
              </p>
              <p style={{
                fontSize: '10px', marginTop: '2px',
                color: fund.risk === 'Low' ? '#06b6d4' : fund.risk === 'Moderate' ? '#f59e0b' : '#ef4444',
              }}>
                {fund.risk} Risk
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: '16px', padding: '10px 14px', borderRadius: '8px',
        background: 'rgba(100, 116, 139, 0.08)',
      }}>
        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
          ⚠️ These are AI-generated suggestions for educational purposes. Past performance does not 
          guarantee future results. Always consult a SEBI-registered financial advisor before investing.
        </p>
      </div>
    </div>
  );
}
