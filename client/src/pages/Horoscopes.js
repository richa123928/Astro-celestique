import React, { useState } from 'react';
import axios from 'axios';
import useIsMobile from '../hooks/useIsMobile';

const SIGNS = [
  { name: 'Aries',       symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire',  icon: '🐏' },
  { name: 'Taurus',      symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', icon: '🐂' },
  { name: 'Gemini',      symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air',   icon: '👫' },
  { name: 'Cancer',      symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', icon: '🦀' },
  { name: 'Leo',         symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire',  icon: '🦁' },
  { name: 'Virgo',       symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', icon: '👧' },
  { name: 'Libra',       symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air',   icon: '⚖️' },
  { name: 'Scorpio',     symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water', icon: '🦂' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire',  icon: '🏹' },
  { name: 'Capricorn',   symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth', icon: '🐐' },
  { name: 'Aquarius',    symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air',   icon: '🏺' },
  { name: 'Pisces',      symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water', icon: '🐟' },
];

const TYPES = ['daily', 'weekly', 'monthly', 'yearly'];

const ELEMENT_COLORS = {
  Fire:  'rgba(239,68,68,0.15)',
  Earth: 'rgba(34,197,94,0.15)',
  Air:   'rgba(99,179,237,0.15)',
  Water: 'rgba(99,102,241,0.15)',
};

export default function Horoscopes() {
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedType, setSelectedType] = useState('daily');
  const [horoscope,    setHoroscope]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const isMobile = useIsMobile();

  const fetchHoroscope = async (sign, type) => {
    setLoading(true);
    setError('');
    setHoroscope(null);
    try {
      const { data } = await axios.get(`/api/horoscope/${type}/${sign}`);
      setHoroscope(data);
    } catch (err) {
      setError('Failed to fetch horoscope. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignClick = (sign) => {
    setSelectedSign(sign);
    fetchHoroscope(sign.name, selectedType);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (selectedSign) fetchHoroscope(selectedSign.name, type);
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
          <span className="section-label">VEDIC ASTROLOGY</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            marginBottom: 16,
            lineHeight: 1.1
          }}>
            Your Daily <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Horoscope</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            Personalised Vedic insights based on planetary transits,
            nakshatras and dasha periods.
          </p>

          {/* Type selector */}
          <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 100,
                  border: '1px solid',
                  borderColor: selectedType === t ? 'var(--gold)' : 'var(--border-light)',
                  background: selectedType === t ? 'var(--gold)' : 'transparent',
                  color: selectedType === t ? 'var(--navy-deep)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>

        {/* Zodiac Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
          gap: 12,
          marginBottom: 48
        }}>
          {SIGNS.map(sign => (
            <button
              key={sign.name}
              onClick={() => handleSignClick(sign)}
              style={{
                background: selectedSign?.name === sign.name
                  ? 'rgba(201,150,60,0.15)'
                  : 'var(--navy-card)',
                border: '1px solid',
                borderColor: selectedSign?.name === sign.name
                  ? 'var(--gold)'
                  : 'var(--border-light)',
                borderRadius: 16,
                padding: '20px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span style={{ fontSize: 28 }}>{sign.icon}</span>
              <span style={{
                fontSize: 20,
                color: 'var(--gold-light)',
                fontFamily: 'var(--font-serif)'
              }}>
                {sign.symbol}
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: selectedSign?.name === sign.name
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
              }}>
                {sign.name}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                {sign.dates}
              </span>
            </button>
          ))}
        </div>

        {/* Select prompt */}
        {!selectedSign && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 32,
              color: 'var(--text-primary)',
              marginBottom: 12
            }}>
              Select your zodiac sign
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Click any sign above to reveal your {selectedType} horoscope
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: '50%',
              border: '2px solid var(--border-light)',
              borderTop: '2px solid var(--gold)',
              animation: 'rotate 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Reading the cosmic energies for {selectedSign?.name}...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '16px 20px',
            color: '#fca5a5', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Horoscope Result */}
        {horoscope && !loading && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>

            {/* Sign Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 24,
              marginBottom: 36, padding: '32px',
              background: 'var(--navy-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
            }}>
              <div style={{
                width: 80, height: 80,
                background: ELEMENT_COLORS[selectedSign.element],
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, flexShrink: 0,
              }}>
                {selectedSign.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 36, fontWeight: 400,
                    color: 'var(--text-primary)'
                  }}>
                    {selectedSign.name}
                  </h2>
                  <span style={{
                    fontSize: 28, color: 'var(--gold-light)',
                    fontFamily: 'var(--font-serif)'
                  }}>
                    {selectedSign.symbol}
                  </span>
                  <span style={{
                    background: ELEMENT_COLORS[selectedSign.element],
                    color: 'var(--text-muted)',
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 10px', borderRadius: 100,
                    letterSpacing: '0.08em'
                  }}>
                    {selectedSign.element}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {horoscope.date} · {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Horoscope
                </p>
              </div>

              {/* Rating */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 48, color: 'var(--gold-light)',
                  lineHeight: 1
                }}>
                  {horoscope.horoscope.rating}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  OUT OF 5
                </div>
                <div style={{ color: 'var(--gold)', fontSize: 16, marginTop: 4 }}>
                  {'★'.repeat(horoscope.horoscope.rating)}
                </div>
              </div>
            </div>

            {/* Overview */}
            <div style={{
              background: 'var(--navy-mid)',
              border: '1px solid var(--border-light)',
              borderRadius: 16, padding: '28px',
              marginBottom: 20,
            }}>
              <span className="section-label">OVERVIEW</span>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 20, color: 'var(--text-primary)',
                lineHeight: 1.7, fontStyle: 'italic'
              }}>
                "{horoscope.horoscope.overview}"
              </p>
            </div>

            {/* Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 16, marginBottom: 20
            }}>
              {[
                { label: 'LOVE & RELATIONSHIPS', icon: '❤️', text: horoscope.horoscope.love },
                { label: 'CAREER & FINANCE',     icon: '💼', text: horoscope.horoscope.career },
                { label: 'HEALTH & WELLNESS',    icon: '🌿', text: horoscope.horoscope.health },
              ].map(card => (
                <div key={card.label} style={{
                  background: 'var(--navy-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 16, padding: '24px',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 12 }}>{card.icon}</div>
                  <span className="section-label">{card.label}</span>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Lucky + Planetary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16, marginBottom: 20
            }}>
              {/* Lucky */}
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 16, padding: '24px',
              }}>
                <span className="section-label">TODAY'S LUCKY ELEMENTS</span>
                <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
                  {[
                    { label: 'Color',  value: horoscope.horoscope.luckyColor,  icon: '🎨' },
                    { label: 'Number', value: horoscope.horoscope.luckyNumber, icon: '🔢' },
                    { label: 'Day',    value: horoscope.horoscope.luckyDay,    icon: '📅' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{
                        fontSize: 15, fontWeight: 600,
                        color: 'var(--gold-light)', marginBottom: 2
                      }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Planetary */}
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 16, padding: '24px',
              }}>
                <span className="section-label">PLANETARY INFLUENCE</span>
                <p style={{
                  fontSize: 14, color: 'var(--text-muted)',
                  lineHeight: 1.6, marginTop: 8
                }}>
                  {horoscope.horoscope.planetaryInfluence}
                </p>
              </div>
            </div>

            {/* Affirmation */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(201,150,60,0.1) 0%, rgba(201,150,60,0.05) 100%)',
              border: '1px solid var(--border)',
              borderRadius: 16, padding: '28px',
              textAlign: 'center',
            }}>
              <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>
                TODAY'S AFFIRMATION
              </span>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22, color: 'var(--gold-light)',
                fontStyle: 'italic', lineHeight: 1.5,
                maxWidth: 600, margin: '0 auto'
              }}>
                "{horoscope.horoscope.affirmation}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}