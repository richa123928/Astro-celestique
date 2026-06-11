import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
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
    { label: 'Terms',     href: '/payment-policy' },
    { label: 'Support',   href: '/support' },
],
};

export default function Footer() {
  const { user }                        = useAuth();
  const [chatOpen,    setChatOpen]      = useState(false);
  const [chatMsg,     setChatMsg]       = useState('');
  const [loading,     setLoading]       = useState(false);
  const [sessionId]                     = useState(`support_${Date.now()}`);
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateForm, setEscalateForm] = useState({ name: user?.name || '', email: user?.email || '', issue: '' });
  const [messages,    setMessages]      = useState([
    { from: 'ai', text: 'Namaste! 🙏 I am your Astro Celestique support assistant. How can I help you today?' }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMsg = async () => {
    if (!chatMsg.trim() || loading) return;
    const userMsg = chatMsg.trim();
    setChatMsg('');
    setMessages(m => [...m, { from: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await axios.post('/api/chat/support', {
        message:    userMsg,
        sessionId,
        userName:   user?.name || 'Guest',
        userEmail:  user?.email || '',
      });

      setMessages(m => [...m, { from: 'ai', text: data.message }]);

      if (data.needsHuman) {
        setShowEscalate(true);
      }
    } catch (err) {
      setMessages(m => [...m, {
        from: 'ai',
        text: 'Sorry, I am having trouble connecting. Please email us at astrocelestique310@gmail.com'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    try {
      await axios.post('/api/chat/support/escalate', {
        userName:    escalateForm.name,
        userEmail:   escalateForm.email,
        issue:       escalateForm.issue,
        chatHistory: messages.map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))
      });
      toast.success('Support request sent! Team will contact you within 24 hours.');
      setShowEscalate(false);
      setMessages(m => [...m, {
        from: 'ai',
        text: '✅ Your request has been sent to our team! We will contact you at ' + escalateForm.email + ' within 24 hours. 🙏'
      }]);
    } catch (err) {
      toast.error('Failed to send request. Please email us directly.');
    }
  };

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
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

            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div className="footer__col" key={heading}>
                <h5 className="footer__heading">{heading}</h5>
                <ul className="footer__list">
                  {links.map(link => (
                    <li key={link.label}>
                      <Link to={link.href} className="footer__link">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer__bottom">
            <p className="footer__copy">© 2026 ASTRO CELESTIQUE · MADE IN BHARAT</p>
            <div className="footer__socials">
              <a href="https://www.instagram.com/astrocelestique?igsh=YzNpam5wa2hnZXR4" target="_blank" rel="noreferrer" className="footer__social">INSTAGRAM</a>
              <span className="footer__dot">·</span>
              <a href="https://youtube.com"   target="_blank" rel="noreferrer" className="footer__social">YOUTUBE</a>
              <span className="footer__dot">·</span>
              <a href="https://twitter.com"   target="_blank" rel="noreferrer" className="footer__social">TWITTER</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Support Chat Widget */}
      <div className="chat-widget">
        <button className="chat-widget__toggle" onClick={() => setChatOpen(o => !o)}>
          {chatOpen ? '✕' : '💬'}
          {!chatOpen && <span className="chat-widget__label">Support</span>}
        </button>

        {chatOpen && (
          <div className="chat-widget__box">
            <div className="chat-widget__header">
              <div>
                <h4 className="chat-widget__title">AI Support</h4>
                <p className="chat-widget__sub">Powered by AI · Team available 24h</p>
              </div>
              <div className="badge-live">ONLINE</div>
            </div>

            <div className="chat-widget__messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg--${m.from === 'user' ? 'user' : 'support'}`}>
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="chat-msg chat-msg--support">
                  <span style={{ letterSpacing: 2 }}>···</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Escalate Form */}
            {showEscalate && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(201,150,60,0.08)',
                borderTop: '1px solid var(--border-light)'
              }}>
                <p style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 8, fontWeight: 600 }}>
                  Connect with our team:
                </p>
                <input
                  placeholder="Your name"
                  value={escalateForm.name}
                  onChange={e => setEscalateForm(f => ({ ...f, name: e.target.value }))}
                  style={escalateInputStyle}
                />
                <input
                  placeholder="Your email"
                  value={escalateForm.email}
                  onChange={e => setEscalateForm(f => ({ ...f, email: e.target.value }))}
                  style={{ ...escalateInputStyle, marginTop: 6 }}
                />
                <input
                  placeholder="Describe your issue"
                  value={escalateForm.issue}
                  onChange={e => setEscalateForm(f => ({ ...f, issue: e.target.value }))}
                  style={{ ...escalateInputStyle, marginTop: 6 }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, fontSize: 12, padding: '8px' }}
                    onClick={handleEscalate}>
                    Send to Team
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '8px 12px' }}
                    onClick={() => setShowEscalate(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Talk to Team button */}
            {!showEscalate && messages.length > 2 && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => setShowEscalate(true)}
                  style={{
                    width: '100%', padding: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8, fontSize: 12,
                    color: 'var(--text-muted)', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}>
                  👤 Talk to Human Support
                </button>
              </div>
            )}

            <div className="chat-widget__input">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
                disabled={loading}
              />
              <button className="btn-primary chat-send" onClick={sendMsg} disabled={loading}>
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const escalateInputStyle = {
  width: '100%', padding: '8px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-light)',
  borderRadius: 8, fontSize: 12,
  color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)',
  display: 'block',
};