import React from 'react';

/**
 * AIInsights Component (Updated)
 * 
 * Displays AI-generated analysis including:
 *   - Clear YES/NO goal verdict
 *   - Overall verdict with emoji
 *   - Main recommendation text
 *   - Detailed insights (color-coded cards)
 *   - Actionable suggestions
 *   - Summary stats
 */
export default function AIInsights({
  overallVerdict = '',
  sentimentEmoji = '',
  goalReachable = false,
  recommendation = '',
  insights = [],
  suggestions = [],
  summary = null,
}) {
  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">🤖</div>
        <div>
          <h2 className="section-title">AI Portfolio Analysis</h2>
          <p className="section-subtitle">Personalized insights & recommendations</p>
        </div>
      </div>

      {/* Big YES/NO Verdict Banner */}
      <div style={{
        padding: '20px 24px',
        borderRadius: '14px',
        marginBottom: '20px',
        border: goalReachable
          ? '2px solid rgba(16, 185, 129, 0.3)'
          : '2px solid rgba(239, 68, 68, 0.3)',
        background: goalReachable
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.05))',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '42px',
          marginBottom: '8px',
        }}>
          {sentimentEmoji}
        </div>
        <div style={{
          fontSize: '22px',
          fontWeight: 800,
          color: goalReachable ? '#10b981' : '#ef4444',
          marginBottom: '8px',
          letterSpacing: '-0.5px',
        }}>
          {goalReachable ? 'YES — Goal is Reachable!' : 'NO — Goal Needs a Boost'}
        </div>
        <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' }}>
          {overallVerdict}
        </p>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#06b6d4', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📝 AI Recommendation
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#cbd5e1' }}>
            {recommendation}
          </p>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Key Insights
          </h3>
          {insights.map((insight, idx) => (
            <div key={idx} className={`insight-card ${insight.type}`}>
              <p className="insight-title">{insight.title}</p>
              <p className="insight-text">{insight.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            💡 Actionable Suggestions
          </h3>
          {suggestions.map((sug, idx) => (
            <div key={idx} className="suggestion-card">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>
                    {sug.action}
                  </span>
                  <span className={`suggestion-impact ${sug.impact}`}>
                    {sug.impact} impact
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                  {sug.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="stat-card">
            <p className="stat-value" style={{ fontSize: '18px' }}>₹{summary.totalInvested.toLocaleString('en-IN')}</p>
            <p className="stat-label">Total Invested</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ fontSize: '18px' }}>₹{summary.expectedReturn.toLocaleString('en-IN')}</p>
            <p className="stat-label">Expected Return</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ fontSize: '18px', color: summary.gap > 0 ? '#ef4444' : '#10b981' }}>
              {summary.gap > 0 ? `-₹${summary.gap.toLocaleString('en-IN')}` : '✓ Surplus'}
            </p>
            <p className="stat-label">Gap to Goal</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ fontSize: '18px', color: summary.roi >= 0 ? '#10b981' : '#ef4444' }}>
              {summary.roi >= 0 ? '+' : ''}{summary.roi}%
            </p>
            <p className="stat-label">ROI</p>
          </div>
        </div>
      )}
    </div>
  );
}
