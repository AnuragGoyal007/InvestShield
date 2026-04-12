import React from 'react';

/**
 * InputPanel Component
 * Accepts user investment parameters (NO step-up — AI will suggest it):
 *   - Monthly SIP amount
 *   - Investment duration (years)
 *   - Target goal amount
 *   - Risk preference (Low / Medium / High)
 */
export default function InputPanel({
  sip, setSip,
  years, setYears,
  goal, setGoal,
  stepUp, setStepUp,
  riskPreference, setRiskPreference,
  onSimulate,
  loading,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate();
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Section Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#00e5ff' }}>❖</span> Telemetry Input
        </h2>
        <p style={{ color: '#a1a1aa', fontSize: 14 }}>Define parameters. The model handles the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monthly SIP */}
        <div>
          <label className="input-label" htmlFor="sip-input">Monthly Capital (₹)</label>
          <input
            id="sip-input"
            type="number"
            className="input-field"
            value={sip}
            onChange={(e) => setSip(e.target.value)}
            placeholder="e.g., 2000"
            min="100"
            required
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Investment Duration */}
        <div>
          <label className="input-label" htmlFor="years-input">Time Horizon (Years)</label>
          <input
            id="years-input"
            type="number"
            className="input-field"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g., 5"
            min="1"
            max="40"
            required
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Target Goal */}
        <div>
          <label className="input-label" htmlFor="goal-input">Target Objective (₹)</label>
          <input
            id="goal-input"
            type="number"
            className="input-field"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 200000"
            min="1000"
            required
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Annual Step-Up */}
        <div>
          <label className="input-label" htmlFor="stepup-input">
            Annual Step-Up (₹) 
            <span style={{ fontSize: 10, color: '#10b981', marginLeft: 8, padding: '2px 4px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 4 }}>OPTIONAL</span>
          </label>
          <input
            id="stepup-input"
            type="number"
            className="input-field"
            value={stepUp}
            onChange={(e) => setStepUp(e.target.value)}
            placeholder="e.g., 500"
            min="0"
            style={{ fontSize: 16, borderColor: stepUp > 0 ? '#10b981' : 'rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Risk Preference */}
        <div>
          <label className="input-label">Risk Vector</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskPreference(level)}
                style={{
                  padding: '12px 4px',
                  borderRadius: '10px',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  border: riskPreference === level ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)',
                  background: riskPreference === level ? 'rgba(0, 229, 255, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                  color: riskPreference === level ? '#00e5ff' : '#a1a1aa',
                  transition: 'all 0.2s',
                  boxShadow: riskPreference === level ? '0 0 15px rgba(0,229,255,0.1)' : 'none',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="simulate-btn"
          className="btn-primary"
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading && <span className="spinner"></span>}
          {loading ? 'Processing...' : 'Run Analysis'}
        </button>
      </form>

      {/* Quick Info */}
      <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'rgba(0, 229, 255, 0.05)', border: '1px dashed rgba(0, 229, 255, 0.2)' }}>
        <p style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.6 }}>
          <strong style={{ color: '#00e5ff', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Framework</strong>
          Our ML engine evaluates feasibility, then suggests optimized step-up options and Scikit-Learn clustered portfolios recursively.
        </p>
      </div>
    </div>
  );
}
