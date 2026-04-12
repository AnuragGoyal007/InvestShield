import React from 'react';

/**
 * Header Component
 * Scale AI inspired minimal editorial header.
 * Sticky, glassmorphism, clean typography.
 */
export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      background: 'rgba(10, 10, 10, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1400px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
            borderRadius: '4px',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
          }}></div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#fff',
            margin: 0
          }}>
            InvestShield<span style={{ color: '#00e5ff', marginLeft: 2 }}>AI</span>
          </h1>
        </div>

        {/* Navigation / Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <nav style={{ display: 'flex', gap: 24, fontSize: '14px', fontWeight: 500, color: '#a1a1aa' }} className="header-nav-hidden-mobile">
            <span 
              onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#a1a1aa'}>
              Platform
            </span>
            <span 
              onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#a1a1aa'}>
              Models
            </span>
            <span 
              onClick={() => document.getElementById('documentation')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#a1a1aa'}>
              Documentation
            </span>
            <span 
              onClick={() => document.getElementById('market-news')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#a1a1aa'}>
              Markets
            </span>
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '100px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 8px #00e5ff', animation: 'pulse-glow 2s infinite' }}></span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00e5ff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Engine Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
