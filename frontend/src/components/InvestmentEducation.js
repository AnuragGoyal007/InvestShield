import React, { useState, useMemo } from 'react';
import { educationTopics, educationCategories } from '../data/educationData';

export default function InvestmentEducation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Filter topics based on search and category
  const filteredTopics = useMemo(() => {
    return educationTopics.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            topic.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || topic.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Handle returning from detailed view
  const handleBack = () => {
    setSelectedTopic(null);
    window.scrollTo({ top: document.getElementById('education').offsetTop - 100, behavior: 'smooth' });
  };

  // Handle opening detailed view
  const handleOpenTopic = (topic) => {
    setSelectedTopic(topic);
    setTimeout(() => {
      document.getElementById('education-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      
      {/* ═══ Header Section ═══ */}
      {!selectedTopic && (
        <div style={{ textAlign: 'left', marginBottom: 40 }} className="animate-cascade-1">
          <span style={{ color: '#00e5ff', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Knowledge Hub
          </span>
          <h2 style={{ fontSize: 48, marginTop: 8, marginBottom: 16 }}>Investment Education</h2>
          <p style={{ color: '#a1a1aa', fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>
            Master the fundamentals of wealth creation. Learn at your own pace, demystify financial jargon, and build the confidence required to execute long-term strategies.
          </p>

          {/* Search and Filters */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Search Bar */}
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.5 }}>🔍</span>
              <input
                type="text"
                placeholder="Search concepts (e.g., SIP, ETFs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, color: '#fff', fontSize: 15, fontFamily: 'Outfit', transition: 'all 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#00e5ff'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {educationCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s', border: '1px solid',
                    background: activeCategory === cat ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                    borderColor: activeCategory === cat ? '#00e5ff' : 'rgba(255,255,255,0.1)',
                    color: activeCategory === cat ? '#00e5ff' : '#a1a1aa'
                  }}
                  onMouseOver={e => { if (activeCategory !== cat) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseOut={e => { if (activeCategory !== cat) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Detailed View ═══ */}
      {selectedTopic && (
        <div id="education-detail" className="animate-cascade-1" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px', position: 'relative' }}>
          
          <button onClick={handleBack} style={{
            background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, padding: 0, marginBottom: 24, transition: 'color 0.2s'
          }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#a1a1aa'}>
            ← Back to Knowledge Hub
          </button>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
              {selectedTopic.difficulty}
            </span>
            <span style={{ color: '#a1a1aa', fontSize: 13, display: 'flex', alignItems: 'center' }}>
              ⏱️ {selectedTopic.readTime}
            </span>
          </div>

          <h2 style={{ fontSize: 42, marginBottom: 12, color: '#fff' }}>{selectedTopic.title}</h2>
          <p style={{ fontSize: 18, color: '#00e5ff', marginBottom: 40, fontWeight: 500 }}>{selectedTopic.shortDesc}</p>

          <div className="education-content" style={{ fontSize: 16, lineHeight: 1.8, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selectedTopic.content.split('\n').map((paragraph, idx) => {
              if (paragraph.startsWith('###')) {
                return <h3 key={idx} style={{ color: '#fff', marginTop: 24, marginBottom: 8, fontSize: 22 }}>{paragraph.replace('###', '').trim()}</h3>;
              } else if (paragraph.startsWith('-')) {
                return (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ color: '#00e5ff', marginTop: 4 }}>•</span>
                    <span>{paragraph.substring(1)}</span>
                  </div>
                );
              } else if (paragraph.trim() === '') {
                return null;
              }
              // Handle basic bold markdown implementation
              const formattedText = paragraph.split('**').map((part, i) => i % 2 !== 0 ? <strong key={i} style={{color: '#fff'}}>{part}</strong> : part);
              return <p key={idx} style={{ margin: 0 }}>{formattedText}</p>;
            })}
          </div>

          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ padding: 24, background: 'rgba(99, 102, 241, 0.08)', borderRadius: 16, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <h4 style={{ margin: 0, color: '#818cf8', fontSize: 16 }}>Why it matters</h4>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>{selectedTopic.whyItMatters}</p>
            </div>

            <div style={{ padding: 24, background: 'rgba(0, 229, 255, 0.08)', borderRadius: 16, border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>🎯</span>
                <h4 style={{ margin: 0, color: '#00e5ff', fontSize: 16 }}>Quick Takeaway</h4>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#e2e8f0', lineHeight: 1.6 }}>{selectedTopic.takeaway}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Topics Grid ═══ */}
      {!selectedTopic && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }} className="animate-cascade-2">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic, index) => (
              <div 
                key={topic.id}
                onClick={() => handleOpenTopic(topic)}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: 28, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box',
                  animationDelay: `${index * 0.05}s`
                }}
                className="hover-card-elevate"
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <span style={{ 
                    background: topic.difficulty === 'Beginner' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                    color: topic.difficulty === 'Beginner' ? '#10b981' : '#f59e0b', 
                    border: `1px solid ${topic.difficulty === 'Beginner' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`, 
                    padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                  }}>
                    {topic.difficulty}
                  </span>
                  <span style={{ color: '#a1a1aa', fontSize: 12, fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⏱️ {topic.readTime}
                  </span>
                </div>

                <h3 style={{ fontSize: 22, color: '#fff', margin: '0 0 12px 0', fontFamily: 'Outfit' }}>{topic.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px 0', flexGrow: 1 }}>
                  {topic.shortDesc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                  <span style={{ color: '#a1a1aa', fontSize: 12 }}>{topic.category}</span>
                  <span style={{ color: '#00e5ff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Learn More <span style={{ fontSize: 16 }}>→</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', background: 'rgba(15,23,42,0.4)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🕵️</div>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '0 0 8px 0' }}>No topics found</h3>
              <p style={{ color: '#a1a1aa', margin: 0 }}>Try adjusting your search query or category filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
