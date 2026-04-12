import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

/**
 * RiskAreaChart Component
 * Displays area chart with current SIP vs step-up SIP vs best strategy
 * trendlines, with risk zone shading.
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
          }}></span>
          <span style={{ fontSize: '12px', color: '#94a3b8', minWidth: '100px' }}>
            {entry.name}
          </span>
          <span style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            ₹{Number(entry.value).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RiskAreaChart({ data = [], goal = 0 }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="glass-card animate-fade-in">
      <div className="section-header">
        <div className="section-icon">📈</div>
        <div>
          <h2 className="section-title">Growth Trendlines</h2>
          <p className="section-subtitle">Current vs Step-up vs Best strategy projections</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradStepUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradBest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Goal reference */}
          {goal > 0 && (
            <ReferenceLine
              y={goal}
              stroke="#f59e0b"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{
                value: `Goal`,
                position: 'right',
                fill: '#f59e0b',
                fontSize: 11,
              }}
            />
          )}

          {/* Area fills */}
          <Area
            type="monotone"
            dataKey="currentSIP"
            name="Current SIP"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#gradCurrent)"
          />
          <Area
            type="monotone"
            dataKey="stepUpSIP"
            name="Step-up SIP"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradStepUp)"
          />
          <Area
            type="monotone"
            dataKey="bestStrategy"
            name="Best Strategy"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#gradBest)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
