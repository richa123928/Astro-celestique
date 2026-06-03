import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import usePayment from '../hooks/usePayment';
import { useCurrency } from '../context/CurrencyContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const SUGGESTED_QUESTIONS = [
  'What does my birth chart say about my career?',
  'When will I find my soulmate?',
  'What is my lucky gemstone?',
  'How is my Saturn dasha affecting me?',
  'What remedies can improve my finances?',
  'Tell me about my moon sign personality',
];

export default function AIChat() {
  const { user, isAuthenticated } = useAuth();
  const { initiatePayment, loading: paymentLoading } = usePayment();
  const { convert, currency }     = useCurrency();
  const navigate                  = useNavigate();
  const [messages,   setMessages]   = useState([
    {
      role: 'assistant',
      content: `Namaste! 🙏 I am Jyoti, your personal Vedic astrologer at Astro Celestique.\n\nI am here to guide you through the cosmic energies shaping your life — career, love, karma, and dharma.\n\nEach message costs ${convert(10)} from your wallet. How may I illuminate your path today?`
    }
  ]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [sessionId]                     = useState(`session_${Date.now()}`);
  const [showFunds,    setShowFunds]    = useState(false);
  const [fundAmount,   setFundAmount]   = useState(100);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const messagesEndRef                  = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) setWalletBalance(user.walletBalance);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput('');
    setMessages(m => [...m, { role: 'user', content: messageText }]);
    setLoading(true);

    try {
      const { data } = await axios.post('/api/chat/ai', {
        message: messageText,
        sessionId
      });

      setMessages(m => [...m, { role: 'assistant', content: data.message }]);

      // Update wallet balance live
      setWalletBalance(data.walletBalance);

      toast.success(`${convert(data.charged)} deducted · Balance: ${convert(data.walletBalance)}`, {
        duration: 2000,
        icon: '💰'
      });

    } catch (err) {
      if (err.response?.data?.code === 'INSUFFICIENT_BALANCE') {
        setShowFunds(true);
        toast.error('Insufficient balance! Please add funds.');
        setMessages(m => [...m, {
          role: 'assistant',
          content: '🙏 Your wallet balance is insufficient. Please add funds to continue our cosmic conversation.'
        }]);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async () => {
    try {
      await initiatePayment({
        amount:      fundAmount,
        purpose:     'wallet',
        description: `Add ₹${fundAmount} to Astro Celestique Wallet`,
        onSuccess:   (data) => {
          setWalletBalance(data.walletBalance);
          setShowFunds(false);
        }
      });
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-deep)',
      paddingTop: 80,
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '20px 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48,
              background: 'rgba(201,150,60,0.15)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24
            }}>🔮</div>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22, fontWeight: 400,
                color: 'var(--text-primary)'
              }}>
                Jyoti — Vedic AI Oracle
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4ade80',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ fontSize: 12, color: '#4ade80' }}>
                  Online · {convert(10)} per message
                </span>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 12, padding: '8px 16px',
              fontSize: 14, color: 'var(--text-muted)'
            }}>
              💰 Wallet: <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
                {convert(walletBalance)}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: 13, padding: '10px 20px' }}
              onClick={() => setShowFunds(true)}
            >
              Add Funds
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="container" style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '24px', gap: 16, maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto'
        }}>

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeUp 0.3s ease both'
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(201,150,60,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0, marginRight: 10, marginTop: 4
                }}>🔮</div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '14px 18px',
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'var(--gold-dim)'
                  : 'var(--navy-card)',
                border: '1px solid',
                borderColor: msg.role === 'user'
                  ? 'transparent'
                  : 'var(--border-light)',
                color: msg.role === 'user'
                  ? 'var(--gold-pale)'
                  : 'var(--text-primary)',
                fontSize: 15,
                lineHeight: 1.6,
                whiteSpace: 'pre-line'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(201,150,60,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18
              }}>🔮</div>
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 18px',
                display: 'flex', gap: 6, alignItems: 'center'
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--gold-dim)',
                    animation: `pulse 1.2s ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="container" style={{ padding: '0 24px 16px' }}>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10, letterSpacing: '0.08em' }}>
              SUGGESTED QUESTIONS
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 100, padding: '8px 16px',
                    fontSize: 13, color: 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div style={{
          background: 'var(--navy-dark)',
          borderTop: '1px solid var(--border-light)',
          padding: '16px 0'
        }}>
          <div className="container" style={{
            display: 'flex', gap: 12, padding: '0 24px'
          }}>
            <input
              type="text"
              placeholder="Ask Jyoti anything about your cosmic journey..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              style={{
                flex: 1, padding: '14px 20px',
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 100, fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
            <button
              className="btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ padding: '14px 28px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '...' : 'Send ✨'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showFunds && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 24
        }}>
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border)',
            borderRadius: 24, padding: '40px 36px',
            width: '100%', maxWidth: 440,
          }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28, color: 'var(--text-primary)',
              marginBottom: 8
            }}>Add Funds</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
              Add funds to your wallet to continue chatting with Jyoti
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {[100, 200, 500, 1000, 2000, 5000].map(amt => (
                <button key={amt}
                  onClick={() => setFundAmount(amt)}
                  style={{
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid',
                    borderColor: fundAmount === amt ? 'var(--gold)' : 'var(--border-light)',
                    background: fundAmount === amt ? 'rgba(201,150,60,0.15)' : 'transparent',
                    color: fundAmount === amt ? 'var(--gold-light)' : 'var(--text-muted)',
                    fontSize: 15, fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s'
                  }}
                >
                  {convert(amt)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
                onClick={addFunds}
              >
                Add {convert(fundAmount)}
              </button>
              <button
                className="btn-secondary"
                style={{ padding: '14px 20px' }}
                onClick={() => setShowFunds(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}