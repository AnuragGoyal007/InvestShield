import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * OnboardingTour Component — InvestShield AI
 * 
 * Full-featured interactive walkthrough:
 *   - Welcome splash modal
 *   - 7-step guided tour with canvas spotlight
 *   - Contextual tooltips on hover
 *   - Progress dots with completed/active states
 *   - Skip / replay functionality via floating FAB
 *   - Completion celebration with confetti
 *   - Keyboard navigation (Arrow keys + ESC)
 */

// ─── ONBOARDING STEPS ───────────────────────────────────────────
const STEPS = [
  {
    target: () => document.querySelector('header'),
    title: 'Navigation Header',
    description: 'Your command bar. Quickly jump to Platform, Models, Documentation, or Markets sections. The "Engine Online" badge confirms the backend API is ready.',
    hint: 'Click any nav link to instantly scroll to that section',
    position: 'bottom',
    scrollTo: false,
  },
  {
    target: () => document.querySelector('.hero-section'),
    title: 'Welcome to InvestShield AI',
    description: 'This is your launchpad. The hero section introduces the platform and provides one-click access to the Simulation Engine and Market Intelligence feeds.',
    hint: 'Click "Build Your Financial Twin" to jump to the simulator',
    position: 'right',
    scrollTo: true,
  },
  {
    target: () => document.querySelector('.sidebar .glass-card') || document.querySelector('.sidebar'),
    title: 'Telemetry Input Panel',
    description: 'Configure your investment parameters here — Monthly SIP amount, Time Horizon, Target Goal, optional Step-Up amount, and your Risk Preference (Low / Medium / High).',
    hint: 'Fill in your numbers and hit "Run Analysis" to launch the Monte Carlo simulation',
    position: 'right',
    scrollTo: true,
    scrollTarget: () => document.getElementById('simulator'),
  },
  {
    target: () => document.querySelector('#simulate-btn'),
    title: 'Run Analysis Button',
    description: 'This triggers the full simulation pipeline: 2,000 Monte Carlo branches, risk scoring, strategy comparison, and AI-driven recommendations — all powered by the backend engine.',
    hint: 'Click this after filling your parameters to see results instantly',
    position: 'right',
    scrollTo: false,
  },
  {
    target: () => document.querySelector('.main-panel'),
    title: 'Results Dashboard',
    description: 'After running a simulation, this area displays your results — Expected Trajectory, Success Probability, Risk Score, interactive charts, strategy comparisons, and AI insights.',
    hint: 'Run a simulation to populate this area with live data',
    position: 'left',
    scrollTo: false,
  },
  {
    target: () => document.getElementById('documentation') || document.querySelector('.feature-section'),
    title: 'Feature Documentation',
    description: 'Deep-dive into how InvestShield works — learn about Monte Carlo Forecasts, K-Nearest Content Routing, and the ML models that power your recommendations.',
    hint: 'Scroll here to understand the science behind the predictions',
    position: 'right',
    scrollTo: true,
  },
  {
    target: () => document.getElementById('market-news'),
    title: 'Live Market Intelligence',
    description: 'Aggregated macroeconomic news from Indian markets, auto-synced from live RSS feeds. Stay informed about market shifts that could impact your investment strategy.',
    hint: 'Click any news card to read the full article',
    position: 'right',
    scrollTo: true,
  },
];

// ─── STYLES ─────────────────────────────────────────────────────
const styles = {
  // Welcome Modal
  welcomeOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'onb-fadeIn 0.5s ease',
  },
  welcomeBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(5, 5, 10, 0.88)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  welcomeCard: {
    position: 'relative',
    background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.95), rgba(10, 15, 25, 0.95))',
    border: '1px solid rgba(0, 229, 255, 0.12)',
    borderRadius: '24px',
    padding: '56px 48px',
    maxWidth: '520px',
    width: '92%',
    textAlign: 'center',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 80px rgba(0, 229, 255, 0.05)',
    animation: 'onb-slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  welcomeIconWrap: {
    position: 'relative',
    width: '100px',
    height: '100px',
    margin: '0 auto 32px',
  },
  welcomeIconBox: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  welcomeIconSquare: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
    borderRadius: '12px',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 800,
    color: '#fff',
    fontFamily: 'Outfit, sans-serif',
  },
  welcomeTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '32px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#fff',
    marginBottom: '12px',
  },
  welcomeTitleAccent: {
    background: 'linear-gradient(135deg, #00e5ff, #0077ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#a1a1aa',
    lineHeight: 1.7,
    marginBottom: '36px',
  },
  welcomeFeatures: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  welcomeFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#a1a1aa',
  },
  featureIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(0, 229, 255, 0.1)',
    color: '#00e5ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  welcomeActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  btnStart: {
    width: '100%',
    padding: '16px 28px',
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 6px 25px rgba(6, 182, 212, 0.35)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
  },
  btnSkip: {
    background: 'none',
    border: 'none',
    color: '#71717a',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    padding: '8px 16px',
    transition: 'color 0.2s',
  },

  // Tour Overlay
  tourOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9990,
    pointerEvents: 'none',
    isolation: 'isolate',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'all',
    zIndex: 9991,
    transition: 'opacity 0.3s ease',
  },

  // Tooltip Card
  tooltipCard: {
    position: 'fixed',
    width: '370px',
    background: '#0c1225',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    borderRadius: '18px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 50px rgba(0, 229, 255, 0.08)',
    pointerEvents: 'all',
    zIndex: 9999,
    overflow: 'hidden',
    transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
  },
  tooltipGradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #00e5ff, #0077ff, #6366f1)',
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px 0',
  },
  tooltipBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#00e5ff',
    background: 'rgba(0, 229, 255, 0.1)',
    padding: '4px 12px',
    borderRadius: '100px',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.3px',
  },
  tooltipCloseBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: 'none',
    background: 'none',
    color: '#71717a',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.15s',
  },
  tooltipBody: {
    padding: '14px 20px',
  },
  tooltipTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
    marginBottom: '8px',
  },
  tooltipDesc: {
    fontSize: '14px',
    color: '#a1a1aa',
    lineHeight: 1.65,
  },
  tooltipHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 14px',
    background: 'rgba(0, 229, 255, 0.08)',
    border: '1px solid rgba(0, 229, 255, 0.15)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#00e5ff',
  },
  tooltipFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px 16px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  progressDots: {
    display: 'flex',
    gap: '6px',
  },
  dot: (active, completed) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: completed ? '#10b981' : active ? '#00e5ff' : 'rgba(255,255,255,0.12)',
    boxShadow: active ? '0 0 8px rgba(0, 229, 255, 0.5)' : 'none',
    transition: 'all 0.3s',
  }),
  tooltipActions: {
    display: 'flex',
    gap: '8px',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    background: 'rgba(255,255,255,0.05)',
    color: '#a1a1aa',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnNext: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 16px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)',
    transition: 'all 0.2s',
  },

  // FAB
  fab: {
    position: 'fixed',
    bottom: '100px',
    right: '32px',
    zIndex: 8000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    color: '#fff',
    borderRadius: '100px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(6, 182, 212, 0.35)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    animation: 'onb-fabIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Completion Modal
  completionOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'onb-fadeIn 0.4s ease',
  },
  completionCard: {
    position: 'relative',
    background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.95), rgba(10, 15, 25, 0.95))',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '24px',
    padding: '56px 48px',
    maxWidth: '500px',
    width: '92%',
    textAlign: 'center',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
    animation: 'onb-slideUp 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden',
  },
  completionIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.1)',
    fontSize: '42px',
    marginBottom: '24px',
    animation: 'onb-pulseScale 2s ease-in-out infinite',
  },
  completionTitle: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '32px',
    fontWeight: 800,
    color: '#fff',
    marginBottom: '12px',
  },
  completionSubtitle: {
    fontSize: '14px',
    color: '#a1a1aa',
    lineHeight: 1.7,
    marginBottom: '32px',
  },
  completionNextHeader: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    marginBottom: '16px',
    textAlign: 'left',
  },
  nextStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '12px',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#a1a1aa',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  nextStepNum: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'rgba(0, 229, 255, 0.1)',
    color: '#00e5ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
    flexShrink: 0,
  },

  // Hover Tooltip
  hoverTooltip: {
    position: 'fixed',
    zIndex: 11000,
    padding: '8px 14px',
    background: 'rgba(15, 20, 35, 0.95)',
    border: '1px solid rgba(0, 229, 255, 0.15)',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#a1a1aa',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    pointerEvents: 'none',
    maxWidth: '260px',
    backdropFilter: 'blur(10px)',
    animation: 'onb-fadeIn 0.2s ease',
  },
};

// ─── KEYFRAME CSS (injected once) ───────────────────────────────
const KEYFRAMES_CSS = `
@keyframes onb-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes onb-slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes onb-tooltipAppear {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes onb-pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes onb-fabIn {
  from { opacity: 0; transform: translateY(20px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes onb-confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
}
`;

// ─── COMPONENT ──────────────────────────────────────────────────
export default function OnboardingTour() {
  const [phase, setPhase] = useState('welcome'); // 'welcome' | 'touring' | 'completed' | 'idle'
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const [hoverTip, setHoverTip] = useState(null);
  const canvasRef = useRef(null);
  const highlightRef = useRef(null);

  // Check localStorage to skip welcome if already seen
  useEffect(() => {
    const seen = localStorage.getItem('investshield_onboarding_done');
    if (seen === 'true') {
      setPhase('idle');
    }
  }, []);

  // Inject keyframes CSS once
  useEffect(() => {
    const id = 'onboarding-keyframes';
    if (!document.getElementById(id)) {
      const styleEl = document.createElement('style');
      styleEl.id = id;
      styleEl.textContent = KEYFRAMES_CSS;
      document.head.appendChild(styleEl);
    }
  }, []);

  // ─── SPOTLIGHT DRAWING ───────────────────────────────────
  const drawSpotlight = useCallback((targetRect) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Dark overlay — opaque enough to hide all background content
    ctx.fillStyle = 'rgba(2, 3, 8, 0.88)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    if (!targetRect) return;

    // Cut out spotlight with padding
    const pad = 14;
    const r = 16;
    const x = targetRect.left - pad;
    const y = targetRect.top - pad;
    const w = targetRect.width + pad * 2;
    const h = targetRect.height + pad * 2;

    // Clear
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
    ctx.restore();

    // Outer glow ring (soft)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
    ctx.shadowBlur = 35;
    const drawRoundRect = () => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    drawRoundRect();
    ctx.stroke();
    ctx.restore();

    // Inner glow ring (crisp)
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
    ctx.shadowBlur = 12;
    drawRoundRect();
    ctx.stroke();
    ctx.restore();
  }, []);

  // ─── POSITION TOOLTIP ────────────────────────────────────
  const positionTooltip = useCallback((targetRect, position) => {
    const tooltipW = 370;
    const tooltipH = 320;
    const gap = 20;
    let left, top;

    switch (position) {
      case 'right':
        left = targetRect.right + gap;
        top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
        break;
      case 'left':
        left = targetRect.left - tooltipW - gap;
        top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
        break;
      case 'bottom':
        left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
        top = targetRect.bottom + gap;
        break;
      case 'top':
        left = targetRect.left + targetRect.width / 2 - tooltipW / 2;
        top = targetRect.top - tooltipH - gap;
        break;
      default:
        left = targetRect.right + gap;
        top = targetRect.top;
    }

    // Keep in viewport
    const margin = 16;
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipW - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipH - margin));

    setTooltipPos({ left, top });
  }, []);

  // ─── SUPPRESS HEADER DURING TOUR ─────────────────────────
  const suppressHeader = useCallback((suppress, exceptStep0 = false) => {
    const header = document.querySelector('header');
    if (!header) return;
    if (suppress && !exceptStep0) {
      // Fully hide header so it can't intersect with anything
      header.style.opacity = '0';
      header.style.visibility = 'hidden';
      header.style.pointerEvents = 'none';
      header.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    } else {
      // Restore header
      header.style.opacity = '1';
      header.style.visibility = 'visible';
      header.style.pointerEvents = '';
      header.style.zIndex = '1000';
      header.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    }
  }, []);

  // ─── RENDER STEP ─────────────────────────────────────────
  const renderStep = useCallback((stepIdx) => {
    const step = STEPS[stepIdx];
    if (!step) return;

    // Clear previous ref
    highlightRef.current = null;

    // Suppress header unless we're highlighting it (step 0)
    suppressHeader(true, stepIdx === 0);

    // Fade canvas briefly for smooth spotlight transition
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.opacity = '0.3';
    }

    // Scroll to target if needed
    if (step.scrollTo) {
      const scrollTarget = step.scrollTarget ? step.scrollTarget() : step.target();
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Small delay for scroll to settle
    const delay = step.scrollTo ? 600 : 150;
    setTimeout(() => {
      const el = step.target();
      if (!el) return;

      // Store ref (no z-index change — canvas spotlight handles visibility)
      highlightRef.current = el;

      const rect = el.getBoundingClientRect();
      drawSpotlight(rect);
      positionTooltip(rect, step.position);

      // Fade canvas back in smoothly
      if (canvas) {
        requestAnimationFrame(() => {
          canvas.style.opacity = '1';
        });
      }
    }, delay);
  }, [drawSpotlight, positionTooltip, suppressHeader]);

  // ─── ACTIONS ─────────────────────────────────────────────
  const startTour = () => {
    setPhase('touring');
    setCurrentStep(0);
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => renderStep(0), 400);
  };

  const skipWelcome = () => {
    setPhase('idle');
    localStorage.setItem('investshield_onboarding_done', 'true');
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      renderStep(next);
    } else {
      finishTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      renderStep(prev);
    }
  };

  const closeTour = () => {
    highlightRef.current = null;
    suppressHeader(false);
    setPhase('idle');
    localStorage.setItem('investshield_onboarding_done', 'true');
  };

  const finishTour = () => {
    highlightRef.current = null;
    suppressHeader(false);
    setPhase('completed');
    localStorage.setItem('investshield_onboarding_done', 'true');
  };

  const replayTour = () => {
    setPhase('touring');
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => renderStep(0), 400);
  };

  const dismissCompletion = () => {
    setPhase('idle');
  };

  // ─── KEYBOARD NAV ────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (phase !== 'touring') return;
      if (e.key === 'Escape') closeTour();
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentStep]);

  // Handle resize during tour
  useEffect(() => {
    const handleResize = () => {
      if (phase === 'touring') renderStep(currentStep);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phase, currentStep, renderStep]);

  // ─── HOVER TOOLTIPS ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'idle') return;

    const tooltipMap = [
      { selector: '#simulate-btn', text: 'Click to run a 2,000-branch Monte Carlo simulation with your parameters' },
      { selector: '.hero-section .btn-primary', text: 'Jump to the Simulation Engine and start building your financial twin' },
      { selector: '.hero-section .btn-secondary', text: 'View live market intelligence feed with Indian stock market data' },
      { selector: '#sip-input', text: 'Enter the amount you invest each month via SIP' },
      { selector: '#years-input', text: 'How many years you plan to stay invested' },
      { selector: '#goal-input', text: 'Your target portfolio value at the end of the period' },
      { selector: '#stepup-input', text: 'Optional: Increase your SIP by this fixed amount each year' },
    ];

    const handlers = [];
    tooltipMap.forEach(({ selector, text }) => {
      const el = document.querySelector(selector);
      if (!el) return;

      const enter = (e) => {
        const rect = el.getBoundingClientRect();
        setHoverTip({
          text,
          left: rect.left + rect.width / 2 - 130,
          top: rect.bottom + 10,
        });
      };
      const leave = () => setHoverTip(null);

      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, enter, leave });
    });

    return () => {
      handlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, [phase]);

  // ─── CONFETTI ────────────────────────────────────────────
  const renderConfetti = () => {
    const colors = ['#00e5ff', '#0077ff', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
    return Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          top: '-20px',
          left: `${Math.random() * 100}%`,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `onb-confettiFall ${2 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s forwards`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
      />
    ));
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <>
      {/* ─── WELCOME MODAL ─── */}
      {phase === 'welcome' && (
        <div style={styles.welcomeOverlay}>
          <div style={styles.welcomeBackdrop} />
          <div style={styles.welcomeCard}>
            {/* Icon */}
            <div style={styles.welcomeIconWrap}>
              {/* Orbit rings */}
              {[0, -15, -30].map((inset, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  inset: `${inset}px`,
                  border: `1px solid rgba(0, 229, 255, ${0.15 - i * 0.04})`,
                  borderRadius: '50%',
                  animation: `onb-pulseScale ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }} />
              ))}
              <div style={styles.welcomeIconBox}>
                <div style={styles.welcomeIconSquare}>🛡️</div>
              </div>
            </div>

            <h1 style={styles.welcomeTitle}>
              Welcome to <span style={styles.welcomeTitleAccent}>InvestShield AI</span>
            </h1>
            <p style={styles.welcomeSubtitle}>
              Your intelligent investment simulation platform powered by Monte Carlo analysis, 
              ML-driven fund recommendations, and real-time market intelligence.
            </p>

            <div style={styles.welcomeFeatures}>
              <div style={styles.welcomeFeature}>
                <div style={styles.featureIcon}>⚡</div>
                <span>Quick guided tour</span>
              </div>
              <div style={styles.welcomeFeature}>
                <div style={styles.featureIcon}>⏱</div>
                <span>Takes ~2 minutes</span>
              </div>
              <div style={styles.welcomeFeature}>
                <div style={styles.featureIcon}>🔄</div>
                <span>Replay anytime</span>
              </div>
            </div>

            <div style={styles.welcomeActions}>
              <button
                style={styles.btnStart}
                onClick={startTour}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(6, 182, 212, 0.5)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(6, 182, 212, 0.35)'; }}
              >
                Start the Tour →
              </button>
              <button
                style={styles.btnSkip}
                onClick={skipWelcome}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = '#71717a'}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TOUR OVERLAY ─── */}
      {phase === 'touring' && (
        <div style={styles.tourOverlay}>
          <canvas ref={canvasRef} style={styles.canvas} onClick={closeTour} />
          <div style={{ ...styles.tooltipCard, left: tooltipPos.left, top: tooltipPos.top }} key={currentStep}>
            <div style={styles.tooltipGradientBar} />
            <div style={styles.tooltipHeader}>
              <span style={styles.tooltipBadge}>Step {currentStep + 1} of {STEPS.length}</span>
              <button
                style={styles.tooltipCloseBtn}
                onClick={closeTour}
                onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.background = 'none'; }}
              >
                ✕
              </button>
            </div>
            <div style={styles.tooltipBody}>
              <h3 style={styles.tooltipTitle}>{STEPS[currentStep].title}</h3>
              <p style={styles.tooltipDesc}>{STEPS[currentStep].description}</p>
              {STEPS[currentStep].hint && (
                <div style={styles.tooltipHint}>
                  <span>ℹ️</span>
                  <span>{STEPS[currentStep].hint}</span>
                </div>
              )}
            </div>
            <div style={styles.tooltipFooter}>
              <div style={styles.progressDots}>
                {STEPS.map((_, i) => (
                  <div key={i} style={styles.dot(i === currentStep, i < currentStep)} />
                ))}
              </div>
              <div style={styles.tooltipActions}>
                {currentStep > 0 && (
                  <button
                    style={styles.btnSecondary}
                    onClick={prevStep}
                    onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  style={styles.btnNext}
                  onClick={nextStep}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.5)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(6, 182, 212, 0.3)'; }}
                >
                  {currentStep === STEPS.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── COMPLETION MODAL ─── */}
      {phase === 'completed' && (
        <div style={styles.completionOverlay}>
          <div style={styles.welcomeBackdrop} />
          <div style={styles.completionCard}>
            {/* Confetti */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              {renderConfetti()}
            </div>

            <div style={styles.completionIcon}>✅</div>
            <h2 style={styles.completionTitle}>You're all set! 🎉</h2>
            <p style={styles.completionSubtitle}>
              You've completed the InvestShield AI onboarding tour. You're ready to simulate, 
              analyze, and build your investment strategy with confidence.
            </p>

            <h4 style={styles.completionNextHeader}>What to do next:</h4>
            <div style={styles.nextStep} onClick={() => {dismissCompletion(); document.getElementById('simulator')?.scrollIntoView({behavior: 'smooth'});}}>
              <div style={styles.nextStepNum}>1</div>
              <span>Configure your SIP parameters and run your first simulation</span>
            </div>
            <div style={styles.nextStep} onClick={() => {dismissCompletion(); document.getElementById('market-news')?.scrollIntoView({behavior: 'smooth'});}}>
              <div style={styles.nextStepNum}>2</div>
              <span>Explore live market intelligence and news feed</span>
            </div>
            <div style={styles.nextStep} onClick={() => {dismissCompletion(); document.getElementById('documentation')?.scrollIntoView({behavior: 'smooth'});}}>
              <div style={styles.nextStepNum}>3</div>
              <span>Read about Monte Carlo & ML models powering the engine</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <button
                style={{ ...styles.btnSkip, flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '15px' }}
                onClick={replayTour}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                ↻ Replay Tour
              </button>
              <button
                style={{ ...styles.btnStart, flex: 1.5, marginTop: 0 }}
                onClick={dismissCompletion}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Start Exploring →
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ─── HOVER TOOLTIPS ─── */}
      {hoverTip && (
        <div style={{ ...styles.hoverTooltip, left: Math.max(8, Math.min(hoverTip.left, window.innerWidth - 270)), top: hoverTip.top }}>
          {hoverTip.text}
        </div>
      )}
    </>
  );
}
