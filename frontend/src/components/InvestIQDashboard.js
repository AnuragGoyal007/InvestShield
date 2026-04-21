import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomQuiz } from '../data/quizData';

// ═══ Constants ═══
const LEVELS = [
  { level: 1, title: 'Rookie', xpNeeded: 0, color: '#71717a' },
  { level: 2, title: 'Learner', xpNeeded: 500, color: '#3b82f6' },
  { level: 3, title: 'Analyst', xpNeeded: 2000, color: '#8b5cf6' },
  { level: 4, title: 'Strategist', xpNeeded: 5000, color: '#f59e0b' },
  { level: 5, title: 'Expert', xpNeeded: 10000, color: '#10b981' },
  { level: 6, title: 'Tycoon', xpNeeded: 25000, color: '#ef4444' },
];

const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', desc: 'Complete onboarding', icon: '👣', xp: 50 },
  { id: 'quiz_rookie', name: 'Quiz Rookie', desc: 'Complete your first quiz', icon: '📝', xp: 100 },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Score 10/10 on a quiz', icon: '🧠', xp: 500 },
  { id: 'streak_3', name: 'Streak Starter', desc: 'Maintain a 3-day streak', icon: '🔥', xp: 200 },
  { id: 'streak_7', name: 'Streak King', desc: 'Maintain a 7-day streak', icon: '👑', xp: 500 },
  { id: 'fast_answer', name: 'Speed Demon', desc: 'Answer a question in under 5 seconds', icon: '⚡', xp: 100 },
  { id: 'scholar', name: 'Scholar', desc: 'Complete 5 quizzes', icon: '🎓', xp: 300 },
  { id: 'perfect_3', name: 'Hat Trick', desc: 'Get 3 perfect scores', icon: '🎯', xp: 400 },
  { id: 'xp_1000', name: 'XP Hunter', desc: 'Earn 1,000 total XP', icon: '💰', xp: 200 },
  { id: 'xp_5000', name: 'XP Legend', desc: 'Earn 5,000 total XP', icon: '💎', xp: 500 },
  { id: 'knowledge_all', name: 'Well Rounded', desc: 'Answer questions from all categories', icon: '🌟', xp: 300 },
  { id: 'comeback', name: 'Comeback Kid', desc: 'Score 8+ after scoring below 5', icon: '🔄', xp: 200 },
  { id: 'daily_learner', name: 'Daily Learner', desc: 'Take quizzes on 5 different days', icon: '📅', xp: 250 },
  { id: 'risk_aware', name: 'Risk Aware', desc: 'Answer 5 risk questions correctly', icon: '🛡️', xp: 200 },
  { id: 'investiq_legend', name: 'InvestIQ Legend', desc: 'Unlock 10 achievements', icon: '🏆', xp: 1000 },
];

// ═══ Persistence Helpers ═══
function loadUserData() {
  try {
    const data = localStorage.getItem('investiq_data');
    if (data) return JSON.parse(data);
  } catch (e) { console.warn('Failed to load InvestIQ data'); }
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    quizzesCompleted: 0,
    perfectScores: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    categoriesAnswered: [],
    quizDays: [],
    lastQuizScore: null,
    achievements: [],
    bestScore: 0,
  };
}

function saveUserData(data) {
  try { localStorage.setItem('investiq_data', JSON.stringify(data)); } 
  catch (e) { console.warn('Failed to save InvestIQ data'); }
}

export default function InvestIQDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(loadUserData);
  const [quizState, setQuizState] = useState('idle'); // idle, playing, review, results
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(30);
  const [showExplanation, setShowExplanation] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showAchievementPopup, setShowAchievementPopup] = useState(null);
  const timerRef = useRef(null);
  const questionStartRef = useRef(null);

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const data = { ...userData };
    
    if (data.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (data.lastActiveDate === yesterday.toDateString()) {
        data.streak += 1;
      } else if (data.lastActiveDate !== today) {
        data.streak = 1;
      }
      data.lastActiveDate = today;
      data.xp += 25; // Daily login XP
      setUserData(data);
      saveUserData(data);
    }
  }, []); // eslint-disable-line

  // Timer countdown
  useEffect(() => {
    if (quizState === 'playing' && !showExplanation) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAnswer(-1); // time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [currentQ, quizState, showExplanation]); // eslint-disable-line

  // Derived values
  const currentLevel = LEVELS.slice().reverse().find(l => userData.xp >= l.xpNeeded) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.xpNeeded > userData.xp);
  const xpProgress = nextLevel 
    ? ((userData.xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100 
    : 100;

  const todayDate = new Date().toDateString();
  const hasPlayedToday = userData.quizDays && userData.quizDays.includes(todayDate);

  const startQuiz = () => {
    const q = getRandomQuiz(10);
    setQuestions(q);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setTimer(30);
    setShowExplanation(false);
    setEarnedXP(0);
    setNewAchievements([]);
    setQuizState('playing');
    questionStartRef.current = Date.now();
  };

  const handleAnswer = useCallback((answerIndex) => {
    if (showExplanation) return;
    clearInterval(timerRef.current);
    
    const question = questions[currentQ];
    const timeTaken = (Date.now() - questionStartRef.current) / 1000;
    const isCorrect = answerIndex === question.correct;
    
    let xpGain = 0;
    if (isCorrect) {
      xpGain = 50;
      if (timeTaken < 5) xpGain += 20; // Speed bonus
      else if (timeTaken < 15) xpGain += 10; // Quick bonus
    }
    
    const answer = {
      questionId: question.id,
      selected: answerIndex,
      correct: question.correct,
      isCorrect,
      timeTaken: Math.round(timeTaken),
      xpEarned: xpGain,
      category: question.category,
    };
    
    setAnswers(prev => [...prev, answer]);
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    setEarnedXP(prev => prev + xpGain);
  }, [currentQ, questions, showExplanation]);

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimer(30);
      questionStartRef.current = Date.now();
    }
  };

  const finishQuiz = () => {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const data = { ...userData };
    
    data.xp += earnedXP;
    data.quizzesCompleted += 1;
    data.totalCorrect += correctCount;
    data.totalAnswered += questions.length;
    data.lastQuizScore = correctCount;
    if (correctCount > data.bestScore) data.bestScore = correctCount;
    if (correctCount === 10) data.perfectScores += 1;
    
    // Track categories
    const newCats = [...new Set(answers.map(a => a.category))];
    data.categoriesAnswered = [...new Set([...data.categoriesAnswered, ...newCats])];
    
    // Track quiz days
    const today = new Date().toDateString();
    if (!data.quizDays.includes(today)) data.quizDays.push(today);
    
    // Check achievements
    const unlocked = [];
    const check = (id, condition) => {
      if (!data.achievements.includes(id) && condition) {
        data.achievements.push(id);
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) { data.xp += ach.xp; unlocked.push(ach); }
      }
    };
    
    check('quiz_rookie', data.quizzesCompleted >= 1);
    check('quiz_master', correctCount === 10);
    check('scholar', data.quizzesCompleted >= 5);
    check('perfect_3', data.perfectScores >= 3);
    check('xp_1000', data.xp >= 1000);
    check('xp_5000', data.xp >= 5000);
    check('streak_3', data.streak >= 3);
    check('streak_7', data.streak >= 7);
    check('knowledge_all', data.categoriesAnswered.length >= 5);
    check('daily_learner', data.quizDays.length >= 5);
    check('comeback', data.lastQuizScore !== null && userData.lastQuizScore < 5 && correctCount >= 8);
    check('risk_aware', answers.filter(a => a.category === 'Risk' && a.isCorrect).length >= 5);
    check('investiq_legend', data.achievements.length >= 10);
    
    // Check speed demon
    if (answers.some(a => a.isCorrect && a.timeTaken < 5)) {
      check('fast_answer', true);
    }
    
    setNewAchievements(unlocked);
    setUserData(data);
    saveUserData(data);
    setQuizState('results');
  };

  const score = answers.filter(a => a.isCorrect).length;

  // Achievement popup
  useEffect(() => {
    if (newAchievements.length > 0 && quizState === 'results') {
      let idx = 0;
      const show = () => {
        if (idx < newAchievements.length) {
          setShowAchievementPopup(newAchievements[idx]);
          idx++;
          setTimeout(show, 2500);
        } else {
          setShowAchievementPopup(null);
        }
      };
      setTimeout(show, 500);
    }
  }, [newAchievements, quizState]);

  return (
    <div className="app-container" style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: '#fff' }}>

      {/* Achievement Popup Toast */}
      {showAchievementPopup && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,229,255,0.15))',
          border: '1px solid rgba(16,185,129,0.4)', borderRadius: 16, padding: '16px 28px',
          display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'slideDown 0.4s ease',
        }}>
          <span style={{ fontSize: 36 }}>{showAchievementPopup.icon}</span>
          <div>
            <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Achievement Unlocked!</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{showAchievementPopup.name}</div>
            <div style={{ fontSize: 12, color: '#a1a1aa' }}>+{showAchievementPopup.xp} XP</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,8,15,0.9)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 16px', color: '#a1a1aa', cursor: 'pointer',
            fontSize: 14, fontFamily: 'Outfit', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#a1a1aa'; }}
          >← Back to Dashboard</button>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
            <span style={{ color: '#00e5ff' }}>Invest</span>IQ Challenge
          </h1>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>{userData.streak}</span>
            <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 600 }}>day streak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(168,85,247,0.1)', borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)' }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#a855f7' }}>⚡ {userData.xp.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 600 }}>XP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${currentLevel.color}15`, borderRadius: 10, border: `1px solid ${currentLevel.color}33` }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: currentLevel.color }}>{currentLevel.title}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>

        {/* ═══ QUIZ IDLE STATE ═══ */}
        {quizState === 'idle' && (
          <>
            {/* Hero Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,119,255,0.08))',
              border: '1px solid rgba(0,229,255,0.2)', borderRadius: 20, padding: '40px',
              marginBottom: 32, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, fontSize: 180, opacity: 0.04, pointerEvents: 'none' }}>🧠</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                <div>
                  <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0, marginBottom: 8 }}>Daily Quiz Challenge</h2>
                  <p style={{ fontSize: 16, color: '#a1a1aa', margin: 0, maxWidth: 500 }}>
                    Test your investment knowledge with 10 questions. Earn XP, unlock achievements, and climb the ranks!
                  </p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 13, color: '#71717a' }}>
                    <span>📝 10 Questions</span>
                    <span>⏱️ 30s per question</span>
                    <span>⚡ Up to 700 XP</span>
                  </div>
                </div>
                <button onClick={() => !hasPlayedToday && startQuiz()} disabled={hasPlayedToday} style={{
                  padding: '16px 40px', borderRadius: 14, border: 'none', cursor: hasPlayedToday ? 'not-allowed' : 'pointer',
                  background: hasPlayedToday ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00e5ff, #0077ff)', 
                  color: hasPlayedToday ? '#71717a' : '#000',
                  fontSize: 18, fontWeight: 800, fontFamily: 'Outfit', transition: 'all 0.25s',
                  boxShadow: hasPlayedToday ? 'none' : '0 8px 30px rgba(0,229,255,0.3)', position: 'relative', zIndex: 10,
                }}
                  onMouseEnter={e => !hasPlayedToday && (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => !hasPlayedToday && (e.currentTarget.style.transform = 'scale(1)')}
                >{hasPlayedToday ? "Come Back Tomorrow 🕒" : "Start Quiz →"}</button>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Level', value: `${currentLevel.level} — ${currentLevel.title}`, icon: '🏅', color: currentLevel.color },
                { label: 'Total XP', value: userData.xp.toLocaleString(), icon: '⚡', color: '#a855f7' },
                { label: 'Current Streak', value: `${userData.streak} days`, icon: '🔥', color: '#ef4444' },
                { label: 'Quizzes Taken', value: userData.quizzesCompleted, icon: '📝', color: '#3b82f6' },
                { label: 'Best Score', value: `${userData.bestScore}/10`, icon: '🏆', color: '#f59e0b' },
                { label: 'Accuracy', value: userData.totalAnswered ? `${Math.round((userData.totalCorrect / userData.totalAnswered) * 100)}%` : '—', icon: '🎯', color: '#10b981' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '20px',
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* XP Progress Bar */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 24, marginBottom: 32,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: currentLevel.color }}>Level {currentLevel.level} — {currentLevel.title}</span>
                {nextLevel && <span style={{ fontSize: 13, color: '#71717a' }}>{userData.xp.toLocaleString()} / {nextLevel.xpNeeded.toLocaleString()} XP to {nextLevel.title}</span>}
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 10, transition: 'width 1s ease',
                  width: `${xpProgress}%`,
                  background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || currentLevel.color})`,
                }}></div>
              </div>
            </div>

            {/* Achievements Gallery */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#fff' }}>
                🏆 Achievements <span style={{ fontSize: 14, color: '#71717a', fontWeight: 500 }}>({userData.achievements.length}/{ACHIEVEMENTS.length})</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {ACHIEVEMENTS.map((ach, i) => {
                  const unlocked = userData.achievements.includes(ach.id);
                  return (
                    <div key={i} style={{
                      background: unlocked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${unlocked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                      opacity: unlocked ? 1 : 0.4, transition: 'all 0.3s',
                    }}>
                      <span style={{ fontSize: 28, filter: unlocked ? 'none' : 'grayscale(1)' }}>{ach.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: unlocked ? '#10b981' : '#71717a' }}>{ach.name}</div>
                        <div style={{ fontSize: 11, color: '#52525b' }}>{ach.desc}</div>
                        <div style={{ fontSize: 10, color: unlocked ? '#10b981' : '#3f3f46', marginTop: 2 }}>+{ach.xp} XP</div>
                      </div>
                      {unlocked && <span style={{ marginLeft: 'auto', fontSize: 16, color: '#10b981' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ═══ QUIZ PLAYING STATE ═══ */}
        {quizState === 'playing' && questions[currentQ] && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
                <div style={{
                  height: '100%', borderRadius: 6, transition: 'width 0.4s',
                  width: `${((currentQ + (showExplanation ? 1 : 0)) / questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                }}></div>
              </div>
              <span style={{ fontSize: 13, color: '#71717a', fontWeight: 600, minWidth: 50 }}>{currentQ + 1}/{questions.length}</span>
            </div>

            {/* Timer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 8, fontWeight: 700,
                background: `rgba(${timer <= 10 ? '239,68,68' : '0,229,255'},0.12)`,
                color: timer <= 10 ? '#ef4444' : '#00e5ff',
              }}>⏱️ {timer}s</span>
              <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 8, background: 'rgba(168,85,247,0.12)', color: '#a855f7', fontWeight: 700 }}>
                {questions[currentQ].category} • {questions[currentQ].difficulty}
              </span>
              <span style={{ fontSize: 12, color: '#52525b' }}>+{earnedXP} XP earned</span>
            </div>

            {/* Question Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '36px 32px', marginBottom: 24,
            }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.5, color: '#fff' }}>
                {questions[currentQ].question}
              </h3>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {questions[currentQ].options.map((opt, i) => {
                const isCorrect = i === questions[currentQ].correct;
                const isSelected = selectedAnswer === i;
                let bg = 'rgba(255,255,255,0.03)';
                let border = 'rgba(255,255,255,0.08)';
                let textColor = '#fff';
                
                if (showExplanation) {
                  if (isCorrect) { bg = 'rgba(16,185,129,0.12)'; border = 'rgba(16,185,129,0.4)'; textColor = '#10b981'; }
                  else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; textColor = '#ef4444'; }
                  else { bg = 'rgba(255,255,255,0.02)'; textColor = '#52525b'; }
                }
                
                return (
                  <button key={i} onClick={() => !showExplanation && handleAnswer(i)} disabled={showExplanation}
                    style={{
                      padding: '18px 24px', borderRadius: 14, cursor: showExplanation ? 'default' : 'pointer',
                      background: bg, border: `1px solid ${border}`, color: textColor,
                      fontSize: 16, fontWeight: 600, fontFamily: 'Outfit', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!showExplanation) { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)'; e.currentTarget.style.background = 'rgba(0,229,255,0.06)'; }}}
                    onMouseLeave={e => { if (!showExplanation) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: showExplanation && isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      fontSize: 14, fontWeight: 800, color: showExplanation && isCorrect ? '#10b981' : '#71717a', flexShrink: 0,
                    }}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                    {showExplanation && isCorrect && <span style={{ marginLeft: 'auto', fontSize: 18 }}>✓</span>}
                    {showExplanation && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 18 }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div style={{
                background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)',
                borderRadius: 14, padding: '16px 20px', marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, color: '#00e5ff', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Explanation</div>
                <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.6 }}>{questions[currentQ].explanation}</div>
              </div>
            )}

            {/* Next Button */}
            {showExplanation && (
              <button onClick={nextQuestion} style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #00e5ff, #0077ff)', color: '#000',
                fontSize: 16, fontWeight: 800, fontFamily: 'Outfit', transition: 'all 0.2s',
              }}>
                {currentQ + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}
              </button>
            )}
          </div>
        )}

        {/* ═══ RESULTS STATE ═══ */}
        {quizState === 'results' && (
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            {/* Score Hero */}
            <div style={{
              background: score >= 8 ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,229,255,0.1))' : score >= 5 ? 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(168,85,247,0.1))' : 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.1))',
              border: `1px solid ${score >= 8 ? 'rgba(16,185,129,0.3)' : score >= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 24, padding: '48px 32px', marginBottom: 32,
            }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>{score === 10 ? '🏆' : score >= 8 ? '🌟' : score >= 5 ? '💪' : '📚'}</div>
              <div style={{ fontSize: 56, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                {score}<span style={{ fontSize: 28, color: '#71717a' }}>/10</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444', marginTop: 8 }}>
                {score === 10 ? 'PERFECT SCORE!' : score >= 8 ? 'Excellent!' : score >= 5 ? 'Good Job!' : 'Keep Learning!'}
              </div>
              <div style={{ fontSize: 14, color: '#71717a', marginTop: 8 }}>You earned <span style={{ color: '#a855f7', fontWeight: 800 }}>+{earnedXP} XP</span> this quiz</div>
            </div>

            {/* Answer Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left',
            }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#fff' }}>Answer Summary</h4>
              {answers.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: i < answers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: a.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: a.isCorrect ? '#10b981' : '#ef4444', fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}>{a.isCorrect ? '✓' : '✗'}</span>
                  <div style={{ flex: 1, fontSize: 13, color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Q{i + 1}: {questions[i]?.question}
                  </div>
                  <span style={{ fontSize: 11, color: '#52525b' }}>{a.timeTaken}s</span>
                  {a.xpEarned > 0 && <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 700 }}>+{a.xpEarned}</span>}
                </div>
              ))}
            </div>

            {/* New Achievements */}
            {newAchievements.length > 0 && (
              <div style={{
                background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left',
              }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>🏆 New Achievements Unlocked!</h4>
                {newAchievements.map((ach, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                    <span style={{ fontSize: 28 }}>{ach.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{ach.name}</div>
                      <div style={{ fontSize: 12, color: '#71717a' }}>{ach.desc} • +{ach.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button disabled={true} style={{
                flex: 1, padding: '16px', borderRadius: 14, border: 'none', cursor: 'not-allowed',
                background: 'rgba(255,255,255,0.1)', color: '#71717a',
                fontSize: 16, fontWeight: 800, fontFamily: 'Outfit',
              }}>Come Back Tomorrow 🕒</button>
              <button onClick={() => setQuizState('idle')} style={{
                flex: 1, padding: '16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: '#fff', cursor: 'pointer',
                fontSize: 16, fontWeight: 600, fontFamily: 'Outfit',
              }}>Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
