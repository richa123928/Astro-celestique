import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useIsMobile from '../hooks/useIsMobile';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`/api/auth/reset-password/${token}`, { password });
      toast.success('Password reset! Please sign in.');
      navigate('/auth');
    } catch (err) {
      toast.error(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: isMobile ? 16 : 24, background: 'var(--navy-deep)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--font-serif)', fontSize: isMobile ? 24 : 28,
          color: 'var(--text-primary)', marginBottom: 24,
          textDecoration: 'none', justifyContent: 'center'
        }}>
          <span style={{ color: 'var(--gold)' }}>◉</span>
          <span>Astro <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Celestique</span></span>
        </Link>

        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 24, padding: isMobile ? '32px 24px' : '40px 36px'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 32,
            fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8
          }}>
            Choose a new password
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.5 }}>
            Enter your new password below. This link expires 10 minutes after it was sent.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 44px 13px 16px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-light)', borderRadius: 10,
                    fontSize: 14, color: 'var(--text-primary)', outline: 'none',
                    fontFamily: 'var(--font-sans)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '13px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-light)', borderRadius: 10,
                  fontSize: 14, color: 'var(--text-primary)', outline: 'none',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginTop: 8 }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
            <Link to="/auth" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}