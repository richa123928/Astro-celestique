import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = {
  ASTROLOGY: [
    { label: 'Daily Horoscope',  href: '/horoscopes/daily' },
    { label: 'Free Kundli',      href: '/kundli' },
    { label: 'Kundli Matching',  href: '/compatibility' },
    { label: 'Compatibility',    href: '/compatibility' },
    { label: 'Panchang',         href: '/panchang' },
  ],
  CONSULTATIONS: [
    { label: 'Chat',                  href: '/consultations' },
    { label: 'Call',                  href: '/consultations' },
    { label: 'Video',                 href: '/consultations' },
    { label: 'Live Puja',             href: '/puja' },
    { label: 'Become an Astrologer',  href: '/join' },
  ],
  KNOWLEDGE: [
    { label: 'Vedic Magazine',    href: '/magazine' },
    { label: 'Festival Calendar', href: '/calendar' },
    { label: 'Glossary',          href: '/glossary' },
    { label: 'Learning Hub',      href: '/learn' },
  ],
  COMPANY: [
    { label: 'About Us',  href: '/about' },
    { label: 'Careers',   href: '/careers' },
    { label: 'Privacy',   href: '/privacy' },
    { label: 'Terms',     href: '/terms' },
    { label: 'Support',   href: '/support' },
  ],
};

export default function Footer() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg,  setChatMsg]  = useState('');
  const [messages, setMessages] = useState([
    { from: 'support', text: 'Namaste! 🙏 How can we help you today?' }
  ]);

  const sendMsg = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [
      ...m,
      { from: 'user', text: chatMsg },
      { from: 'support', text: 'Thank you for reaching out! Our team will get back to you shortly.' }
    ]);
    setChatMsg('');
  };

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">

            {/* Brand */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <span className="footer__logo-icon">◉</span>
                <span>Astro <span className="footer__logo-accent">Celestique</span></span>
              </Link>
              <p className="footer__tagline">
                Proudly rooted in Bharatiya Vedic wisdom.<br />
                Designed for the conscious global citizen.
              </p>
              <div className="footer__status">
                <span className="footer__status-dot" />
                ALL SYSTEMS OPERATIONAL
              </div>
            </div>

            {/* Links */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div className="footer__col" key={heading}>
                <h5 className="footer__heading">{heading}</h5>
                <ul className="footer__list">
                  {links.map(link => (
                    <li key={link.label}>
                      <Link to={link.href} className="footer__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="footer__bottom">
            <p className="footer__copy">
              © 2026 ASTRO CELESTIQUE · MADE IN BHARAT
            </p>
            <div className="footer__socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="footer__social">INSTAGRAM</a>
              <span className="footer__dot">·</span>
              <a href="https://youtube.com"   target="_blank" rel="noreferrer" className="footer__social">YOUTUBE</a>
              <span className="footer__dot">·</span>
              <a href="https://twitter.com"   target="_blank" rel="noreferrer" className="footer__social">TWITTER</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Support Widget */}
      <div className="chat-widget">
        <button
          className="chat-widget__toggle"
          onClick={() => setChatOpen(o => !o)}
        >
          {chatOpen ? '✕' : '💬'}
          {!chatOpen && <span className="chat-widget__label">Support</span>}
        </button>

        {chatOpen && (
          <div className="chat-widget__box">
            <div className="chat-widget__header">
              <div>
                <h4 className="chat-widget__title">Live Support</h4>
                <p className="chat-widget__sub">Typically replies in minutes</p>
              </div>
              <div className="badge-live">ONLINE</div>
            </div>

            <div className="chat-widget__messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg--${m.from}`}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="chat-widget__input">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
              />
              <button className="btn-primary chat-send" onClick={sendMsg}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}