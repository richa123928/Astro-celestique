import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';
import { useTimezone, TIMEZONES } from '../../context/TimezoneContext';
import './Navbar.css';


const NAV_LINKS = [
  { label: 'Consultations', href: '/consultations' },
  { label: 'AI Tools',      href: '/ai-tools' },
  { label: 'Kundli',        href: '/kundli' },
  { label: 'Horoscopes',    href: '/horoscopes' },
  { label: 'Remedies',      href: '/remedies' },
  { label: 'Puja',          href: '/puja' },
];

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [currencyOpen,  setCurrencyOpen]  = useState(false);
  const [timezoneOpen,  setTimezoneOpen]  = useState(false);
  const [currentTime,   setCurrentTime]   = useState('');

  const { user, logout, isAuthenticated } = useAuth();
  const { currency, setCurrency,convert}         = useCurrency();
  const { timezone, setTimezone, getCurrentTime } = useTimezone();
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => setCurrentTime(getCurrentTime());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currencyRef = useRef(null);
  const timezoneRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
      if (timezoneRef.current && !timezoneRef.current.contains(e.target)) {
        setTimezoneOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">◉</span>
          <span>Astro <span className="navbar__logo-accent">Celestique</span></span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <Link to={l.href} className="navbar__link">{l.label}</Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="navbar__actions">

          {/* Currency Switcher */}
          <div className="currency-switcher" ref={currencyRef} onClick={() => setCurrencyOpen(o => !o)}>
            <span>{currency}</span>
            <span className="currency-arrow">▾</span>
            {currencyOpen && (
              <div className="currency-dropdown">
                {Object.values(CURRENCIES).map(c => (
                  <button
                    key={c.code}
                    className={`currency-option ${currency === c.code ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrency(c.code);
                      setCurrencyOpen(false);
                    }}
                  >
                    <span className="currency-symbol">{c.symbol}</span>
                    <span>{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timezone Switcher */}
          <div className="currency-switcher" ref={timezoneRef} onClick={() => setTimezoneOpen(o => !o)}
          style={{ position: 'relative' }}>
            <span>🌐</span>
            <span>{timezone}</span>
            <span style={{ fontSize: 11, color: 'var(--gold)', marginLeft: 2 }}>{currentTime}</span>
            <span className="currency-arrow">▾</span>
            {timezoneOpen && (
              <div className="currency-dropdown" style={{ minWidth: 200, maxHeight: 320, overflowY: 'auto' }}>
                {TIMEZONES.map(t => (
                  <button
                    key={t.code}
                    className={`currency-option ${timezone === t.code ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTimezone(t.code);
                      setTimezoneOpen(false);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
                  >
                    <span style={{ fontSize: 11, color: 'var(--gold)', width: 52, flexShrink: 0 }}>{t.offset}</span>
                    <span style={{ fontSize: 12 }}>{t.code} — {t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {isAuthenticated ? (
  <>
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 13, color: 'var(--gold-light)',
      background: 'rgba(201,150,60,0.1)',
      border: '1px solid rgba(201,150,60,0.25)',
      padding: '5px 12px', borderRadius: 100,
      whiteSpace: 'nowrap', flexShrink: 0
    }}>
      💰 {convert(user?.walletBalance || 0)}
    </span>
    <button className="btn-ghost" onClick={() => { logout(); setMenuOpen(false); }}>
      Logout
    </button>
  </>
) : (

            <button
              className="navbar__signin"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </button>
          )}

          <Link to="/astrologer/dashboard"
            style={{ fontSize: 12, color: 'var(--text-dim)', marginRight: 12, textDecoration: 'none' }}>
            Astrologer Login
          </Link>

          {/* CTA Button */}
          <Link to="/consultations" className="btn-primary navbar__cta" style={{ flexShrink: 0 }}> 
            <span className="navbar__cta-dot">●</span>
            Talk to Astrologer
          </Link>

          {/* Mobile Burger */}
          <button
            className={`navbar__burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              to={l.href}
              className="navbar__mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/astrologer/dashboard" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
            Astrologer Login
          </Link>
          {isAuthenticated ? (
            <button className="btn-ghost" onClick={() => { logout(); setMenuOpen(false); }}>
              Logout
            </button>
          ) : (
            <Link to="/auth" className="btn-primary" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}