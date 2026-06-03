import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

const AI_TOOLS = [
  {
    category: 'HOROSCOPE',
    title: 'Daily Horoscope',
    desc: 'Personalised planetary transits for today based on your zodiac sign.',
    icon: '☀️',
    href: '/horoscopes/daily',
    badge: 'FREE',
  },
  {
    category: 'HOROSCOPE',
    title: 'Weekly Forecast',
    desc: 'Week-ahead cosmic insights for love, career and health.',
    icon: '📅',
    href: '/horoscopes/weekly',
    badge: 'FREE',
  },
  {
    category: 'HOROSCOPE',
    title: 'Monthly Horoscope',
    desc: 'Monthly dasha-aware predictions for all 12 signs.',
    icon: '🌙',
    href: '/horoscopes/monthly',
    badge: 'FREE',
  },
  {
    category: 'HOROSCOPE',
    title: 'Yearly Forecast',
    desc: 'Long-arc yearly predictions based on planetary transits.',
    icon: '🪐',
    href: '/horoscopes/yearly',
    badge: 'FREE',
  },
  {
    category: 'KUNDLI',
    title: 'Free Kundli',
    desc: 'Generate your precise Vedic birth chart in seconds.',
    icon: '📜',
    href: '/kundli',
    badge: 'FREE',
  },
  {
    category: 'KUNDLI',
    title: 'Dosha Analysis',
    desc: 'Mangal, Kaal Sarp, Sade Sati — diagnosed and explained.',
    icon: '🔴',
    href: '/kundli/dosha',
    badge: 'FREE',
  },
  {
    category: 'COMPATIBILITY',
    title: 'Kundli Matching',
    desc: 'Complete Ashtakoota matching with all 36 gunas.',
    icon: '💑',
    href: '/compatibility/kundli',
    badge: 'FREE',
  },
  {
    category: 'COMPATIBILITY',
    title: 'Love Compatibility',
    desc: 'Emotional and karmic alignment between two people.',
    icon: '❤️',
    href: '/compatibility/love',
    badge: 'FREE',
  },
  {
    category: 'COMPATIBILITY',
    title: 'Zodiac Compatibility',
    desc: 'Sun sign compatibility based on Vedic astrology.',
    icon: '⭐',
    href: '/compatibility/zodiac',
    badge: 'FREE',
  },
  {
    category: 'CALCULATORS',
    title: 'Numerology',
    desc: 'Mulank, Bhagyank and personal year insights.',
    icon: '🔢',
    href: '/calculators/numerology',
    badge: 'FREE',
  },
  {
    category: 'CALCULATORS',
    title: 'Moon Sign',
    desc: 'Find your true Rashi — the soul of Vedic astrology.',
    icon: '🌙',
    href: '/calculators/moon-sign',
    badge: 'FREE',
  },
  {
    category: 'CALCULATORS',
    title: 'Nakshatra Calculator',
    desc: 'Find your birth star and its deep significance.',
    icon: '⭐',
    href: '/calculators/nakshatra',
    badge: 'FREE',
  },
  {
    category: 'CALCULATORS',
    title: 'Sade Sati Check',
    desc: 'Check if you are under Saturn\'s 7.5 year cycle.',
    icon: '🪐',
    href: '/calculators/sade-sati',
    badge: 'FREE',
  },
  {
    category: 'CALCULATORS',
    title: 'Mangal Dosha',
    desc: 'Check for Mangal Dosha in your birth chart.',
    icon: '🔴',
    href: '/calculators/mangal-dosha',
    badge: 'FREE',
  },
  {
    category: 'CALCULATORS',
    title: 'Moon Phase',
    desc: 'Find the moon phase on any date.',
    icon: '🌕',
    href: '/calculators/moon-phase',
    badge: 'FREE',
  },
  {
    category: 'AI CHAT',
    title: 'Vedic AI Oracle',
    desc: 'Chat with Jyoti — our AI astrologer trained on Sanskrit texts.',
    icon: '🔮',
    href: '/ai-chat',
    badge: 'PAID',
  },
  {
    category: 'PANCHANG',
    title: 'Daily Panchang',
    desc: 'Today\'s Tithi, Nakshatra, Yoga, Karana and auspicious timings.',
    icon: '📆',
    href: '/panchang',
    badge: 'FREE',
  },
];

const CATEGORIES = [...new Set(AI_TOOLS.map(t => t.category))];

export default function AITools() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '60px 0 40px'
      }}>
        <div className="container">
          <span className="section-label">SPIRITUAL TECHNOLOGY SUITE</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            All <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>AI Tools</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            60+ Vedic astrology tools powered by AI — horoscopes, kundli,
            compatibility, calculators and more. All free to use.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {CATEGORIES.map(category => (
          <div key={category} style={{ marginBottom: 48 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              marginBottom: 24
            }}>
              <span className="section-label" style={{ margin: 0 }}>{category}</span>
              <div style={{
                flex: 1, height: 1,
                background: 'var(--border-light)'
              }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14
            }}>
              {AI_TOOLS.filter(t => t.category === category).map((tool, i) => (
                <Link key={i} to={tool.href} style={{
                  background: 'var(--navy-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 16, padding: '24px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  cursor: 'pointer', transition: 'all 0.2s',
                  textDecoration: 'none',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'rgba(201,150,60,0.12)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22
                    }}>
                      {tool.icon}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.1em',
                      padding: '3px 10px', borderRadius: 100,
                      background: tool.badge === 'FREE'
                        ? 'rgba(34,197,94,0.15)'
                        : 'rgba(201,150,60,0.15)',
                      color: tool.badge === 'FREE' ? '#4ade80' : 'var(--gold-light)',
                      border: `1px solid ${tool.badge === 'FREE' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                    }}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 style={{
                      fontSize: 16, fontWeight: 600,
                      color: 'var(--text-primary)', marginBottom: 6
                    }}>
                      {tool.title}
                    </h3>
                    <p style={{
                      fontSize: 13, color: 'var(--text-muted)',
                      lineHeight: 1.5
                    }}>
                      {tool.desc}
                    </p>
                  </div>

                  <span style={{
                    fontSize: 12, color: 'var(--gold)',
                    fontWeight: 600, letterSpacing: '0.06em',
                    marginTop: 'auto'
                  }}>
                    OPEN TOOL →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}