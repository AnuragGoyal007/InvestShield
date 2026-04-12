import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/auth';

export default function AuthScreen({ onLoginSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation Rules
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!isLogin) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('Password must contain at least one uppercase letter.');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setError('Password must contain at least one special symbol.');
        return;
      }
    }

    setLoading(true);

    const endpoint = isLogin ? '/login' : '/register';
    
    try {
      const { data } = await axios.post(`${API_BASE}${endpoint}`, { email, password });
      
      if (!isLogin) {
        // Stop here, don't auto-login
        setSuccess('Account created successfully! Please sign in with your new credentials.');
        setIsLogin(true);
        setPassword('');
        return;
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', data.user.email);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }} onClick={(e) => e.target === e.currentTarget && onClose?.()}>

      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(0, 229, 255, 0.15)',
        padding: '40px 36px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Close button */}
        {onClose && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#a1a1aa', width: 32, height: 32, borderRadius: 8,
            cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            ✕
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛡️</div>
          <h2 style={{ color: '#fff', fontSize: '24px', fontFamily: 'Outfit', margin: '0 0 6px 0' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0 }}>
            {isLogin ? 'Sign in to analyze & track your portfolio' : 'Sign up to save your portfolio history'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: '10px', color: '#ef4444', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 14px', borderRadius: '10px', color: '#10b981', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 14px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#00e5ff'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 14px', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#00e5ff'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '8px', padding: '14px',
            background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
            color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            transition: 'transform 0.2s'
          }}
            onMouseOver={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#a1a1aa', fontSize: '13px', margin: 0 }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }} style={{
              background: 'none', border: 'none', color: '#00e5ff', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: '13px'
            }}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
