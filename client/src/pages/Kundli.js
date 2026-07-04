import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

const RASHI_LIST = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)',
  'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
  'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)',
  'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const PLANETS = [
  { name: 'Sun',     symbol: '☉', color: '#f59e0b' },
  { name: 'Moon',    symbol: '☽', color: '#94a3b8' },
  { name: 'Mars',    symbol: '♂', color: '#ef4444' },
  { name: 'Mercury', symbol: '☿', color: '#10b981' },
  { name: 'Jupiter', symbol: '♃', color: '#f59e0b' },
  { name: 'Venus',   symbol: '♀', color: '#ec4899' },
  { name: 'Saturn',  symbol: '♄', color: '#6366f1' },
  { name: 'Rahu',    symbol: '☊', color: '#8b5cf6' },
  { name: 'Ketu',    symbol: '☋', color: '#8b5cf6' },
];

export default function Kundli() {
  const [step,    setStep]    = useState(1); // 1=form, 2=result
  const [loading, setLoading] = useState(false);
  const [kundli,  setKundli]  = useState(null);
  const [form, setForm] = useState({
    name: '', dob: '', tob: '', pob: '', lat: null, lng: null, timeNA: false, gender: 'male'
  });

  const generateKundli = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/kundli/generate', form);
      setKundli(data);
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to generate Kundli. Please try again.';
      toast.error(message);
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
          <span className="section-label">VEDIC BIRTH CHART</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Free <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Kundli</em> Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            Generate your precise Vedic birth chart with planetary positions,
            dashas, nakshatras and detailed analysis.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>

        {step === 1 && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 24, padding: '40px 36px'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 28, color: 'var(--text-primary)',
                marginBottom: 8
              }}>Enter Birth Details</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
                Accurate birth details ensure precise planetary calculations
              </p>

              <form onSubmit={generateKundli} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Full Name <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <input type="text" required placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Gender <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['male', 'female', 'other'].map(g => (
                      <button key={g} type="button"
                        onClick={() => setForm(f => ({ ...f, gender: g }))}
                        style={{
                          flex: 1, padding: '10px',
                          borderRadius: 10, border: '1px solid',
                          borderColor: form.gender === g ? 'var(--gold)' : 'var(--border-light)',
                          background: form.gender === g ? 'rgba(201,150,60,0.15)' : 'transparent',
                          color: form.gender === g ? 'var(--gold-light)' : 'var(--text-muted)',
                          cursor: 'pointer', fontSize: 13, fontWeight: 500,
                          fontFamily: 'var(--font-sans)', textTransform: 'capitalize',
                          transition: 'all 0.2s'
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Date of Birth <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <input type="date" required
                    value={form.dob}
                    onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* TOB */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Time of Birth
                  </label>
                  <input type="time"
                    value={form.tob}
                    disabled={form.timeNA}
                    onChange={e => setForm(f => ({ ...f, tob: e.target.value }))}
                    style={{ ...inputStyle, opacity: form.timeNA ? 0.5 : 1 }}
                  />
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginTop: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer'
                  }}>
                    <input type="checkbox"
                      checked={form.timeNA}
                      onChange={e => setForm(f => ({ ...f, timeNA: e.target.checked, tob: '' }))}
                    />
                    Time not available (will use sunrise time)
                  </label>
                </div>

                {/* POB */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Place of Birth <span style={{ color: 'var(--gold)' }}>*</span>
                  </label>
                  <PlaceAutocomplete
                    value={form.pob}
                    onChange={text => setForm(f => ({ ...f, pob: text }))}
                    onSelect={place => setForm(f => ({ ...f, pob: place.displayName, lat: place.lat, lng: place.lng }))}
                    inputStyle={inputStyle}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Start typing and pick your city from the list for the most accurate chart.
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '16px',
                    background: loading ? 'var(--gold-dim)' : 'var(--gold)',
                    color: 'var(--navy-deep)', border: 'none',
                    borderRadius: 100, fontSize: 16, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-sans)', marginTop: 8,
                    transition: 'all 0.2s'
                  }}>
                  {loading ? '✨ Calculating planetary positions...' : 'Generate Free Kundli ✨'}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 2 && kundli && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 32
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 36, color: 'var(--text-primary)', marginBottom: 4
                }}>
                  {kundli.name}'s Kundli
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {kundli.dob} · {kundli.tob || 'Sunrise time'} · {kundli.pob}
                </p>
              </div>
              <button className="btn-secondary"
                onClick={() => { setStep(1); setKundli(null); }}>
                ← New Kundli
              </button>
            </div>

            {/* Main Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20, marginBottom: 20
            }}>

              {/* Birth Chart Visual */}
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 20, padding: 28
              }}>
                <span className="section-label">NORTH INDIAN CHART</span>
                <div style={{
                  width: '100%', aspectRatio: '1',
                  border: '1px solid var(--border)',
                  borderRadius: 8, marginTop: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gridTemplateRows: '1fr 1fr 1fr 1fr',
                  position: 'relative',
                  background: 'var(--navy-mid)',
                }}>
                  {/* North Indian chart layout — rotates based on real Ascendant */}
                  {(() => {
                    const houses = getChartHouses(kundli);
                    if (!houses) return null;
                    return houses.map((house, i) => (
                      <div key={i} style={{
                        border: '1px solid var(--border-light)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: 4, fontSize: 10,
                        color: 'var(--text-muted)',
                        gridColumn: getGridCol(i),
                        gridRow: getGridRow(i),
                      }}>
                        <span style={{ color: 'var(--gold)', fontSize: 12 }}>
                          {RASHI_LIST[house.rashiIndex].split('(')[0]}
                        </span>
                        <span style={{ fontSize: 9, textAlign: 'center', marginTop: 2 }}>
                          {house.planets.join(', ') || '—'}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Basic Details */}
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 20, padding: 28
              }}>
                <span className="section-label">BASIC DETAILS</span>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Rashi (Moon Sign)', value: kundli.planets?.Moon?.rashi },
                    { label: 'Lagna (Ascendant)', value: kundli.ascendant?.rashi },
                    { label: 'Nakshatra',         value: kundli.panchang?.nakshatra?.name },
                    { label: 'Pada',              value: kundli.panchang?.nakshatra?.pada },
                    { label: 'Tithi',             value: kundli.panchang?.tithi?.label },
                    { label: 'Yoga',              value: kundli.panchang?.yoga?.name },
                    { label: 'Current Dasha',     value: kundli.dasha?.current?.lord ? `${kundli.dasha.current.lord} Mahadasha` : null },
                    { label: 'Dasha End',         value: kundli.dasha?.current?.end },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border-light)',
                      fontSize: 14
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Planetary Positions */}
            <div style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 20, padding: 28,
              marginBottom: 20
            }}>
              <span className="section-label">PLANETARY POSITIONS</span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12, marginTop: 16
              }}>
                {PLANETS.map((planet) => (
                  <div key={planet.name} style={{
                    background: 'var(--navy-mid)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 12, padding: '16px',
                    display: 'flex', alignItems: 'center', gap: 12
                  }}>
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: '50%',
                      background: `${planet.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: planet.color, flexShrink: 0
                    }}>
                      {planet.symbol}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {planet.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {kundli.planets?.[planet.name]?.rashi?.split('(')[0] || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            {kundli.analysis && (
              <div style={{
                background: 'var(--navy-mid)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: 28,
                marginBottom: 20
              }}>
                <span className="section-label">AI VEDIC ANALYSIS</span>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18, color: 'var(--text-primary)',
                  lineHeight: 1.8, marginTop: 12,
                  fontStyle: 'italic'
                }}>
                  {kundli.analysis}
                </p>
              </div>
            )}

            {/* CTA */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(201,150,60,0.1) 0%, rgba(201,150,60,0.05) 100%)',
              border: '1px solid var(--border)',
              borderRadius: 20, padding: '32px 40px',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: 24
            }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 24, color: 'var(--text-primary)', marginBottom: 8
                }}>
                  Want a detailed analysis?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Talk to our expert astrologers for an in-depth Kundli reading
                </p>
              </div>
              <button className="btn-primary"
                onClick={() => window.location.href = '/consultations'}>
                Talk to Astrologer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '13px 16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-light)',
  borderRadius: 10, fontSize: 14,
  color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)', display: 'block',
  transition: 'border-color 0.2s',
};

function getGridCol(i) {
  const cols = [2, 3, 4, 4, 4, 3, 2, 1, 1, 1, 2, 3];
  return cols[i];
}

function getGridRow(i) {
  const rows = [1, 1, 1, 2, 3, 4, 4, 4, 3, 2, 2, 2];
  return rows[i];
}

// Given the real chart data, figure out which house (1-12) each planet
// sits in, based on its rashi relative to the Ascendant's rashi. North
// Indian charts rotate their rashi labels around a fixed house layout —
// house 1 always shows the Ascendant's sign, then signs follow in order.
function getChartHouses(kundli) {
  if (!kundli?.ascendant || !kundli?.planets) return null;

  const ascendantIndex = Math.floor(kundli.ascendant.longitude / 30);

  const houses = Array.from({ length: 12 }, (_, i) => ({
    houseNumber: i + 1,
    rashiIndex: (ascendantIndex + i) % 12,
    planets: []
  }));

  Object.entries(kundli.planets).forEach(([name, data]) => {
    const planetRashiIndex = Math.floor(data.longitude / 30);
    const houseIndex = (planetRashiIndex - ascendantIndex + 12) % 12;
    houses[houseIndex].planets.push(name);
  });

  return houses;
}