import React from 'react';

export default function PaymentPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 100, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <span className="section-label">LEGAL</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, color: 'var(--text-primary)', marginBottom: 24 }}>
          Payment & Wallet Policy
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.8 }}>
          <p>Last updated: June 2026</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>1. Wallet System</h3>
          <p>Astro Celestique uses a prepaid wallet system. Add funds to your wallet to access AI Chat, live consultations, and other paid services.</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>2. Pricing</h3>
          <p>AI Chat with Jyoti: ₹20 / $0.40 / €0.40 / £0.40 per message.</p>
          <p>Live astrologer consultations: priced per minute as shown on each astrologer's profile.</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>3. Payments</h3>
          <p>All payments are processed securely through Razorpay. We accept Credit/Debit Cards, UPI, Netbanking, and Wallets.</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>4. Refund Policy</h3>
          <p>Wallet top-ups are non-refundable except in cases of duplicate/failed transactions where money was deducted but wallet was not credited. Such cases are resolved within 5-7 business days.</p>
          <p>Puja booking payments can be refunded if cancelled within 24 hours of booking, subject to a 10% processing fee.</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>5. Welcome & Referral Bonus</h3>
          <p>New users receive a welcome bonus of ₹50 / $1 / €1 / £1 added to their wallet upon registration.</p>
          <p>Referral bonus of the same amount is credited when a referred friend completes their first transaction.</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>6. Currency Conversion</h3>
          <p>All transactions are processed in INR. Displayed prices in USD/EUR/GBP are approximate conversions for reference.</p>

          <h3 style={{ color: 'var(--text-primary)', marginTop: 24 }}>7. Contact</h3>
          <p>For payment issues, email astrocelestique310@gmail.com — we respond within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}