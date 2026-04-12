import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#00e5ff', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(0, 229, 255, 0.2)',
        padding: '12px 16px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
      }}>
        <p style={{ color: '#fff', margin: '0 0 4px 0', fontWeight: 600 }}>{payload[0].name}</p>
        <p style={{ color: '#00e5ff', margin: 0, fontSize: '15px', fontWeight: 700 }}>
          ₹{payload[0].value.toLocaleString('en-IN')} <span style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: 400 }}>({payload[0].payload.percentage}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioAnalyzerDashboard({ data, onReset }) {
  if (!data) return null;

  return (
    <div className="animate-cascade-3" style={{ marginTop: '40px' }}>
      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Health Score Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(15,20,35,0.8), rgba(10,15,25,0.8))',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{ 
            width: '80px', height: '80px', 
            borderRadius: '50%', 
            background: `conic-gradient(#10b981 ${data.healthScore}%, rgba(255,255,255,0.05) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#0a0f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '24px', color: '#10b981', fontWeight: 800 }}>{data.healthScore}</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#a1a1aa', margin: '0 0 4px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: 1 }}>Health Score</h4>
            <p style={{ color: '#fff', margin: 0, fontSize: '15px' }}>
              {data.healthScore >= 80 ? 'Optimal' : data.healthScore >= 60 ? 'Needs Tuning' : 'High Risk'}
            </p>
          </div>
        </div>

        {/* Risk & Diversification */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: 600 }}>Risk Level</span>
            <span style={{ 
              color: data.riskLevel === 'Low' ? '#10b981' : data.riskLevel === 'Medium' ? '#f59e0b' : '#ef4444',
              fontWeight: 800
             }}>
              {data.riskLevel}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: 600 }}>Diversification</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>{data.diversificationScore}</span>
          </div>
        </div>

        {/* Value summary */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
           <h4 style={{ color: '#a1a1aa', margin: '0 0 8px 0', fontSize: '14px' }}>Total Analyzed Value</h4>
           <div style={{ fontSize: '28px', color: '#00e5ff', fontWeight: 800, fontFamily: 'Outfit' }}>
             ₹{data.totalValue.toLocaleString('en-IN')}
           </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* Sector Pie Chart */}
        <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
          <h3 style={{ color: '#fff', margin: '0 0 16px 0', fontFamily: 'Outfit', width: '100%' }}>Sector Allocation</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {data.sectorData.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#a1a1aa' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.percentage}%)
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(10, 15, 25, 0.4) 100%)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(0, 229, 255, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <h3 style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', fontSize: '24px' }}>AI Portfolio Insights</h3>
          </div>
          
          <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #00e5ff', marginBottom: '24px' }}>
            <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6, fontSize: '14px' }}>
              {data.beginnerExplanation}
            </p>
          </div>

          <h4 style={{ color: '#00e5ff', margin: '0 0 16px 0', fontSize: '15px', textTransform: 'uppercase', letterSpacing: 1 }}>Suggested Actions</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.recommendations.map((rec, i) => (
              <li key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', color: '#e2e8f0', fontSize: '15px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: '#f59e0b', marginTop: 2 }}>⚡</span>
                <span style={{ lineHeight: 1.5 }}>{rec}</span>
              </li>
            ))}
          </ul>

          <h4 style={{ color: '#a1a1aa', margin: '0 0 16px 0', fontSize: '15px' }}>Optimized Target Allocation</h4>
          <div style={{ display: 'table', width: '100%', color: '#fff', fontSize: '14px' }}>
            <div style={{ display: 'table-row', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#71717a', fontWeight: 600 }}>
              <div style={{ display: 'table-cell', padding: '12px 0' }}>Sector</div>
              <div style={{ display: 'table-cell', padding: '12px 0' }}>Current</div>
              <div style={{ display: 'table-cell', padding: '12px 0' }}>Target</div>
              <div style={{ display: 'table-cell', padding: '12px 0' }}>Action</div>
            </div>
            {data.improvedPortfolio.map((item, i) => (
              <div key={i} style={{ display: 'table-row', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'table-cell', padding: '16px 0', fontWeight: 500 }}>{item.name}</div>
                <div style={{ display: 'table-cell', padding: '16px 0' }}>{item.percentage}%</div>
                <div style={{ display: 'table-cell', padding: '16px 0', color: '#00e5ff' }}>{item.projectedPercentage}%</div>
                <div style={{ display: 'table-cell', padding: '16px 0' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: item.action.includes('Buy') ? 'rgba(16, 185, 129, 0.15)' : item.action.includes('Sell') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: item.action.includes('Buy') ? '#34d399' : item.action.includes('Sell') ? '#ef4444' : '#a1a1aa'
                  }}>
                    {item.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Allocation Strategy */}
      {data.savingsStrategy && (
        <div style={{
            background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>💰</span>
            <h3 style={{ color: '#fff', margin: 0, fontFamily: 'Outfit', fontSize: '24px' }}>How to Divide Your Monthly Savings</h3>
          </div>
          <p style={{ color: '#94a3b8', margin: '0 0 24px 0', fontSize: '15px' }}>
            Based on your risk profile, we recommend the <strong>{data.savingsStrategy.framework}</strong>. From every ₹10,000 you invest, divide it like this:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            {data.savingsStrategy.allocations.map((alloc, idx) => (
              <div key={idx} style={{
                flex: '1 1 200px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ color: '#fff', margin: 0, fontSize: '16px' }}>{alloc.bucket}</h4>
                  <span style={{ color: '#3b82f6', fontWeight: 800, fontSize: '18px' }}>{alloc.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${alloc.percentage}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                </div>
                <p style={{ color: '#a1a1aa', margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                  {alloc.detail}
                </p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '12px', color: '#bfdbfe', fontSize: '14px', borderLeft: '4px solid #3b82f6' }}>
            <span style={{ marginRight: '8px' }}>💡</span>
            {data.savingsStrategy.recommendation}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button onClick={onReset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 24px', borderRadius: '12px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
          Analyze Another Portfolio
        </button>
      </div>

    </div>
  );
}
