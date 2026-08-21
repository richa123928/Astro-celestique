import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const FILTERS = ['ALL', 'VEDIC', 'LOVE & MARRIAGE', 'CAREER', 'TAROT', 'NUMEROLOGY', 'NADI', 'VASTU'];

const SORT_OPTIONS = [
  { label: 'Top Rated',    value: 'rating' },
  { label: 'Most Popular', value: 'sessions' },
  { label: 'Price: Low',   value: 'price_low' },
  { label: 'Price: High',  value: 'price_high' },
];

export default function Consultations() {
  const { convert }                     = useCurrency();
  const { isAuthenticated }             = useAuth();
  const navigate                        = useNavigate();
  const [astrologers,   setAstrologers]   = useState([]);
  const [astroLoading,  setAstroLoading]  = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy,       setSortBy]       = useState('rating');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [mode,         setMode]         = useState('chat');
  const [showComingSoon, setShowComingSoon] = useState({ show: false, astrologer: null, mode: '' });

  // Fetch real astrologers from the database — this includes live
  // online/busy/offline status merged in already, so we just refetch
  // periodically instead of tracking a separate status source.
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const { data } = await axios.get('/api/astrologers');
        setAstrologers(data.astrologers);
      } catch (err) {
        console.error('Failed to load astrologers', err);
      } finally {
        setAstroLoading(false);
      }
    };
    fetchAstrologers();
    const interval = setInterval(fetchAstrologers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConsult = (astrologer, consultMode, status) => {
    if (!isAuthenticated) {
      toast.error('Please login to consult an astrologer');
      navigate('/auth');
      return;
    }
    if (status === 'offline') {
      toast.error('This astrologer is currently offline');
      return;
    }
    if (status === 'busy') {
      toast('Astrologer is busy. You will be notified when available.', { icon: '⏰' });
      return;
    }
    if (consultMode === 'chat') {
      navigate('/consultation/chat', { state: { astrologer } });
    } else {
      setShowComingSoon({ show: true, astrologer, mode: consultMode });
    }
  };

  let filtered = astrologers.filter(a => {
    const matchesFilter = activeFilter === 'ALL' ||
      (a.expertise || []).some(e => e.toUpperCase().includes(activeFilter));
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.expertise || []).some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'sessions')   return (b.totalSessions || 0) - (a.totalSessions || 0);
    if (sortBy === 'price_low')  return a.rate - b.rate;
    if (sortBy === 'price_high') return b.rate - a.rate;
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '60px 0 40px'
      }}>
        <div className="container">
          <span className="section-label">VERIFIED VEDIC SCHOLARS</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Speak with masters of<br />
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>the Parashara lineage.</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500, marginBottom: 32 }}>
            Lineage-verified astrologers available for chat, call and video consultations.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'chat',  label: '💬 Chat' },
              { key: 'call',  label: '📞 Voice Call' },
            ].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)}
                style={{
                  padding: '10px 24px', borderRadius: 100,
                  border: '1px solid',
                  borderColor: mode === m.key ? 'var(--gold)' : 'var(--border-light)',
                  background: mode === m.key ? 'rgba(201,150,60,0.15)' : 'transparent',
                  color: mode === m.key ? 'var(--gold-light)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or expertise..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, minWidth: 240, padding: '12px 20px',
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 100, fontSize: 14,
              color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '12px 20px', background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 100, fontSize: 14,
              color: 'var(--text-muted)', outline: 'none',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 100,
                fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                color: activeFilter === f ? 'var(--navy-deep)' : 'var(--text-muted)',
                background: activeFilter === f ? 'var(--gold)' : 'rgba(255,255,255,0.04)',
                border: '1px solid',
                borderColor: activeFilter === f ? 'var(--gold)' : 'var(--border-light)',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)',
              }}>
              {f}
            </button>
          ))}
        </div>

        {astroLoading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
            Loading astrologers...
          </p>
        ) : (
          <>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 24 }}>
              Showing {filtered.length} astrologers
            </p>

            {filtered.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
                No astrologers match your search right now.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20
              }}>
                {filtered.map(a => {
                  const status = a.status || 'offline';
                  return (
                    <div key={a.id} style={{
                      background: 'var(--navy-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 20, overflow: 'hidden',
                      transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '14px 16px 0'
                      }}>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: status === 'online' ? 'rgba(34,197,94,0.15)' :
                                      status === 'busy'   ? 'rgba(251,191,36,0.15)' :
                                      'rgba(100,116,139,0.15)',
                          color: status === 'online' ? '#4ade80' :
                                 status === 'busy'   ? '#fbbf24' : '#94a3b8',
                          fontSize: 11, fontWeight: 600,
                          padding: '4px 10px', borderRadius: 100,
                        }}>
                          <div style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: 'currentColor',
                            animation: status === 'online' ? 'pulse 2s infinite' : 'none'
                          }} />
                          {status.toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--gold-light)', fontSize: 13, fontWeight: 600 }}>
                          ★ {(a.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      <div style={{
                        width: '100%', height: 200,
                        overflow: 'hidden',
                        margin: '8px 0',
                        background: 'linear-gradient(180deg, var(--navy-light) 0%, var(--navy-card) 100%)',
                      }}>
                        {a.avatar ? (
                          <img
                            src={a.avatar}
                            alt={a.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center 25%'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 72
                          }}>
                            🔮
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {a.name}
                            {a.verified && <span style={{ color: 'var(--gold)', marginLeft: 6, fontSize: 12 }}>✓</span>}
                          </h3>
                          <span style={{ color: 'var(--gold-light)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                            {convert(a.rate)}/min
                          </span>
                        </div>

                        <p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                          {(a.expertise || []).join(' · ')} · {a.experience} YRS
                        </p>

                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                          {a.bio}
                        </p>

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                          {(a.languages || []).map(lang => (
                            <span key={lang} style={{
                              fontSize: 11, padding: '3px 10px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--border-light)',
                              borderRadius: 100, color: 'var(--text-muted)'
                            }}>
                              {lang}
                            </span>
                          ))}
                        </div>

                        <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14 }}>
                          {(a.totalSessions || 0).toLocaleString()} consultations
                        </p>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleConsult(a, 'chat', status)}
                            style={{
                              flex: 1, padding: '10px',
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 100, fontSize: 12, fontWeight: 700,
                              letterSpacing: '0.08em', color: 'var(--text-primary)',
                              cursor: 'pointer', transition: 'all 0.2s',
                              fontFamily: 'var(--font-sans)',
                            }}>
                            CHAT
                          </button>
                          {status === 'busy' ? (
                            <button onClick={() => handleConsult(a, 'notify', status)}
                              style={{
                                flex: 1, padding: '10px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: 100, fontSize: 12, fontWeight: 700,
                                letterSpacing: '0.08em', color: 'var(--text-muted)',
                                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                              }}>
                              NOTIFY
                            </button>
                          ) : (
                            <button onClick={() => handleConsult(a, 'call', status)}
                              style={{
                                flex: 1, padding: '10px',
                                background: status === 'offline' ? 'rgba(255,255,255,0.04)' : 'var(--gold)',
                                border: 'none', borderRadius: 100,
                                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                                color: status === 'offline' ? 'var(--text-dim)' : 'var(--navy-deep)',
                                cursor: status === 'offline' ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-sans)', transition: 'all 0.2s',
                              }}>
                              {status === 'offline' ? 'OFFLINE' : 'CALL'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon.show && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 24
        }}>
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border)',
            borderRadius: 24, padding: '40px',
            width: '100%', maxWidth: 440,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {showComingSoon.mode === 'chat' ? '💬' : '📞'}
            </div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 28,
              color: 'var(--text-primary)', marginBottom: 8
            }}>
              {showComingSoon.mode === 'chat' ? 'Chat' : 'Call'} with {showComingSoon.astrologer?.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 16 }}>
              Rate: {convert(showComingSoon.astrologer?.rate)}/min
            </p>
            <div style={{
              background: 'rgba(201,150,60,0.1)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px', marginBottom: 24
            }}>
              <p style={{ color: 'var(--gold-light)', fontSize: 14, lineHeight: 1.6 }}>
                🚀 Live {showComingSoon.mode === 'chat' ? 'chat' : 'call'} system is coming very soon!
                Our team is currently onboarding astrologers.
                Book a puja session and we will connect you within 24 hours.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary"
                onClick={() => {
                  navigate('/puja');
                  setShowComingSoon({ show: false, astrologer: null, mode: '' });
                }}>
                Book a Session
              </button>
              <button className="btn-secondary"
                onClick={() => setShowComingSoon({ show: false, astrologer: null, mode: '' })}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}