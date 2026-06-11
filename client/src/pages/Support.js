import React from 'react';

export default function Support() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 100, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <span className="section-label">HELP CENTER</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, color: 'var(--text-primary)', marginBottom: 24 }}>
          Customer Support
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
          We're here to help! Use the chat widget at the bottom right of your screen for instant AI support,
          available 24/7. For urgent issues, our team is reachable via email.
        </p>

        <div style={{
          background: 'var(--navy-card)', border: '1px solid var(--border-light)',
          borderRadius: 16, padding: 28, marginBottom: 24
        }}>
          <h3 style={{ color: 'var(--gold-light)', marginBottom: 12 }}>📧 Email Support</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            astrocelestique310@gmail.com<br />
            Response time: within 24 hours
          </p>
        </div>

        <div style={{
          background: 'var(--navy-card)', border: '1px solid var(--border-light)',
          borderRadius: 16, padding: 28, marginBottom: 24
        }}>
          <h3 style={{ color: 'var(--gold-light)', marginBottom: 12 }}>💬 Live Chat</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Click the Support button at the bottom right corner of any page.
            Our AI assistant Jyoti will help instantly, with human escalation available.
          </p>
        </div>

        <div style={{
          background: 'var(--navy-card)', border: '1px solid var(--border-light)',
          borderRadius: 16, padding: 28
        }}>
          <h3 style={{ color: 'var(--gold-light)', marginBottom: 12 }}>❓ Frequently Asked Questions</h3>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>How do I add funds to my wallet?</strong><br/>
            Go to AI Chat or any consultation page and click "Add Funds".</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--text-primary)' }}>Is my payment information secure?</strong><br/>
            Yes, all payments are processed via Razorpay with bank-level encryption.</p>
            <p style={{ marginTop: 12 }}><strong style={{ color: 'var(--text-primary)' }}>How accurate is the Kundli generator?</strong><br/>
            Our calculations are based on real astronomical data combined with AI-powered Vedic analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}