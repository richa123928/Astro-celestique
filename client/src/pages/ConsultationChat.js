import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import usePayment from '../hooks/usePayment';

const LANGUAGES = [
  { code: 'english',    label: 'English',    flag: '🇬🇧' },
  { code: 'hindi',      label: 'हिंदी',      flag: '🇮🇳' },
  { code: 'spanish',    label: 'Español',    flag: '🇪🇸' },
  { code: 'french',     label: 'Français',   flag: '🇫🇷' },
  { code: 'arabic',     label: 'العربية',    flag: '🇸🇦' },
  { code: 'portuguese', label: 'Português',  flag: '🇧🇷' },
];

export default function ConsultationChat() {
  const { user }        = useAuth();
  const { convert }     = useCurrency();
  const navigate        = useNavigate();
  const location        = useLocation();
  const astrologer      = location.state?.astrologer;

  const [status,       setStatus]       = useState('idle'); // idle | requesting | waiting | chatting | ended | declined
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [sessionId,    setSessionId]    = useState(null);
  const [isTyping,     setIsTyping]     = useState(false);
  const [sessionTime,  setSessionTime]  = useState(0);
  const [walletBalance,setWalletBalance]= useState(user?.walletBalance || 0);
  const [userLanguage, setUserLanguage] = useState('english');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [socket,       setSocket]       = useState(null);

  const messagesEndRef = useRef(null);
  const timerRef       = useRef(null);
  const billingRef     = useRef(null);

  useEffect(() => {
    if (!astrologer) { navigate('/consultations'); return; }
    const newSocket = io('https://astro-celestique.onrender.com');
    setSocket(newSocket);

    newSocket.on('request_sent', ({ sessionId }) => {
      setSessionId(sessionId);
      setStatus('waiting');
    });

    newSocket.on('chat_started', ({ sessionId }) => {
      setStatus('chatting');
      setMessages([{
        from: 'system',
        text: `✅ ${astrologer.name} has accepted your request. Chat started!`
      }]);
      toast.success(`${astrologer.name} accepted your chat!`);

      // Start session timer
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);

      // Start billing — deduct per minute
      billingRef.current = setInterval(async () => {
        try {
          const { data } = await axios.post('/api/consultation/deduct', {
            amount: astrologer.rate,
            astrologerName: astrologer.name
          });
          setWalletBalance(data.walletBalance);
          if (data.walletBalance < astrologer.rate) {
            toast.error('Low wallet balance! Please add funds.');
          }
          if (data.walletBalance <= 0) {
            handleEndSession();
            toast.error('Wallet empty! Session ended.');
          }
        } catch (err) {
          console.error('Billing error:', err);
        }
      }, 60000); // Every minute
    });

    newSocket.on('chat_declined', ({ message }) => {
      setStatus('declined');
      toast.error(message);
    });

    newSocket.on('receive_message', (data) => {
      setMessages(m => [...m, {
        from:        data.isMine ? 'user' : 'astrologer',
        text:        data.displayMessage,
        original:    data.translatedMessage,
        senderName:  data.senderName,
        time:        data.timestamp
      }]);
    });

    newSocket.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    newSocket.on('session_ended', () => {
      handleSessionEnded();
    });

    newSocket.on('chat_error', ({ message }) => {
      toast.error(message);
      navigate('/consultations');
    });

    return () => {
      newSocket.disconnect();
      if (timerRef.current)   clearInterval(timerRef.current);
      if (billingRef.current) clearInterval(billingRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const requestChat = () => {
    if (!user) { navigate('/auth'); return; }
    if (walletBalance < astrologer.rate) {
      toast.error(`Insufficient balance! You need at least ${convert(astrologer.rate)} to start.`);
      return;
    }
    setStatus('requesting');
    socket.emit('chat_request', {
      astrologerId: astrologer.id.toString(),
      userId:       user._id,
      userName:     user.name,
      userLanguage
    });
  };

  const { initiatePayment } = usePayment();
const [showFunds, setShowFunds] = useState(false);
const [fundAmount, setFundAmount] = useState(100);

const addFunds = async () => {
  await initiatePayment({
    amount: fundAmount,
    purpose: 'wallet',
    description: `Add ₹${fundAmount} to wallet`,
    onSuccess: (data) => {
      setWalletBalance(data.walletBalance);
      setShowFunds(false);
      toast.success('Funds added!');
    }
  });
};

  const sendMessage = () => {
    if (!input.trim() || loading || status !== 'chatting') return;
    const msgText = input.trim();
    setInput('');

    socket.emit('send_message', {
      sessionId,
      message:      msgText,
      senderType:   'user',
      senderName:   user?.name,
      userLanguage
    });
    socket.emit('typing', { sessionId, senderType: 'user' });
  };

  const handleEndSession = () => {
    if (timerRef.current)   clearInterval(timerRef.current);
    if (billingRef.current) clearInterval(billingRef.current);
    socket?.emit('end_session', { sessionId });
    setStatus('ended');
  };

  const handleSessionEnded = () => {
    if (timerRef.current)   clearInterval(timerRef.current);
    if (billingRef.current) clearInterval(billingRef.current);
    setStatus('ended');
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const selectedLang = LANGUAGES.find(l => l.code === userLanguage);

  if (!astrologer) return null;

  // ── Language Picker Screen ───────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy-deep)',
        paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border)',
          borderRadius: 24, padding: '48px 40px',
          width: '100%', maxWidth: 480, textAlign: 'center'
        }}>
          {/* Astrologer Info */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            overflow: 'hidden', margin: '0 auto 16px',
            background: 'var(--navy-light)'
          }}>
            {astrologer.image ? (
              <img src={astrologer.image} alt={astrologer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 32
              }}>🧘</div>
            )}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: 26,
            color: 'var(--text-primary)', marginBottom: 4
          }}>
            Chat with {astrologer.name}
          </h3>
          <p style={{ color: 'var(--gold-light)', fontSize: 14, marginBottom: 32 }}>
            {convert(astrologer.rate)}/min · {astrologer.experience} years experience
          </p>

          {/* Language Selection */}
          <div style={{ marginBottom: 28 }}>
            <p style={{
              fontSize: 13, color: 'var(--text-muted)',
              marginBottom: 12, letterSpacing: '0.06em'
            }}>
              SELECT YOUR LANGUAGE
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10
            }}>
              {LANGUAGES.map(lang => (
                <button key={lang.code}
                  onClick={() => setUserLanguage(lang.code)}
                  style={{
                    padding: '12px 8px', borderRadius: 12,
                    border: '1px solid',
                    borderColor: userLanguage === lang.code ? 'var(--gold)' : 'var(--border-light)',
                    background: userLanguage === lang.code ? 'rgba(201,150,60,0.15)' : 'transparent',
                    color: userLanguage === lang.code ? 'var(--gold-light)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{lang.flag}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{lang.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Balance */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-light)',
            borderRadius: 12, padding: '12px 16px',
            marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 14
          }}>
            <span style={{ color: 'var(--text-muted)' }}>💰 Wallet Balance</span>
            <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
              {convert(walletBalance)}
            </span>
          </div>

          {walletBalance < astrologer.rate && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '12px 16px',
              marginBottom: 16, fontSize: 13, color: '#f87171'
            }}>
              ⚠️ Insufficient balance. Add at least {convert(astrologer.rate)} to start.
            </div>
          )}

          {showFunds && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 3000
            }}>
              <div style={{
                background: 'var(--navy-card)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 32, width: 320
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Add Funds</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                  {[100, 200, 500].map(amt => (
                    <button key={amt} onClick={() => setFundAmount(amt)}
                      style={{
                        padding: 10, borderRadius: 10,
                        border: fundAmount === amt ? '1px solid var(--gold)' : '1px solid var(--border-light)',
                        background: fundAmount === amt ? 'rgba(201,150,60,0.15)' : 'transparent',
                        color: 'var(--text-primary)', cursor: 'pointer'
                      }}>₹{amt}</button>
                  ))}
                </div>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={addFunds}>
                  Add ₹{fundAmount}
                </button>
                <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={() => setShowFunds(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: 12 }}
            onClick={() => setShowFunds(true)}>
            💰 Add Funds
          </button>

          <button className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16 }}
            onClick={requestChat}
            disabled={walletBalance < astrologer.rate}>
            Start Chat {selectedLang?.flag} 💬
          </button>
          <button
            style={{
              width: '100%', marginTop: 10, padding: '12px',
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 14,
              cursor: 'pointer', fontFamily: 'var(--font-sans)'
            }}
            onClick={() => navigate('/consultations')}>
            ← Back to Astrologers
          </button>
        </div>
      </div>
    );
  }

  // ── Waiting Screen ───────────────────────────────────────────────────────
  if (status === 'requesting' || status === 'waiting') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy-deep)',
        paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            overflow: 'hidden', margin: '0 auto 20px',
            background: 'var(--navy-light)'
          }}>
            {astrologer.image ? (
              <img src={astrologer.image} alt={astrologer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ fontSize: 40, lineHeight: '80px' }}>🧘</div>}
          </div>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--border-light)',
            borderTop: '3px solid var(--gold)',
            animation: 'rotate 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: 24,
            color: 'var(--text-primary)', marginBottom: 8
          }}>
            Connecting to {astrologer.name}...
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            🌐 Language: {selectedLang?.flag} {selectedLang?.label} · Please wait
          </p>
          <button
            onClick={() => navigate('/consultations')}
            style={{
              padding: '12px 24px', borderRadius: 100,
              background: 'transparent',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 14
            }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Declined Screen ──────────────────────────────────────────────────────
  if (status === 'declined' || status === 'ended') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy-deep)',
        paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {status === 'ended' ? '🙏' : '😔'}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-serif)', fontSize: 28,
            color: 'var(--text-primary)', marginBottom: 8
          }}>
            {status === 'ended' ? 'Session Ended' : 'Astrologer Unavailable'}
          </h3>
          {status === 'ended' && (
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 8 }}>
              Duration: {formatTime(sessionTime)} · Thank you for consulting with {astrologer.name}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
            <button className="btn-primary" onClick={() => navigate('/consultations')}>
              Back to Astrologers
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active Chat ──────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy-deep)',
      paddingTop: 80, display: 'flex', flexDirection: 'column'
    }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '12px 0'
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              background: 'var(--navy-light)'
            }}>
              {astrologer.image ? (
                <img src={astrologer.image} alt={astrologer.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <div style={{ fontSize: 24, lineHeight: '44px', textAlign: 'center' }}>🧘</div>}
            </div>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-serif)', fontSize: 18,
                color: 'var(--text-primary)', marginBottom: 2
              }}>
                {astrologer.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4ade80', animation: 'pulse 2s infinite'
                }} />
                <span style={{ fontSize: 12, color: '#4ade80' }}>Online</span>
                <span style={{
                  fontSize: 11, color: 'var(--gold)',
                  background: 'rgba(201,150,60,0.1)',
                  padding: '2px 8px', borderRadius: 100
                }}>
                  🌐 {selectedLang?.flag} {selectedLang?.label} ↔ हिंदी
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 20,
                color: 'var(--gold-light)'
              }}>
                ⏱ {formatTime(sessionTime)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                💰 {convert(walletBalance)} left
              </div>
            </div>
            <button onClick={handleEndSession}
              style={{
                padding: '10px 20px', borderRadius: 100,
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-sans)'
              }}>
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Translation bar */}
      <div style={{
        background: 'rgba(201,150,60,0.08)',
        borderBottom: '1px solid var(--border-light)',
        padding: '8px 0', textAlign: 'center'
      }}>
        <p style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.04em' }}>
          🌐 AUTO-TRANSLATION ACTIVE — Your {selectedLang?.label} ↔ Astrologer's Hindi
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        maxHeight: 'calc(100vh - 300px)'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.from === 'system' ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 12, color: 'var(--text-dim)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '6px 16px', borderRadius: 100
                  }}>
                    {msg.text}
                  </span>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  gap: 10, alignItems: 'flex-end'
                }}>
                  {msg.from === 'astrologer' && (
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      overflow: 'hidden', flexShrink: 0,
                      background: 'var(--navy-light)'
                    }}>
                      {astrologer.image
                        ? <img src={astrologer.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ fontSize: 16, lineHeight: '30px', textAlign: 'center' }}>🧘</div>
                      }
                    </div>
                  )}
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.from === 'user' ? 'var(--gold-dim)' : 'var(--navy-card)',
                      border: '1px solid',
                      borderColor: msg.from === 'user' ? 'transparent' : 'var(--border-light)',
                      color: msg.from === 'user' ? 'var(--gold-pale)' : 'var(--text-primary)',
                      fontSize: 15, lineHeight: 1.6
                    }}>
                      {msg.text}
                    </div>
                    {msg.original && (
                      <div style={{
                        fontSize: 11, color: 'var(--text-dim)',
                        marginTop: 3, padding: '0 4px', fontStyle: 'italic',
                        textAlign: msg.from === 'user' ? 'right' : 'left'
                      }}>
                        Original: {msg.original}
                      </div>
                    )}
                    <div style={{
                      fontSize: 10, color: 'var(--text-dim)',
                      marginTop: 2, padding: '0 4px',
                      textAlign: msg.from === 'user' ? 'right' : 'left'
                    }}>
                      {msg.time && new Date(msg.time).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--navy-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16
              }}>🧘</div>
              <div style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '18px 18px 18px 4px',
                padding: '12px 16px', display: 'flex', gap: 4
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--gold-dim)',
                    animation: `pulse 1.2s ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        background: 'var(--navy-dark)',
        borderTop: '1px solid var(--border-light)',
        padding: '14px 0'
      }}>
        <div className="container" style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder={`Type in ${selectedLang?.label} — auto-translated for astrologer...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            style={{
              flex: 1, padding: '14px 20px',
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 100, fontSize: 14,
              color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button className="btn-primary"
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{ padding: '14px 28px' }}>
            Send 🌐
          </button>
        </div>
      </div>
    </div>
  );
}