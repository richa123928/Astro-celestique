import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useIsMobile from '../hooks/useIsMobile';


const CALCULATORS = [
  { key: 'numerology',   title: 'Numerology',        icon: '🔢', desc: 'Discover your life path, destiny and soul numbers' },
  { key: 'moon-sign',    title: 'Moon Sign',          icon: '🌙', desc: 'Find your true Rashi — the soul of Vedic astrology' },
  { key: 'rising-sign',  title: 'Rising Sign',        icon: '⬆️', desc: 'Calculate your Lagna — how the world sees you' },
  { key: 'nakshatra',    title: 'Nakshatra',          icon: '⭐', desc: 'Find your birth star and its deep significance' },
  { key: 'love',         title: 'Love Calculator',    icon: '❤️', desc: 'Calculate romantic compatibility between two people' },
  { key: 'sade-sati',    title: 'Sade Sati',          icon: '🪐', desc: 'Check if you are under Saturn\'s 7.5 year cycle' },
  { key: 'mangal-dosha', title: 'Mangal Dosha',       icon: '🔴', desc: 'Check for Mangal Dosha in your birth chart' },
  { key: 'moon-phase',   title: 'Moon Phase',         icon: '🌕', desc: 'Find the moon phase on any date' },
];

export default function Calculators() {
  const [active,  setActive]  = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({
    name: '', dob: '', name2: '', dob2: '', date: ''
  });

  const isMobile = useIsMobile();

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(`/api/calculators/${active}`, form);
      setResult(data);
    } catch (err) {
      toast.error('Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (active) {
      case 'numerology':
        return (
          <>
            <Field label="Full Name *">
              <Input placeholder="Your full name as on birth certificate"
                value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            </Field>
            <Field label="Date of Birth *">
              <Input type="date" value={form.dob}
                onChange={v => setForm(f => ({ ...f, dob: v }))} required />
            </Field>
          </>
        );
      case 'love':
        return (
          <>
            <Field label="Your Name *">
              <Input placeholder="Your full name"
                value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            </Field>
            <Field label="Partner's Name *">
              <Input placeholder="Partner's full name"
                value={form.name2} onChange={v => setForm(f => ({ ...f, name2: v }))} required />
            </Field>
          </>
        );
      case 'moon-phase':
        return (
          <Field label="Date *">
            <Input type="date" value={form.date}
              onChange={v => setForm(f => ({ ...f, date: v }))} required />
          </Field>
        );
      default:
        return (
          <Field label="Date of Birth *">
            <Input type="date" value={form.dob}
              onChange={v => setForm(f => ({ ...f, dob: v }))} required />
          </Field>
        );
    }
  };

  const calc = CALCULATORS.find(c => c.key === active);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '60px 0 40px'
      }}>
        <div className="container">
          <span className="section-label">VEDIC TOOLS</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Astrology <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Calculators</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            Free Vedic astrology calculators for numerology, moon sign,
            nakshatra, compatibility and more.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : (active ? '1fr 1.2fr' : '1fr'),
          gap: 24, alignItems: 'start'
        }}>

          {/* Calculator List */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: active ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 14
          }}>
            {CALCULATORS.map(c => (
              <button key={c.key}
                onClick={() => { setActive(c.key); setResult(null); setForm({ name:'', dob:'', name2:'', dob2:'', date:'' }); }}
                style={{
                  background: active === c.key ? 'rgba(201,150,60,0.1)' : 'var(--navy-card)',
                  border: '1px solid',
                  borderColor: active === c.key ? 'var(--gold)' : 'var(--border-light)',
                  borderRadius: 16, padding: '20px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 16,
                  textAlign: 'left', fontFamily: 'var(--font-sans)',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(201,150,60,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0
                }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: active === c.key ? 'var(--gold-light)' : 'var(--text-primary)',
                    marginBottom: 4
                  }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {c.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Calculator Form + Result */}
          {active && (
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 20, padding: '32px',
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <span style={{ fontSize: 28 }}>{calc?.icon}</span>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 24, color: 'var(--text-primary)'
                    }}>
                      {calc?.title} Calculator
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{calc?.desc}</p>
                  </div>
                </div>

                <form onSubmit={calculate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {renderForm()}
                  <button type="submit" disabled={loading}
                    style={{
                      width: '100%', padding: '14px',
                      background: loading ? 'var(--gold-dim)' : 'var(--gold)',
                      color: 'var(--navy-deep)', border: 'none',
                      borderRadius: 100, fontSize: 15, fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-sans)', marginTop: 8,
                    }}>
                    {loading ? 'Calculating...' : `Calculate ${calc?.title}`}
                  </button>
                </form>
              </div>

              {/* Result */}
              {result && (
                <div style={{
                  background: 'var(--navy-mid)',
                  border: '1px solid var(--border)',
                  borderRadius: 20, padding: '28px',
                  animation: 'fadeUp 0.4s ease both'
                }}>
                  <span className="section-label">YOUR RESULT</span>

                  {/* Main result */}
                  <div style={{
                    textAlign: 'center', padding: '20px 0',
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: 16
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 48, color: 'var(--gold-light)',
                      lineHeight: 1, marginBottom: 8
                    }}>
                      {result.mainResult}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                      {result.mainLabel}
                    </div>
                  </div>

                  {/* Details */}
                  {result.details && result.details.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border-light)',
                      fontSize: 14
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.value}</span>
                    </div>
                  ))}

                  {/* Analysis */}
                  {result.analysis && (
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 16, color: 'var(--text-primary)',
                      lineHeight: 1.7, marginTop: 16,
                      fontStyle: 'italic'
                    }}>
                      "{result.analysis}"
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ onChange, ...props }) {
  return (
    <input
      {...props}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border-light)',
        borderRadius: 10, fontSize: 14,
        color: 'var(--text-primary)', outline: 'none',
        fontFamily: 'var(--font-sans)',
      }}
    />
  );
}