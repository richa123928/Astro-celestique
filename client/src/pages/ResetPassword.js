import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <div className="auth-page" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, background: 'var(--navy-deep)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--font-serif)', fontSize: 28,
          color: 'var(--text-primary)', marginBottom: 24,
          textDecoration: 'none', justifyContent: 'center'
        }}>
          <span style={{ color: 'var(--gold)' }}>◉</span>
          <span>Jyotish<span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>AI</span></span>
        </Link>

        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 24, padding: '40px 36px'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 32,
            fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8
          }}>
            Choose a new password
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  padding: '13px 16px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-light)', borderRadius: 10,
                  fontSize: 14, color: 'var(--text-primary)', outline: 'none',
                  fontFamily: 'var(--font-sans)'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{
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
        </div>
      </div>
    </div>
  );
}