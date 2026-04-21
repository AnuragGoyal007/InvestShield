import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Header Component
 * Scale AI inspired minimal editorial header with integrated profile dropdown.
 */
export default function Header({ isAuthenticated, onLogout, onLoginClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail') || '';
  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <img 
            src="/logo.png" 
            alt="InvestShield AI Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
            }} 
          />
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
              onClick={() => document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#a1a1aa'}>
              Education
            </span>
            <span 
              onClick={() => navigate('/markets')}
              style={{ cursor: 'pointer', transition: 'color 0.2s', color: '#00e5ff' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#00e5ff'}>
              Markets
            </span>
            <span 
              onClick={() => navigate('/investiq')}
              style={{ cursor: 'pointer', transition: 'color 0.2s', color: '#f59e0b' }} 
              onMouseOver={e => e.target.style.color = '#fff'} 
              onMouseOut={e => e.target.style.color = '#f59e0b'}>
              InvestIQ
            </span>
          </nav>
          
          {/* Engine Online Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: '100px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 8px #00e5ff', animation: 'pulse-glow 2s infinite' }}></span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00e5ff', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Engine Online</span>
          </div>

          {/* Profile Section */}
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {/* Avatar Button */}
              <button onClick={() => setShowDropdown(!showDropdown)} style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
                border: showDropdown ? '2px solid #00e5ff' : '2px solid transparent',
                color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'Outfit',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', boxShadow: showDropdown ? '0 0 16px rgba(0,229,255,0.4)' : 'none'
              }}>
                {initials}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: 260, background: 'rgba(15, 23, 42, 0.98)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  overflow: 'hidden', animation: 'slideUp 0.2s ease'
                }}>
                  {/* User Info */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Outfit'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit' }}>
                          {userEmail.split('@')[0]}
                        </div>
                        <div style={{ color: '#71717a', fontSize: 12, marginTop: 2 }}>
                          {userEmail}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '8px' }}>
                    <button onClick={() => { setShowDropdown(false); document.getElementById('upload-history')?.scrollIntoView({ behavior: 'smooth' }); }} style={{
                      width: '100%', padding: '10px 14px', background: 'transparent', border: 'none',
                      color: '#e2e8f0', fontSize: 13, fontWeight: 500, textAlign: 'left', cursor: 'pointer',
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                       onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 16 }}>📂</span> Past Uploads
                    </button>

                    <button onClick={() => { setShowDropdown(false); document.getElementById('portfolio-auditor')?.scrollIntoView({ behavior: 'smooth' }); }} style={{
                      width: '100%', padding: '10px 14px', background: 'transparent', border: 'none',
                      color: '#e2e8f0', fontSize: 13, fontWeight: 500, textAlign: 'left', cursor: 'pointer',
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                       onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 16 }}>📊</span> Portfolio Auditor
                    </button>
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => { setShowDropdown(false); onLogout(); }} style={{
                      width: '100%', padding: '10px 14px', background: 'transparent', border: 'none',
                      color: '#ef4444', fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer',
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                       onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 16 }}>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onLoginClick} style={{
              padding: '8px 18px', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
              color: '#e2e8f0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
               onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
