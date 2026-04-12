import React from 'react';

/**
 * StepUpOptions Component
 * 
 * Shows AI-recommended step-up SIP options when the goal isn't reachable.
 * Each card shows:
 *   - Step-up percentage & amount
 *   - Projected portfolio value
 *   - Success probability
 *   - Whether the goal becomes reachable
 * 
 * User clicks their preferred option → triggers re-simulation with that step-up.
 */
export default function StepUpOptions({ options = [], sip = 0, goal = 0, onSelectStepUp }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">📈</div>
        <div>
          <h2 className="section-title">AI-Recommended Step-up Plans</h2>
          <p className="section-subtitle">
            Choose a yearly SIP increment that fits your budget
          </p>
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(6, 182, 212, 0.06)',
        border: '1px solid rgba(6, 182, 212, 0.12)',
        borderRadius: '10px',
        marginBottom: '20px',
      }}>
        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>
          <strong style={{ color: '#06b6d4' }}>What is Step-up SIP?</strong> Instead of investing the same 
          amount every month forever, you increase your SIP by a fixed amount each year. Since your 
          income typically grows annually, stepping up your SIP is the smartest way to reach your goal 
          without feeling the pinch.
        </p>
      </div>

      {/* Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {options.map((opt, idx) => (
          <div
            key={idx}
            onClick={() => onSelectStepUp(opt.amount)}
            style={{
              padding: '20px',
              borderRadius: '14px',
              border: opt.goalReachable
                ? '2px solid rgba(16, 185, 129, 0.4)'
                : '1px solid #334155',
              background: opt.goalReachable
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05))'
                : 'rgba(30, 41, 59, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="stepup-option-card"
            id={`stepup-${opt.percentage}`}
          >
            {/* Recommended badge */}
            {opt.goalReachable && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                ✓ Recommended
              </div>
            )}

            {/* Step-up label */}
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: opt.goalReachable ? '#10b981' : '#22d3ee',
              marginBottom: '4px',
            }}>
              {opt.label}
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
              {opt.description}
            </p>

            {/* Year-wise breakdown preview */}
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '14px',
              flexWrap: 'wrap',
            }}>
              {[1, 2, 3].map(year => (
                <span key={year} style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '10px',
                  color: '#94a3b8',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  Y{year}: ₹{(sip + opt.amount * year).toLocaleString('en-IN')}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: '16px',
                  color: '#f1f5f9',
                }}>
                  ₹{opt.projectedValue.toLocaleString('en-IN')}
                </p>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Projected
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontWeight: 700,
                  fontSize: '16px',
                  color: opt.probability >= 65 ? '#10b981' : opt.probability >= 40 ? '#f59e0b' : '#ef4444',
                }}>
                  {opt.probability}%
                </p>
                <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Success
                </p>
              </div>
            </div>

            {/* Mini progress bar */}
            <div style={{
              width: '100%', height: '4px', borderRadius: '2px',
              background: '#1e293b', marginTop: '12px', overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(opt.probability, 100)}%`,
                height: '100%',
                borderRadius: '2px',
                background: opt.probability >= 65 ? '#10b981' : opt.probability >= 40 ? '#f59e0b' : '#ef4444',
                transition: 'width 1s ease',
              }}></div>
            </div>

            {/* Click hint */}
            <p style={{
              fontSize: '11px',
              color: opt.goalReachable ? '#10b981' : '#64748b',
              textAlign: 'center',
              marginTop: '12px',
              fontWeight: 500,
            }}>
              Click to apply this step-up →
            </p>
          </div>
        ))}
      </div>

      {/* Affordability note */}
      <div style={{
        marginTop: '16px',
        padding: '10px 14px',
        borderRadius: '8px',
        background: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.1)',
      }}>
        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
          💡 <strong style={{ color: '#f59e0b' }}>Choose wisely:</strong> Pick a step-up amount 
          you can comfortably afford as your income grows. A smaller consistent step-up is better 
          than an aggressive one you can't sustain.
        </p>
      </div>
    </div>
  );
}
