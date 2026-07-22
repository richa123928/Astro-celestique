import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PLANET_ICONS = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Rahu: '☊', Ketu: '☋'
};

export default function Panchang() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panchang,     setPanchang]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchPanchang(new Date());
  }, []);

  const fetchPanchang = async (date) => {
    setLoading(true);
    setPanchang(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await axios.post('/api/panchang/daily', { date: dateStr });
      setPanchang(data);
    } catch (err) {
      toast.error('Failed to fetch Panchang');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    fetchPanchang(date);
  };

  const getDaysInMonth = (date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear();
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
          <span className="section-label">VEDIC CALENDAR</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Daily <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Panchang</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            Today's Vedic almanac with Tithi, Nakshatra, Yoga, Karana,
            auspicious timings and planetary positions.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: 24, alignItems: 'start'
        }}>

          {/* Calendar */}
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 20, padding: '24px',
            position: 'sticky', top: 100
          }}>
            {/* Month nav */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20
            }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)',
                  borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14
                }}>←</button>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-primary)' }}>
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)',
                  borderRadius: 8, padding: '6px 12px', color: 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14
                }}>→</button>
            </div>

            {/* Weekday headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {WEEKDAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, padding: '4px 0' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day  = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                return (
                  <button key={day}
                    onClick={() => handleDateClick(date)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: isSelected(day) ? 'var(--gold)' : 'transparent',
                      background: isSelected(day)
                        ? 'rgba(201,150,60,0.2)'
                        : isToday(day)
                        ? 'rgba(201,150,60,0.08)'
                        : 'transparent',
                      color: isSelected(day)
                        ? 'var(--gold-light)'
                        : isToday(day)
                        ? 'var(--gold)'
                        : 'var(--text-muted)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13, fontWeight: isToday(day) ? 700 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(201,150,60,0.3)' }} />
                Today
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(201,150,60,0.2)', border: '1px solid var(--gold)' }} />
                Selected
              </div>
            </div>
          </div>

          {/* Panchang Details */}
          <div>
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  border: '2px solid var(--border-light)',
                  borderTop: '2px solid var(--gold)',
                  animation: 'rotate 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p style={{ color: 'var(--text-muted)' }}>
                  Calculating cosmic positions...
                </p>
              </div>
            )}

            {panchang && !loading && (
              <div style={{ animation: 'fadeUp 0.4s ease both' }}>

                {/* Date header */}
                <div style={{
                  background: 'var(--navy-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 20, padding: '24px 28px',
                  marginBottom: 16,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-serif)', fontSize: 28,
                      color: 'var(--text-primary)', marginBottom: 4
                    }}>
                      {selectedDate.toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric',
                        month: 'long', year: 'numeric'
                      })}
                    </h2>
                    <p style={{ color: 'var(--gold)', fontSize: 14 }}>
                      {panchang.vikramSamvat || 'Vikram Samvat 2082'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 4 }}>PAKSHA</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {panchang.paksha || 'Krishna Paksha'}
                    </div>
                  </div>
                </div>

                {/* Pancha Angas */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 12, marginBottom: 16
                }}>
                  {[
                    { label: 'TITHI',     value: panchang.tithi,     icon: '🌙' },
                    { label: 'NAKSHATRA', value: panchang.nakshatra, icon: '⭐' },
                    { label: 'YOGA',      value: panchang.yoga,      icon: '✨' },
                    { label: 'KARANA',    value: panchang.karana,    icon: '🔮' },
                    { label: 'VAR',       value: panchang.var,       icon: '📅' },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'var(--navy-card)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 16, padding: '16px 12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                      <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 6 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.3 }}>
                        {item.value || 'Loading...'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Planetary Positions */}
                <div style={{
                  background: 'var(--navy-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 20, padding: '24px',
                  marginBottom: 16
                }}>
                  <span className="section-label">PLANETARY POSITIONS</span>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12, marginTop: 16
                  }}>

                    {(panchang.planets || []).map((p, i) => (
                      <div key={i} style={{
                        background: 'var(--navy-mid)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 12, padding: '12px',
                        display: 'flex', alignItems: 'center', gap: 10
                      }}>
                        <span style={{ fontSize: 20 }}>{PLANET_ICONS[p.name] || '✦'}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gold)' }}>{p.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auspicious Timings */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 16, marginBottom: 16
                }}>
                  <div style={{
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 20, padding: '24px'
                  }}>
                    <span className="section-label">AUSPICIOUS TIMINGS</span>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {(panchang.auspicious || []).map((t, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '10px 0', borderBottom: '1px solid var(--border-light)',
                          fontSize: 13
                        }}>
                          <span style={{ color: 'var(--text-muted)' }}>{t.label}</span>
                          <span style={{ color: '#4ade80', fontWeight: 500 }}>{t.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 20, padding: '24px'
                  }}>
                    <span className="section-label">INAUSPICIOUS TIMINGS</span>
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {(panchang.inauspicious || []).map((t, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '10px 0', borderBottom: '1px solid var(--border-light)',
                          fontSize: 13
                        }}>
                          <span style={{ color: 'var(--text-muted)' }}>{t.label}</span>
                          <span style={{ color: '#f87171', fontWeight: 500 }}>{t.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Guidance */}
                {panchang.guidance && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(201,150,60,0.1) 0%, rgba(201,150,60,0.05) 100%)',
                    border: '1px solid var(--border)',
                    borderRadius: 20, padding: '28px',
                  }}>
                    <span className="section-label">TODAY'S COSMIC GUIDANCE</span>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 18, color: 'var(--text-primary)',
                      lineHeight: 1.7, marginTop: 12, fontStyle: 'italic'
                    }}>
                      "{panchang.guidance}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}