import React from 'react';

/**
 * ComparisonTable Component
 * Displays side-by-side strategy comparison in a styled table.
 * Highlights the best strategy row.
 */
export default function ComparisonTable({ strategies = [], bestStrategy = '' }) {
  if (!strategies || strategies.length === 0) return null;

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">📋</div>
        <div>
          <h2 className="section-title">Strategy Comparison</h2>
          <p className="section-subtitle">Detailed breakdown of all investment strategies</p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Final Value</th>
              <th>Invested</th>
              <th>ROI</th>
              <th>Success %</th>
              <th>Volatility</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((strat) => (
              <tr key={strat.id} className={strat.id === bestStrategy ? 'best-row' : ''}>
                <td>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '18px' }}>{strat.icon}</span>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{strat.name}</p>
                      <p className="text-xs text-text-muted hidden sm:block">{strat.description}</p>
                    </div>
                    {strat.id === bestStrategy && (
                      <span className="badge badge-success ml-2">Best</span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#f1f5f9' }}>
                    ₹{strat.finalValue.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>
                    ₹{strat.totalInvested.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontWeight: 600,
                    color: strat.roi >= 0 ? '#10b981' : '#ef4444',
                  }}>
                    {strat.roi >= 0 ? '+' : ''}{strat.roi}%
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div style={{
                      width: '48px', height: '6px', borderRadius: '3px',
                      background: '#1e293b', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${strat.probability}%`, height: '100%', borderRadius: '3px',
                        background: strat.probability >= 70 ? '#10b981' :
                                   strat.probability >= 40 ? '#f59e0b' : '#ef4444',
                        transition: 'width 1s ease',
                      }}></div>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>
                      {strat.probability}%
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                    ±₹{strat.volatility.toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  {strat.goalAchievable ? (
                    <span className="badge badge-success">✓ Achievable</span>
                  ) : (
                    <span className="badge badge-danger">✗ At Risk</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
