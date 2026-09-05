import React from 'react';

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 100, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <span className="section-label">OUR STORY</span>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400,
          color: 'var(--text-primary)', marginBottom: 24, lineHeight: 1.2
        }}>
          Ancient wisdom, <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>built for how people actually live today.</span>
        </h1>

        <div style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.9 }}>
          <p>
            Astro Celestique exists because good Vedic astrology shouldn't be hard to find,
            hard to trust, or locked behind vague, one-size-fits-all predictions. We built a
            platform where every calculation — your Kundli, your Dasha periods, your daily
            Panchang — is generated from real astronomical positions, not guesswork, and every
            astrologer you speak to is a verified practitioner of the Parashara tradition.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 32, fontSize: 22, fontFamily: 'var(--font-serif)' }}>
            What we believe
          </h3>
          <p>
            Astrology, done well, is a tool for reflection and guidance — not fear or
            dependency. We design every feature, from wallet-based per-minute consultations to
            our AI tools, around giving you clear, honest information you can act on, at a
            price that's transparent from the first minute.
          </p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 32, fontSize: 22, fontFamily: 'var(--font-serif)' }}>
            What makes us different
          </h3>
          <ul style={{ paddingLeft: 20, marginTop: 12 }}>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Real calculations.</strong> Our
              chart engine uses actual planetary ephemeris data and the Lahiri ayanamsa — the
              same standard used in traditional Vedic astrology — not templated text.
            </li>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Verified astrologers.</strong> Every
              astrologer on our platform is onboarded and reviewed before they can take live
              consultations.
            </li>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Speak in your language.</strong> Chat
              consultations support real-time Hindi–English translation, so language is never a
              barrier between you and the astrologer you trust.
            </li>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Pay only for what you use.</strong> Our
              wallet-based, per-minute billing means no hidden packages or surprise charges.
            </li>
          </ul>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 32, fontSize: 22, fontFamily: 'var(--font-serif)' }}>
            Get in touch
          </h3>
          <p>
            Questions, feedback, or partnership inquiries — we'd love to hear from you at{' '}
            <a href="mailto:astrocelestique310@gmail.com" style={{ color: 'var(--gold-light)' }}>
              astrocelestique310@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}