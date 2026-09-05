import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

export default function ReferAndEarn() {
  const { user } = useAuth();
  const { currency, CURRENCIES } = useCurrency();

  if (!user) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Please log in to see your referral code.
      </div>
    );
  }

  const bonusAmounts = { INR: 50, USD: 1, EUR: 1, GBP: 1 };
  const userCurrency = user.currency || currency;
  const bonusDisplay = `${CURRENCIES[userCurrency]?.symbol || '₹'}${bonusAmounts[userCurrency] || 50}`;

  const shareLink = `${window.location.origin}/auth?ref=${user.referralCode}`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{
        fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400,
        color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center'
      }}>
        Refer & <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Earn</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 40 }}>
        Share your code — when your friend completes their first wallet top-up, you both win.
      </p>

      <div style={{
        background: 'var(--navy-card)', border: '1px solid var(--border-light)',
        borderRadius: 20, padding: 32, marginBottom: 24, textAlign: 'center'
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: 10 }}>
          YOUR REFERRAL CODE
        </div>
        <div style={{
          fontFamily: 'monospace', fontSize: 28, fontWeight: 700,
          color: 'var(--gold-light)', letterSpacing: '0.08em', marginBottom: 16
        }}>
          {user.referralCode}
        </div>
        <button
          className="btn-secondary"
          style={{ padding: '10px 20px' }}
          onClick={() => copyToClipboard(user.referralCode, 'Referral code')}
        >
          Copy Code
        </button>
      </div>

      <div style={{
        background: 'var(--navy-card)', border: '1px solid var(--border-light)',
        borderRadius: 20, padding: 24, marginBottom: 32
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: 10 }}>
          OR SHARE YOUR LINK
        </div>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'var(--navy-deep)', border: '1px solid var(--border-light)',
          borderRadius: 10, padding: '10px 14px'
        }}>
          <span style={{
            flex: 1, fontSize: 13, color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {shareLink}
          </span>
          <button
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
            onClick={() => copyToClipboard(shareLink, 'Referral link')}
          >
            Copy Link
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: 'rgba(201,150,60,0.08)', border: '1px solid rgba(201,150,60,0.25)',
          borderRadius: 16, padding: 20, textAlign: 'center'
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🎁</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>
            You get {bonusDisplay}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            When your friend tops up their wallet for the first time
          </div>
        </div>
        <div style={{
          background: 'rgba(201,150,60,0.08)', border: '1px solid rgba(201,150,60,0.25)',
          borderRadius: 16, padding: 20, textAlign: 'center'
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>✨</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>
            They get a welcome bonus
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Added to their wallet the moment they sign up
          </div>
        </div>
      </div>
    </div>
  );
}