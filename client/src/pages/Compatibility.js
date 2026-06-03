import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const COMPATIBILITY_TYPES = [
  {
    key: 'kundli',
    title: 'Kundli Matching',
    icon: '📜',
    desc: 'Complete Ashtakoota matching with all 36 gunas and dasha synchronisation',
    fields: ['both']
  },
  {
    key: 'love',
    title: 'Love Compatibility',
    icon: '❤️',
    desc: 'Emotional and karmic alignment between two people',
    fields: ['both']
  },
  {
    key: 'zodiac',
    title: 'Zodiac Compatibility',
    icon: '⭐',
    desc: 'Sun sign compatibility based on Vedic astrology principles',
    fields: ['signs']
  },
  {
    key: 'friendship',
    title: 'Friendship Compatibility',
    icon: '🤝',
    desc: 'Check if two people are cosmically aligned as friends',
    fields: ['names']
  },
];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function Compatibility() {
  const [activeType, setActiveType] = useState('kundli');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [form,       setForm]       = useState({
    name1: '', dob1: '', tob1: '', pob1: '',
    name2: '', dob2: '', tob2: '', pob2: '',
    sign1: 'Aries', sign2: 'Taurus',
  });

  const activeConfig = COMPATIBILITY_TYPES.find(t => t.key === activeType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(`/api/calculators/compatibility-${activeType}`, form);
      setResult(data);
    } catch (err) {
      toast.error('Failed to calculate compatibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '60px 0 40px'
      }}>
        <div className="container">
          <span className="section-label">VEDIC COMPATIBILITY</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Cosmic <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Compatibility</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            Discover your cosmic alignment with Vedic astrology compatibility analysis
            based on ancient Jyotish principles.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>

        {/* Type selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14, marginBottom: 40
        }}>
          {COMPATIBILITY_TYPES.map(t => (
            <button key={t.key}
              onClick={() => { setActiveType(t.key); setResult(null); }}
              style={{
                background: activeType === t.key ? 'rgba(201,150,60,0.1)' : 'var(--navy-card)',
                border: '1px solid',
                borderColor: activeType === t.key ? 'var(--gold)' : 'var(--border-light)',
                borderRadius: 16, padding: '20px',
                cursor: 'pointer', transition: 'all 0.2s',
                textAlign: 'left', fontFamily: 'var(--font-sans)',
              }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
              <div style={{
                fontSize: 15, fontWeight: 600, marginBottom: 6,
                color: activeType === t.key ? 'var(--gold-light)' : 'var(--text-primary)'
              }}>
                {t.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: result ? '1fr 1.2fr' : '1fr',
          gap: 24, alignItems: 'start',
          maxWidth: result ? '100%' : 760,
          margin: result ? '0' : '0 auto'
        }}>

          {/* Form */}
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 20, padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <span style={{ fontSize: 28 }}>{activeConfig?.icon}</span>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: 24,
                color: 'var(--text-primary)'
              }}>
                {activeConfig?.title}
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Zodiac signs form */}
              {activeConfig?.fields.includes('signs') && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Your Zodiac Sign *
                    </label>
                    <select value={form.sign1}
                      onChange={e => setForm(f => ({ ...f, sign1: e.target.value }))}
                      style={selectStyle}>
                      {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Partner's Zodiac Sign *
                    </label>
                    <select value={form.sign2}
                      onChange={e => setForm(f => ({ ...f, sign2: e.target.value }))}
                      style={selectStyle}>
                      {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* Names only form */}
              {activeConfig?.fields.includes('names') && !activeConfig?.fields.includes('both') && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Your Name *
                    </label>
                    <input type="text" required placeholder="Your full name"
                      value={form.name1}
                      onChange={e => setForm(f => ({ ...f, name1: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Friend's Name *
                    </label>
                    <input type="text" required placeholder="Friend's full name"
                      value={form.name2}
                      onChange={e => setForm(f => ({ ...f, name2: e.target.value }))}
                      style={inputStyle} />
                  </div>
                </>
              )}

              {/* Full details form */}
              {activeConfig?.fields.includes('both') && (
                <>
                  {/* Person 1 */}
                  <div style={{
                    padding: 16,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 12,
                    border: '1px solid var(--border-light)'
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', marginBottom: 14, letterSpacing: '0.06em' }}>
                      PERSON 1
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Full Name *</label>
                        <input type="text" required placeholder="Full name"
                          value={form.name1} onChange={e => setForm(f => ({ ...f, name1: e.target.value }))}
                          style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Date of Birth *</label>
                          <input type="date" required value={form.dob1}
                            onChange={e => setForm(f => ({ ...f, dob1: e.target.value }))}
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Time of Birth</label>
                          <input type="time" value={form.tob1}
                            onChange={e => setForm(f => ({ ...f, tob1: e.target.value }))}
                            style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Place of Birth *</label>
                        <input type="text" required placeholder="City, Country"
                          value={form.pob1} onChange={e => setForm(f => ({ ...f, pob1: e.target.value }))}
                          style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Person 2 */}
                  <div style={{
                    padding: 16,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 12,
                    border: '1px solid var(--border-light)'
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', marginBottom: 14, letterSpacing: '0.06em' }}>
                      PERSON 2
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Full Name *</label>
                        <input type="text" required placeholder="Full name"
                          value={form.name2} onChange={e => setForm(f => ({ ...f, name2: e.target.value }))}
                          style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Date of Birth *</label>
                          <input type="date" required value={form.dob2}
                            onChange={e => setForm(f => ({ ...f, dob2: e.target.value }))}
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Time of Birth</label>
                          <input type="time" value={form.tob2}
                            onChange={e => setForm(f => ({ ...f, tob2: e.target.value }))}
                            style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Place of Birth *</label>
                        <input type="text" required placeholder="City, Country"
                          value={form.pob2} onChange={e => setForm(f => ({ ...f, pob2: e.target.value }))}
                          style={inputStyle} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'var(--gold-dim)' : 'var(--gold)',
                color: 'var(--navy-deep)', border: 'none',
                borderRadius: 100, fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}>
                {loading ? '✨ Calculating...' : `Check ${activeConfig?.title}`}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div style={{ animation: 'fadeUp 0.5s ease both' }}>

              {/* Score */}
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: '32px',
                textAlign: 'center', marginBottom: 16
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
                  {result.mainLabel || 'COMPATIBILITY SCORE'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 72, color: 'var(--gold-light)',
                  lineHeight: 1, marginBottom: 8
                }}>
                  {result.mainResult}
                </div>

                {/* Score bar */}
                {result.mainResult && String(result.mainResult).includes('%') && (
                  <div style={{
                    width: '100%', height: 8,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 100, margin: '16px 0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: result.mainResult,
                      height: '100%',
                      background: `linear-gradient(90deg, var(--gold-dim), var(--gold-light))`,
                      borderRadius: 100,
                      transition: 'width 1s ease'
                    }} />
                  </div>
                )}

                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {result.analysis}
                </p>
              </div>

              {/* Details */}
              {result.details && (
                <div style={{
                  background: 'var(--navy-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 20, padding: '28px',
                  marginBottom: 16
                }}>
                  <span className="section-label">DETAILED ANALYSIS</span>
                  <div style={{ marginTop: 16 }}>
                    {result.details.map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: '1px solid var(--border-light)',
                        fontSize: 14
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                        <span style={{
                          color: d.value === 'High' || d.value === 'Strong' || d.value === 'Excellent'
                            ? '#4ade80'
                            : d.value === 'Low' || d.value === 'Weak'
                            ? '#f87171'
                            : 'var(--text-primary)',
                          fontWeight: 600
                        }}>
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(201,150,60,0.1) 0%, rgba(201,150,60,0.05) 100%)',
                border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px',
                textAlign: 'center'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
                  Want a detailed Kundli matching report from a Vedic expert?
                </p>
                <a href="/consultations" className="btn-primary">
                  Talk to Astrologer
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-light)',
  borderRadius: 10, fontSize: 13,
  color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)', display: 'block',
};

const selectStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--navy-mid)',
  border: '1px solid var(--border-light)',
  borderRadius: 10, fontSize: 13,
  color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)', cursor: 'pointer',
};