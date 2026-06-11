import React from 'react';

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 100, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <span className="section-label">LEGAL</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, color: 'var(--text-primary)', marginBottom: 24 }}>
          Privacy Policy
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.8 }}>
          <p>Last updated: June 2026</p>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>1. Information We Collect</h3>
          <p>We collect your name, email, date of birth, time of birth, place of birth and payment information to provide accurate astrology services.</p>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>2. How We Use Your Information</h3>
          <p>Your birth details are used solely to generate Kundli, horoscopes, and astrology predictions. We do not sell your data to third parties.</p>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>3. Data Security</h3>
          <p>All data is encrypted and stored securely on MongoDB Atlas servers. Passwords are hashed using industry-standard bcrypt encryption.</p>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>4. AI Processing</h3>
          <p>Your queries to our AI astrologer (Jyoti) are processed via Groq AI to generate personalised responses. Chat history is stored to improve your experience.</p>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>5. Cookies</h3>
          <p>We use cookies to maintain your login session and currency/timezone preferences.</p>
          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>6. Contact Us</h3>
          <p>For privacy concerns, email us at astrocelestique310@gmail.com</p>
        </div>
      </div>
    </div>
  );
}