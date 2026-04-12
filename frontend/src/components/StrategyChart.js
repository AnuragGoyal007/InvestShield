import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

/**
 * StrategyChart Component
 * Multi-line chart comparing strategy performance over time.
 * Uses Recharts for interactive, responsive visualization.
 */

// Color palette for strategies
const STRATEGY_COLORS = {
  fixed_sip: '#06b6d4',      // cyan
  stepup_sip: '#10b981',     // emerald
  conservative: '#8b5cf6',   // purple
  balanced: '#f59e0b',       // amber
  aggressive: '#ef4444',     // red
};

const STRATEGY_NAMES = {
  fixed_sip: 'Fixed SIP',
  stepup_sip: 'Step-up SIP',
  conservative: 'Conservative',
  balanced: 'Balanced',
  aggressive: 'Aggressive',
};

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '14px 18px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    }}>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
        Month {label}
      </p>
      {payload.map((entry, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: entry.color,
            display: 'inline-block',
          }}></span>
          <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '100px' }}>
            {STRATEGY_NAMES[entry.dataKey] || entry.dataKey}
          </span>
          <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            ₹{Number(entry.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function StrategyChart({ data = [], goal = 0, bestStrategy = '' }) {
  if (!data || data.length === 0) return null;

  // Determine which strategy keys exist in the data
  const strategyKeys = Object.keys(data[0] || {}).filter(k => k !== 'month');

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">📊</div>
        <div>
          <h2 className="section-title">Strategy Comparison</h2>
          <p className="section-subtitle">Month-wise portfolio growth across strategies</p>
        </div>
        {bestStrategy && (
          <div className="ml-auto">
            <span className="badge badge-success">
              ⭐ Best: {STRATEGY_NAMES[bestStrategy] || bestStrategy}
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            label={{ value: 'Months', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value) => STRATEGY_NAMES[value] || value}
          />

          {/* Goal reference line */}
          {goal > 0 && (
            <ReferenceLine
              y={goal}
              stroke="#f59e0b"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{
                value: `Goal: ₹${goal.toLocaleString('en-IN')}`,
                position: 'right',
                fill: '#f59e0b',
                fontSize: 11,
              }}
            />
          )}

          {/* Strategy lines */}
          {strategyKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={STRATEGY_COLORS[key] || '#06b6d4'}
              strokeWidth={key === bestStrategy ? 3 : 2}
              dot={false}
              activeDot={{ r: 5, fill: STRATEGY_COLORS[key] || '#06b6d4' }}
              opacity={key === bestStrategy ? 1 : 0.7}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
