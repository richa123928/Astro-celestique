import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { useCurrency } from '../context/CurrencyContext';
import axios from 'axios';

// ── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 1240, suffix: '+',  label: 'Verified Astrologers' },
  { value: 4.2,  suffix: 'M',  label: 'Consultation Minutes', decimals: 1 },
  { value: 150,  suffix: 'K',  label: 'Kundlis Generated' },
  { value: 4.9,  suffix: '/5', label: 'Global User Rating',   decimals: 1 },
];

const TOOLS = [
  { title: 'Daily Horoscope',   desc: 'Your cosmic forecast for today',      href: '/horoscopes/daily',       icon: '☀️' },
  { title: 'Yearly Forecast',   desc: 'Annual planetary insights',            href: '/horoscopes/yearly',      icon: '⭐' },
  { title: 'Love Compatibility',desc: 'Discover your cosmic match',           href: '/compatibility/love',     icon: '🤍' },
  { title: 'Ashtakoota Match',  desc: 'Vedic compatibility analysis',         href: '/compatibility',          icon: '🔢' },
  { title: 'Numerology',        desc: 'Unlock your life path number',         href: '/calculators/numerology', icon: '✨' },
  { title: 'Dasha Analysis',    desc: 'Planetary period insights',            href: '/kundli/dasha',           icon: '🌙' },
  { title: 'Dosh Analysis',     desc: 'Identify and remedy doshas',           href: '/kundli/dosha',           icon: '🛡️' },
  { title: 'Daily Nakshatra',   desc: "Today's lunar mansion",               href: '/calculators/nakshatra',  icon: '⚡' },
];

const ASTROLOGERS = [
  { name: 'Acharya Vimal',     expertise: 'Vedic · KP System',  years: 18, rate: 4500,  rating: 4.9, status: 'online' },
  { name: 'Dr. Sunita Sharma', expertise: 'Psychology · Vedic', years: 22, rate: 8000,  rating: 4.9, status: 'online' },
  { name: 'Pandit Raghav',     expertise: 'Prashna · Nadi',     years: 9,  rate: 3000,  rating: 4.7, status: 'busy'   },
  { name: 'Meera Kapur',       expertise: 'Numerology · Tarot', years: 14, rate: 5500,  rating: 4.8, status: 'online' },
];

const FILTERS = ['ALL', 'VEDIC', 'LOVE & MARRIAGE', 'CAREER', 'TAROT', 'NUMEROLOGY', 'NADI', 'VASTU'];

const PUJAS = [
  { key: 'grah_shanti',         name: 'Grah Shanti Pooja',          price: 5100,  icon: '🪐', desc: 'Pacify malefic planets in your chart' },
  { key: 'death_shanti',        name: 'Death Shanti Pooja',          price: 7100,  icon: '🕯️', desc: 'Ancestral peace and moksha rituals' },
  { key: 'lakshmi_vriddhi',     name: 'Lakshmi Vriddhi Pooja',       price: 4100,  icon: '💰', desc: 'Invoke abundance and prosperity' },
  { key: 'love_relationship',   name: 'Love / Relationship Pooja',   price: 3100,  icon: '❤️', desc: 'Strengthen bonds and resolve issues' },
  { key: 'new_home',            name: 'New Home Pooja',              price: 5100,  icon: '🏡', desc: 'Griha Pravesh blessings' },
  { key: 'saraswati',           name: 'Saraswati Pooja',             price: 2100,  icon: '📚', desc: 'Blessings for education and wisdom' },
  { key: 'marriage',            name: 'Marriage Pooja',              price: 7100,  icon: '💍', desc: 'Divine blessings for your union' },
  { key: 'sarv_karya_samporan', name: 'Sarv Karya Samporan',         price: 11000, icon: '✨', desc: 'All-purpose wish fulfillment' },
];

const REMEDIES = [
  { category: 'RUDRAKSHA', name: 'Siddha 5-Mukhi Mala',    price: 4200,  icon: '📿' },
  { category: 'YANTRAS',   name: 'Shree Yantra · Copper',  price: 2800,  icon: '🔮' },
  { category: 'GEMSTONES', name: 'Certified Neelam',        price: 38500, icon: '💎' },
  { category: 'PUJA KITS', name: 'Rahu Shanti Ritual',      price: 6500,  icon: '🪔' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',   location: 'Mumbai',    rating: 5, text: 'The AI horoscope was surprisingly accurate about my career transition. The platform feels genuinely premium.' },
  { name: 'Rahul K.',   location: 'Bangalore', rating: 5, text: 'Talked to Acharya Vimal about my marriage timing. He was spot on with every prediction.' },
  { name: 'Ananya M.',  location: 'Delhi',     rating: 5, text: 'The Kundli analysis was detailed and beautifully presented. Best astrology platform I have used.' },
  { name: 'James L.',   location: 'London',    rating: 5, text: 'As a skeptic, I was pleasantly surprised. The Vedic system is deeply logical once explained.' },
  { name: 'Nisha P.',   location: 'Toronto',   rating: 5, text: 'The puja booking was seamless. Got a full report after the ceremony. Worth every penny.' },
  { name: 'Vikram T.',  location: 'Dubai',     rating: 5, text: 'Finally an astrology platform that feels modern and premium. Brilliant design.' },
];

// ── Components ───────────────────────────────────────────────────────────────

function StatsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-grid container">
        {STATS.map((s, i) => (
          <div className="stat-item" key={i}>
            <span className="stat-number serif">
              {inView
                ? <CountUp end={s.value} decimals={s.decimals || 0} duration={2.2} delay={i * 0.15} />
                : '0'
              }
              {s.suffix}
            </span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CosmicMandala({ panchang }) {
  return (
    <div className="mandala-wrap">
      <div className="mandala-outer">
        <div className="mandala-inner">
          <div className="mandala-core" />
        </div>
      </div>
      <div className="mandala-info">
        <span className="section-label">LIVE COSMIC ENGINE</span>
        <p className="mandala-panchang serif">
          {panchang
            ? `Today's Panchang · ${panchang.paksha} · ${panchang.tithi}`
            : "Today's Panchang · Loading..."}
        </p>
      </div>
      <div className="mandala-planets">
        <div>
          <span className="mandala-deg">
            {panchang?.planets?.find(p => p.name === 'Sun')?.position || 'Taurus'}
          </span>
          <span className="mandala-planet">SUN</span>
        </div>
        <div>
          <span className="mandala-deg">
            {panchang?.planets?.find(p => p.name === 'Moon')?.position || 'Cancer'}
          </span>
          <span className="mandala-planet">MOON</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { convert }                         = useCurrency();
  const navigate                            = useNavigate();
  const [activeFilter, setActiveFilter]     = useState('ALL');
  const [cosmicBrief,  setCosmicBrief]      = useState(null);

  useEffect(() => {
    const fetchCosmicBrief = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await axios.post('/api/panchang/daily', { date: today });
        setCosmicBrief(data);
      } catch (err) {
        console.log('Cosmic brief error:', err.message);
      }
    };
    fetchCosmicBrief();
  }, []);

  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__glow hero__glow--1" />
          <div className="hero__glow hero__glow--2" />
          <div className="hero__stars" />
        </div>
        <div className="hero__content container">
          <div className="hero__text">
            <div className="hero__badge">
              <span className="hero__badge-dot" />
              842 VEDIC SCHOLARS LIVE NOW
            </div>
            <h1 className="hero__title serif">
              Ancient Vedic Wisdom,<br />
              <em className="hero__em">Reimagined</em> for Modern Life
            </h1>
            <p className="hero__subtitle">
              AI-powered horoscopes, lineage-verified astrologers, kundli intelligence,
              compatibility insights, and authentic remedies — built on five thousand years
              of Bharatiya cosmology.
            </p>
            <div className="hero__actions">
              <Link to="/consultations" className="btn-primary">Talk to an Astrologer</Link>
              <Link to="/kundli"        className="btn-secondary">Generate Free Kundli</Link>
              <Link to="/ai-tools"      className="btn-ghost">Explore AI Tools →</Link>
            </div>
          </div>
          <div className="hero__visual">
            <CosmicMandala panchang={cosmicBrief} />
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── Sun & Moon ───────────────────────────────────────────────── */}
      <section className="sunmoon-section">
        <div className="container">
          <div className="sunmoon-grid">
            <div className="sun-card card">
              <div className="sun-orb">
                <div className="sun-rays" />
                <span>☀️</span>
              </div>
              <div className="sunmoon-info">
                <span className="section-label">SUN SIGN TODAY</span>
                <h3 className="sunmoon-name serif">
                  {cosmicBrief?.planets?.find(p => p.name === 'Sun')?.position
                    ? `Sun in ${cosmicBrief.planets.find(p => p.name === 'Sun').position}`
                    : 'Loading...'}
                </h3>
                <p className="sunmoon-desc text-muted">
                  The Sun's position influences your core identity and life purpose today.
                  Focus on leadership and self-expression.
                </p>
                <div className="sunmoon-stats">
                  <div>
                    <span className="ss-label">Position</span>
                    <span className="ss-val">
                      {cosmicBrief?.planets?.find(p => p.name === 'Sun')?.position || '...'}
                    </span>
                  </div>
                  <div>
                    <span className="ss-label">Nakshatra</span>
                    <span className="ss-val">{cosmicBrief?.nakshatra || '...'}</span>
                  </div>
                  <div>
                    <span className="ss-label">Tithi</span>
                    <span className="ss-val">{cosmicBrief?.tithi || '...'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="moon-card card">
              <div className="moon-orb">
                <div className="moon-glow" />
                <span>🌙</span>
              </div>
              <div className="sunmoon-info">
                <span className="section-label">MOON SIGN TODAY</span>
                <h3 className="sunmoon-name serif">
                  {cosmicBrief?.planets?.find(p => p.name === 'Moon')?.position
                    ? `Moon in ${cosmicBrief.planets.find(p => p.name === 'Moon').position}`
                    : 'Loading...'}
                </h3>
                <p className="sunmoon-desc text-muted">
                  The Moon governs your emotions and intuition today.
                  Trust your feelings and stay connected to your inner wisdom.
                </p>
                <div className="sunmoon-stats">
                  <div>
                    <span className="ss-label">Position</span>
                    <span className="ss-val">
                      {cosmicBrief?.planets?.find(p => p.name === 'Moon')?.position || '...'}
                    </span>
                  </div>
                  <div>
                    <span className="ss-label">Tithi</span>
                    <span className="ss-val">{cosmicBrief?.tithi || '...'}</span>
                  </div>
                  <div>
                    <span className="ss-label">Nakshatra</span>
                    <span className="ss-val">{cosmicBrief?.nakshatra || '...'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Tools Suite ───────────────────────────────────────────── */}
      <section className="suite-section">
        <div className="container">
          <div className="suite-header">
            <div>
              <span className="section-label">THE SPIRITUAL TECHNOLOGY SUITE</span>
              <h2 className="suite-title serif">
                A complete Vedic<br />ecosystem, <em>reimagined.</em>
              </h2>
            </div>
            <Link to="/ai-tools" className="btn-ghost">VIEW ALL 60+ TOOLS →</Link>
          </div>

          {/* AI Chat + Cosmic Brief */}
          <div className="suite-main">
            <div className="ai-card card">
              <span className="ai-card__badge">● AI ASTROLOGER · BETA</span>
              <h3 className="ai-card__title serif">Chat with our Vedic AI Oracle</h3>
              <p className="ai-card__desc text-muted">
                Trained on 10,000+ classical Sanskrit texts. Ask anything —
                career, love, karma, dharma.
              </p>
              <div className="ai-card__demo">
                <div className="demo-user">Will I find clarity in my career this year?</div>
                <div className="demo-ai">Your Saturn return suggests deep restructuring through November...</div>
              </div>
              <Link to="/ai-chat" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Open AI Chat
              </Link>
            </div>
            <div className="cosmic-brief card">
              <span className="section-label">LIVE NOW</span>
              <h3 className="cosmic-brief__title serif">Today's Cosmic Brief</h3>
              <p className="text-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                {cosmicBrief
                  ? `Moon in ${cosmicBrief.nakshatra} Nakshatra. ${cosmicBrief.guidance?.split('.')[0]}.`
                  : 'Loading cosmic energies...'}
              </p>
              <div className="cosmic-brief__rows">
                {[
                  { label: 'Tithi',     value: cosmicBrief?.tithi     || '...' },
                  { label: 'Nakshatra', value: cosmicBrief?.nakshatra  || '...' },
                  { label: 'Yoga',      value: cosmicBrief?.yoga       || '...' },
                ].map(r => (
                  <div className="cosmic-row" key={r.label}>
                    <span className="text-muted">{r.label}</span>
                    <span style={{ fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="tools-grid">
            {TOOLS.map((t, i) => (
              <Link to={t.href} key={i} className="tool-card">
                <div className="tool-card__icon">
                  <span>{t.icon}</span>
                </div>
                <h4 className="tool-card__title">{t.title}</h4>
                <p className="tool-card__desc">{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Astrologers ──────────────────────────────────────────────── */}
      <section className="astro-section">
        <div className="container">
          <div className="astro-header">
            <div>
              <span className="section-label">VERIFIED VEDIC SCHOLARS</span>
              <h2 className="astro-title serif">
                Speak with masters of<br />
                the <em className="gold">Parashara lineage.</em>
              </h2>
            </div>
            <Link to="/consultations" className="btn-ghost">BROWSE 1,240+ ASTROLOGERS →</Link>
          </div>

          <div className="astro-filters">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="astro-grid">
            {ASTROLOGERS.map((a, i) => (
              <div className="astro-card card" key={i}>
                <div className="astro-card__top">
                  <span className={`status-badge status-badge--${a.status}`}>
                    {a.status.toUpperCase()}
                  </span>
                  <span className="astro-card__rating">★ {a.rating}</span>
                </div>
                <div className="astro-card__avatar">
                  {a.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="astro-card__info">
                  <span className="astro-card__price gold">{convert(a.rate)}/min</span>
                  <h4 className="astro-card__name">{a.name}</h4>
                  <p className="astro-card__exp text-muted">
                    {a.expertise} · {a.years} YRS
                  </p>
                </div>
                <div className="astro-card__actions">
                  <button className="btn-secondary astro-btn"
                    onClick={() => navigate('/consultations')}>
                    CHAT
                  </button>
                  {a.status === 'busy'
                    ? <button className="btn-secondary astro-btn"
                        onClick={() => navigate('/consultations')}>
                        NOTIFY
                      </button>
                    : <button className="btn-primary astro-btn"
                        onClick={() => navigate('/consultations')}>
                        CALL
                      </button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Puja Services ────────────────────────────────────────────── */}
      <section className="puja-section">
        <div className="container">
          <div className="puja-header">
            <div>
              <span className="section-label">SACRED PUJA SERVICES</span>
              <h2 className="puja-title serif">
                Astrology services,<br />
                <em className="gold">performed with devotion.</em>
              </h2>
            </div>
            <p className="puja-subtitle text-muted">
              Temple-trained pandits perform personalised pujas across Bharat.
              Each ceremony includes a detailed report.
            </p>
          </div>
          <div className="puja-grid">
            {PUJAS.map(p => (
              <div
                className="puja-card card"
                key={p.key}
                onClick={() => navigate(`/puja/${p.key}`)}
              >
                <span className="puja-card__icon">{p.icon}</span>
                <h4 className="puja-card__name serif">{p.name}</h4>
                <p className="puja-card__desc text-muted">{p.desc}</p>
                <div className="puja-card__footer">
                  <span className="gold">Starting {convert(p.price)}</span>
                  <span className="btn-ghost">BOOK →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Remedies ─────────────────────────────────────────────────── */}
      <section className="remedies-section">
        <div className="container">
          <div className="remedies-header">
            <div>
              <span className="section-label">REMEDIES & SACRED RITUALS</span>
              <h2 className="remedies-title serif">
                Spiritual correctives,<br />
                <em className="gold">sourced through lineage.</em>
              </h2>
            </div>
            <p className="text-muted" style={{ maxWidth: 320, fontSize: 14, lineHeight: 1.7 }}>
              Authentic gemstones, energised yantras and live-streamed pujas
              — performed by temple-trained pandits across India.
            </p>
          </div>
          <div className="remedies-grid">
            {REMEDIES.map((r, i) => (
              <div className="remedy-card card" key={i}>
                <div className="remedy-card__img">{r.icon}</div>
                <div className="remedy-card__body">
                  <span className="section-label">{r.category}</span>
                  <h4 className="remedy-card__name serif">{r.name}</h4>
                  <div className="remedy-card__footer">
                    <span>{convert(r.price)}</span>
                    <span className="btn-ghost"
                      onClick={() => navigate('/remedies')}
                      style={{ cursor: 'pointer' }}>
                      VIEW →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="testimonials-section">
        <div className="container">
          <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>
            WHAT OUR USERS SAY
          </span>
          <h2 className="testimonials-title serif">
            Trusted by seekers<br /><em className="gold">across the world.</em>
          </h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div className="testimonial-card card" key={i}>
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <span className="testimonial-name">{t.name}</span>
                  <span className="text-muted" style={{ fontSize: 12 }}>{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Counter CTA ──────────────────────────────────────────────── */}
      <section className="counter-section">
        <div className="container">
          <div className="counter-card card">
            <div>
              <span className="section-label">JOIN THE COMMUNITY</span>
              <h2 className="counter-title serif">
                Over <em className="gold">4.3 crore</em> seekers<br />
                trust Astro Celestique.
              </h2>
            </div>
            <div className="counter-actions">
              <Link to="/auth"          className="btn-primary">Get Started Free</Link>
              <Link to="/consultations" className="btn-secondary">Talk to Astrologer</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-top: 80px;
        }
        .hero__bg { position: absolute; inset: 0; z-index: 0; }
        .hero__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
        }
        .hero__glow--1 { width:600px;height:600px;background:var(--gold-dim);top:-200px;right:-100px; }
        .hero__glow--2 { width:400px;height:400px;background:#1a3a6e;bottom:-100px;left:-50px; }
        .hero__stars {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 15%, rgba(255,255,255,0.4) 0%, transparent 100%);
        }
        .hero__content {
          position: relative; z-index: 1;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
          padding: 80px 24px;
        }
        .hero__badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(201,150,60,0.1);
          border: 1px solid var(--border);
          color: var(--gold-light);
          font-size: 11px; font-weight: 600; letter-spacing: 0.12em;
          padding: 7px 16px; border-radius: 100px;
          margin-bottom: 28px;
          animation: fadeUp 0.6s ease both;
        }
        .hero__badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80; animation: pulse 2s infinite;
          flex-shrink: 0;
        }
        .hero__title {
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 400; line-height: 1.1;
          margin-bottom: 24px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero__em { font-style: italic; color: var(--gold-light); }
        .hero__subtitle {
          font-size: 17px; color: var(--text-muted);
          line-height: 1.7; max-width: 520px;
          margin-bottom: 40px;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero__actions {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          animation: fadeUp 0.7s 0.3s ease both;
        }
        .hero__visual { display: flex; justify-content: center; animation: fadeUp 0.8s 0.2s ease both; }

        /* Mandala */
        .mandala-wrap {
          position: relative; width: 440px; height: 380px;
          background: rgba(13,21,40,0.8);
          border: 1px solid var(--border);
          border-radius: 20px;
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          overflow: hidden; backdrop-filter: blur(10px);
        }
        .mandala-outer {
          width: 240px; height: 240px;
          border: 1px solid rgba(201,150,60,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          animation: rotate 30s linear infinite;
          position: relative;
        }
        .mandala-outer::before, .mandala-outer::after {
          content: ''; position: absolute;
          border: 1px solid rgba(201,150,60,0.15);
          border-radius: 50%;
        }
        .mandala-outer::before { inset: 20px; }
        .mandala-outer::after  { inset: 50px; }
        .mandala-inner {
          width: 140px; height: 140px;
          border: 1px solid rgba(201,150,60,0.4);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          animation: counterRotate 20s linear infinite;
        }
        .mandala-core {
          width: 60px; height: 60px;
          background: radial-gradient(circle, var(--gold) 0%, var(--gold-dim) 60%, transparent 100%);
          border-radius: 50%;
          animation: glow 3s ease-in-out infinite;
        }
        .mandala-info { position: absolute; bottom: 50px; left: 20px; }
        .mandala-panchang { font-size: 18px; color: var(--text-primary); }
        .mandala-planets {
          position: absolute; bottom: 16px; right: 20px;
          display: flex; gap: 20px;
        }
        .mandala-deg    { display: block; font-family: var(--font-serif); font-size: 18px; }
        .mandala-planet { display: block; font-size: 10px; letter-spacing: 0.1em; color: var(--text-muted); }

        /* Stats */
        .stats-section {
          background: var(--navy-dark);
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          padding: 48px 0;
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .stat-item {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 8px 0;
          border-right: 1px solid var(--border-light);
        }
        .stat-item:last-child { border-right: none; }
        .stat-number { font-size: clamp(28px,3vw,42px); font-weight: 300; color: var(--gold-light); line-height: 1; }
        .stat-label  { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }

        /* Sun Moon */
        .sunmoon-section { padding: 100px 0; }
        .sunmoon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .sun-card, .moon-card {
          padding: 36px; display: flex; gap: 28px; align-items: flex-start;
        }
        .sun-orb, .moon-orb {
          flex-shrink: 0; width: 80px; height: 80px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 36px; position: relative;
          animation: float 4s ease-in-out infinite;
        }
        .sun-orb  { background: radial-gradient(circle, rgba(201,150,60,0.25) 0%, transparent 70%); }
        .moon-orb { background: radial-gradient(circle, rgba(99,150,200,0.2) 0%, transparent 70%); animation-delay: -2s; }
        .sun-rays {
          position: absolute; inset: -8px;
          border: 1px solid rgba(201,150,60,0.2); border-radius: 50%;
          animation: rotate 10s linear infinite;
        }
        .moon-glow { position: absolute; inset: -12px; border: 1px solid rgba(99,150,200,0.15); border-radius: 50%; }
        .sunmoon-name { font-size: 24px; font-weight: 400; margin: 4px 0 10px; }
        .sunmoon-desc { font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
        .sunmoon-stats { display: flex; gap: 20px; }
        .ss-label { display: block; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); margin-bottom: 3px; }
        .ss-val   { display: block; font-size: 14px; font-weight: 500; }

        /* Suite */
        .suite-section { padding: 100px 0; }
        .suite-header {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 48px;
        }
        .suite-title { font-size: clamp(32px,3.5vw,52px); font-weight: 400; line-height: 1.15; margin-top: 8px; }
        .suite-title em { color: var(--gold-light); }
        .suite-main { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 32px; }
        .ai-card { padding: 36px; display: flex; flex-direction: column; gap: 16px; background: var(--navy-mid) !important; }
        .ai-card__badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(100,80,200,0.2); color: #a89cf0;
          font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
          padding: 5px 12px; border-radius: 100px;
          border: 1px solid rgba(100,80,200,0.3); align-self: flex-start;
        }
        .ai-card__title { font-size: 32px; font-weight: 400; line-height: 1.2; }
        .ai-card__desc  { font-size: 14px; line-height: 1.6; max-width: 400px; }
        .ai-card__demo  { display: flex; flex-direction: column; gap: 10px; }
        .demo-user {
          align-self: flex-end; background: rgba(255,255,255,0.08);
          font-size: 13px; padding: 10px 14px;
          border-radius: 16px 16px 4px 16px; max-width: 280px;
        }
        .demo-ai {
          align-self: flex-end; background: var(--gold-dim); color: var(--gold-pale);
          font-size: 13px; padding: 10px 14px;
          border-radius: 16px 16px 4px 16px; max-width: 280px;
        }
        .cosmic-brief { padding: 32px; display: flex; flex-direction: column; gap: 12px; }
        .cosmic-brief__title { font-size: 28px; font-weight: 400; }
        .cosmic-brief__rows { display: flex; flex-direction: column; margin-top: 8px; }
        .cosmic-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0; border-bottom: 1px solid var(--border-light);
          font-size: 14px;
        }
        .cosmic-row:last-child { border-bottom: none; }

        /* Tools Grid */
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .tool-card {
          display: flex; flex-direction: column; gap: 14px; padding: 28px;
          background: var(--navy-card); border: 1px solid var(--border-light);
          border-radius: 16px; cursor: pointer; transition: all 0.2s ease;
          text-decoration: none;
        }
        .tool-card:hover { border-color: var(--border); transform: translateY(-2px); }
        .tool-card__icon {
          width: 48px; height: 48px; background: rgba(201,150,60,0.12);
          border-radius: 12px; display: flex; align-items: center;
          justify-content: center; font-size: 22px;
        }
        .tool-card__title { font-size: 17px; font-weight: 600; color: var(--text-primary); font-family: var(--font-sans); line-height: 1.3; }
        .tool-card__desc  { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

        /* Astrologers */
        .astro-section { padding: 100px 0; background: var(--navy-dark); }
        .astro-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .astro-title { font-size: clamp(32px,3.5vw,52px); font-weight: 400; line-height: 1.15; margin-top: 8px; }
        .astro-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 36px; }
        .filter-pill {
          padding: 8px 18px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          color: var(--text-muted); background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-light);
          cursor: pointer; transition: all 0.2s; font-family: var(--font-sans);
        }
        .filter-pill:hover { color: var(--text-primary); border-color: var(--border); }
        .filter-pill.active { background: var(--gold); color: var(--navy-deep); border-color: var(--gold); }
        .astro-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
        .astro-card { overflow: hidden; display: flex; flex-direction: column; }
        .astro-card__top { display: flex; justify-content: space-between; align-items: center; padding: 14px 14px 0; }
        .astro-card__rating { font-size: 13px; font-weight: 600; color: var(--gold-light); }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; }
        .status-badge--online { background: rgba(34,197,94,0.15); color: #4ade80; }
        .status-badge--busy   { background: rgba(251,191,36,0.15); color: #fbbf24; }
        .status-badge--offline{ background: rgba(100,116,139,0.15); color: #94a3b8; }
        .astro-card__avatar {
          width: 100%; height: 180px;
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; font-weight: 700; font-family: var(--font-serif);
          color: var(--gold-dim);
          background: linear-gradient(180deg, var(--navy-light) 0%, var(--navy-card) 100%);
          margin-top: 8px;
        }
        .astro-card__info { padding: 16px 16px 0; }
        .astro-card__price { font-size: 15px; font-weight: 600; float: right; }
        .astro-card__name  { font-size: 17px; font-weight: 500; margin-bottom: 4px; }
        .astro-card__exp   { font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
        .astro-card__actions { display: flex; gap: 8px; padding: 16px; margin-top: auto; }
        .astro-btn { flex: 1; font-size: 12px !important; font-weight: 700 !important; letter-spacing: 0.08em !important; padding: 10px 8px !important; }

        /* Puja */
        .puja-section { padding: 100px 0; }
        .puja-header { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-bottom: 48px; }
        .puja-title  { font-size: clamp(32px,3.5vw,52px); font-weight: 400; line-height: 1.15; margin-top: 8px; }
        .puja-subtitle { font-size: 15px; line-height: 1.7; }
        .puja-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .puja-card { padding: 24px; display: flex; flex-direction: column; gap: 10px; cursor: pointer; }
        .puja-card__icon { font-size: 32px; }
        .puja-card__name { font-size: 20px; font-weight: 400; line-height: 1.2; }
        .puja-card__desc { font-size: 13px; line-height: 1.5; flex: 1; }
        .puja-card__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-light); font-size: 14px; font-weight: 600; }

        /* Remedies */
        .remedies-section { padding: 100px 0; background: var(--navy-dark); }
        .remedies-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .remedies-title { font-size: clamp(32px,3.5vw,52px); font-weight: 400; line-height: 1.15; margin-top: 8px; }
        .remedies-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 32px; }
        .remedy-card { overflow: hidden; }
        .remedy-card__img { width: 100%; height: 180px; background: var(--navy-light); display: flex; align-items: center; justify-content: center; font-size: 60px; }
        .remedy-card__body { padding: 20px; display: flex; flex-direction: column; gap: 6px; }
        .remedy-card__name { font-size: 20px; font-weight: 400; }
        .remedy-card__footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 16px; font-weight: 500; }

        /* Testimonials */
        .testimonials-section { padding: 100px 0; }
        .testimonials-title { font-size: clamp(32px,3.5vw,48px); font-weight: 400; text-align: center; line-height: 1.15; margin: 8px 0 48px; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .testimonial-card { padding: 28px; display: flex; flex-direction: column; gap: 14px; }
        .testimonial-stars { font-size: 14px; color: var(--gold); letter-spacing: 2px; }
        .testimonial-text  { font-size: 15px; color: var(--text-muted); line-height: 1.7; font-style: italic; flex: 1; }
        .testimonial-author{ display: flex; gap: 8px; align-items: center; }
        .testimonial-name  { font-size: 14px; font-weight: 500; }

        /* Counter */
        .counter-section { padding: 60px 0 80px; }
        .counter-card { padding: 60px; display: flex; justify-content: space-between; align-items: center; gap: 40px; }
        .counter-title { font-size: clamp(28px,3vw,44px); font-weight: 400; line-height: 1.2; margin-top: 8px; }
        .counter-actions { display: flex; gap: 14px; flex-shrink: 0; }

        /* Responsive */
        @media (max-width: 1200px) {
          .tools-grid, .puja-grid, .astro-grid, .remedies-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 900px) {
          .hero__content { grid-template-columns: 1fr; gap: 40px; text-align: center; padding: 60px 24px; }
          .hero__subtitle { margin: 0 auto 40px; }
          .hero__actions { justify-content: center; }
          .hero__visual { display: none; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .stat-item { border-right: none; border-bottom: 1px solid var(--border-light); padding: 16px; }
          .sunmoon-grid { grid-template-columns: 1fr; }
          .suite-header, .astro-header, .remedies-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .suite-main { grid-template-columns: 1fr; }
          .puja-header { grid-template-columns: 1fr; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .counter-card { flex-direction: column; text-align: center; padding: 40px 24px; }
        }
        @media (max-width: 600px) {
          .tools-grid, .puja-grid, .astro-grid, .remedies-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}