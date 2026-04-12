import React from 'react';

/**
 * RiskMeter Component
 * Circular SVG gauge showing risk score (0–100)
 * Color transitions: green (low) → amber (medium) → red (high)
 */
export default function RiskMeter({ riskScore = 0, riskLevel = '', riskColor = '#06b6d4' }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(riskScore, 100) / 100;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">🎯</div>
        <div>
          <h2 className="section-title">Risk Score</h2>
          <p className="section-subtitle">Portfolio volatility assessment</p>
        </div>
      </div>

      <div className="risk-meter-container">
        <svg width="180" height="180" viewBox="0 0 180 180" className="risk-meter-svg">
          {/* Background circle */}
          <circle
            className="risk-meter-bg"
            cx="90"
            cy="90"
            r={radius}
          />
          {/* Progress circle */}
          <circle
            className="risk-meter-fill"
            cx="90"
            cy="90"
            r={radius}
            stroke={riskColor}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Center text (positioned absolutely over the SVG) */}
        <div style={{ marginTop: '-120px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '36px',
            fontWeight: 700,
            color: riskColor,
          }}>
            {riskScore}
          </div>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: riskColor,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginTop: '2px',
          }}>
            {riskLevel}
          </div>
        </div>

        {/* Bottom spacing after absolutely positioned text */}
        <div style={{ height: '20px' }}></div>
      </div>

      {/* Scale */}
      <div className="flex justify-between mt-2 px-4">
        <span className="text-xs" style={{ color: '#10b981' }}>0 - Safe</span>
        <span className="text-xs" style={{ color: '#f59e0b' }}>50 - Moderate</span>
        <span className="text-xs" style={{ color: '#ef4444' }}>100 - Risky</span>
      </div>
    </div>
  );
}
