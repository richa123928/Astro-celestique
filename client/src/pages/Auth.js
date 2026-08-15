import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Auth() {
  const [mode,    setMode]    = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent,  setForgotSent]  = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-glow auth-glow--1" />
        <div className="auth-glow auth-glow--2" />
      </div>

      <div className="auth-container">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <span style={{ color: 'var(--gold)' }}>◉</span>
          <span>Jyotish<span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>AI</span></span>
        </Link>

        {/* Card */}
        <div className="auth-card">
          {mode === 'forgot' ? (
            <>
              <h1 className="auth-title serif">Reset your password</h1>
              <p className="auth-subtitle">
                {forgotSent
                  ? "Check your email for a reset link. It'll expire in 10 minutes."
                  : "Enter your email and we'll send you a link to reset your password."
                }
              </p>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} className="auth-form">
                  <div className="auth-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="auth-submit btn-primary" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', fontSize: 40, margin: '12px 0 24px' }}>📧</div>
              )}

              <p className="auth-switch">
                <button
                  className="auth-switch-btn"
                  onClick={() => { setMode('login'); setForgotSent(false); setForgotEmail(''); }}
                >
                  ← Back to Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title serif">
                {mode === 'login' ? 'Welcome back' : 'Begin your journey'}
              </h1>
              <p className="auth-subtitle">
                {mode === 'login'
                  ? 'Sign in to access your cosmic dashboard'
                  : 'Create your account to explore Vedic wisdom'
                }
              </p>

              {/* Tab Toggle */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {mode === 'register' && (
                  <div className="auth-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>

                <div className="auth-field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  />
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => setMode('forgot')}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? 'Please wait...'
                    : mode === 'login' ? 'Sign In' : 'Create Account'
                  }
                </button>
              </form>

              <p className="auth-switch">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  className="auth-switch-btn"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="auth-terms">
          By continuing, you agree to our{' '}
          <Link to="/terms">Terms</Link> &amp; <Link to="/privacy">Privacy Policy</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          background: var(--navy-deep);
        }
        .auth-bg { position: absolute; inset: 0; z-index: 0; }
        .auth-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.12;
        }
        .auth-glow--1 {
          width: 500px; height: 500px;
          background: var(--gold-dim);
          top: -150px; right: -100px;
        }
        .auth-glow--2 {
          width: 400px; height: 400px;
          background: #1a3a6e;
          bottom: -100px; left: -100px;
        }
        .auth-container {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-serif);
          font-size: 28px;
          color: var(--text-primary);
        }
        .auth-card {
          width: 100%;
          background: var(--navy-card);
          border: 1px solid var(--border-light);
          border-radius: 24px;
          padding: 40px 36px;
        }
        .auth-title {
          font-size: 32px;
          font-weight: 400;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 28px;
        }
        .auth-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
        }
        .auth-tab {
          flex: 1;
          padding: 10px;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--font-sans);
        }
        .auth-tab.active {
          background: var(--navy-mid);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .auth-field label {
          font-size: 13px;
          color: var(--text-muted);
        }
        .auth-field input {
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.2s;
          font-family: var(--font-sans);
        }
        .auth-field input:focus {
          border-color: var(--gold-dim);
        }
        .auth-field input::placeholder {
          color: var(--text-dim);
        }
        .auth-forgot-link {
          align-self: flex-end;
          background: none;
          border: none;
          color: var(--gold-light);
          font-size: 12px;
          cursor: pointer;
          font-family: var(--font-sans);
          padding: 2px 0;
        }
        .auth-submit {
          width: 100%;
          justify-content: center;
          padding: 14px;
          font-size: 15px;
          margin-top: 8px;
        }
        .auth-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .auth-switch {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .auth-switch-btn {
          background: none;
          border: none;
          color: var(--gold-light);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .auth-terms {
          font-size: 12px;
          color: var(--text-dim);
          text-align: center;
        }
        .auth-terms a {
          color: var(--text-muted);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}