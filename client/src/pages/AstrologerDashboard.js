import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Map logged-in user to astrologer ID for testing
// In production each astrologer has their own account
const ASTROLOGER_MAP = {
  'yricha246@gmail.com': '1', // Admin → Shukramuni Ji (id: 1)
};

export default function AstrologerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate                                         = useNavigate();

  const [socket,        setSocket]        = useState(null);
  const [onlineStatus,  setOnlineStatus]  = useState('online');
  const [incomingReq,   setIncomingReq]   = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [sessionId,     setSessionId]     = useState(null);
  const [userSocketId,  setUserSocketId]  = useState(null);
  const [sessionTime,   setSessionTime]   = useState(0);
  const [isTyping,      setIsTyping]      = useState(false);
  const [todaySessions, setTodaySessions] = useState(0);
  const [totalMinutes,  setTotalMinutes]  = useState(0);

  const messagesEndRef = useRef(null);
  const timerRef       = useRef(null);

  const astrologerId = user?.email ? (ASTROLOGER_MAP[user.email] || '1') : '1';

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/auth'); return; }

    const newSocket = io('https://astro-celestique.onrender.com');
    setSocket(newSocket);

    // Register as astrologer when socket connects
    newSocket.on('connect', () => {
      newSocket.emit('astrologer_online', {
        astrologerId,
        astrologerName: user?.name
      });
      console.log('Astrologer registered:', astrologerId);
    });

    // Incoming chat request
    newSocket.on('incoming_request', (data) => {
      setIncomingReq(data);
      toast(`💬 New chat request from ${data.userName}!`, {
        duration: 0, // Don't auto-dismiss
        icon: '🔔'
      });
    });

    // Receive messages
    newSocket.on('receive_message', (data) => {
      if (data.senderType === 'user' || !data.isMine) {
        setMessages(m => [...m, {
          from:      'user',
          text:      data.displayMessage || data.message,
          original:  data.translatedMessage,
          time:      data.timestamp
        }]);
      } else {
        setMessages(m => [...m, {
          from:     'astrologer',
          text:     data.displayMessage || data.message,
          original: data.translatedMessage,
          time:     data.timestamp
        }]);
      }
    });

    // Typing
    newSocket.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    // Session ended by user
    newSocket.on('session_ended', () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionActive(false);
      setTodaySessions(s => s + 1);
      setTotalMinutes(m => m + Math.floor(sessionTime / 60));
      toast('Session ended by user 🙏');
      setMessages([]);
      setSessionId(null);
    });

    return () => {
      newSocket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const acceptChat = () => {
    if (!incomingReq) return;
    socket.emit('accept_chat', {
      sessionId:    incomingReq.sessionId,
      userSocketId: incomingReq.userSocketId,
      astrologerId
    });
    setSessionId(incomingReq.sessionId);
    setUserSocketId(incomingReq.userSocketId);
    setSessionActive(true);
    setIncomingReq(null);
    setMessages([{
      from: 'system',
      text: `✅ Connected with ${incomingReq.userName}. Chat started!`
    }]);

    // Start timer
    timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    toast.success(`Chat started with ${incomingReq.userName}`);
  };

  const declineChat = () => {
    if (!incomingReq) return;
    socket.emit('decline_chat', { userSocketId: incomingReq.userSocketId });
    setIncomingReq(null);
    toast('Request declined');
  };

  const sendMessage = () => {
    if (!input.trim() || !sessionActive) return;
    const msgText = input.trim();
    setInput('');

    socket.emit('send_message', {
      sessionId,
      message:    msgText,
      senderType: 'astrologer',
      senderName: user?.name,
      userLanguage: incomingReq?.userLanguage || 'english'
    });

    socket.emit('typing', { sessionId, senderType: 'astrologer' });
  };

  const endSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    socket?.emit('end_session', { sessionId });
    setSessionActive(false);
    setTodaySessions(s => s + 1);
    setTotalMinutes(m => m + Math.floor(sessionTime / 60));
    setMessages([]);
    setSessionId(null);
    setSessionTime(0);
    toast('Session ended 🙏');
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (authLoading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--navy-deep)'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '2px solid var(--border-light)',
        borderTop: '2px solid var(--gold)',
        animation: 'rotate 1s linear infinite'
      }} />
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy-deep)',
      paddingTop: 80
    }}>

      {/* Incoming Request Popup */}
      {incomingReq && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 3000, padding: 24
        }}>
          <div style={{
            background: 'var(--navy-card)',
            border: '2px solid var(--gold)',
            borderRadius: 24, padding: '40px',
            width: '100%', maxWidth: 400,
            textAlign: 'center',
            animation: 'fadeUp 0.3s ease both'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 26,
              color: 'var(--text-primary)', marginBottom: 8
            }}>
              New Chat Request!
            </h3>
            <p style={{ color: 'var(--gold-light)', fontSize: 16, marginBottom: 4 }}>
              {incomingReq.userName}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
              Language: {incomingReq.userLanguage} · Wants to consult with you
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15 }}
                onClick={acceptChat}>
                ✅ Accept
              </button>
              <button className="btn-secondary"
                style={{ flex: 1, padding: '14px', fontSize: 15 }}
                onClick={declineChat}>
                ❌ Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '20px 0'
      }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <span className="section-label">ASTROLOGER PANEL</span>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 24,
              color: 'var(--text-primary)', marginTop: 4
            }}>
              Namaste, {user?.name} 🙏
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['online', 'busy', 'offline'].map(s => (
              <button key={s}
                onClick={() => setOnlineStatus(s)}
                style={{
                  padding: '8px 18px', borderRadius: 100,
                  border: '1px solid',
                  borderColor: onlineStatus === s
                    ? s === 'online' ? '#4ade80' : s === 'busy' ? '#fbbf24' : '#94a3b8'
                    : 'var(--border-light)',
                  background: onlineStatus === s
                    ? s === 'online' ? 'rgba(34,197,94,0.15)' : s === 'busy' ? 'rgba(251,191,36,0.15)' : 'rgba(100,116,139,0.15)'
                    : 'transparent',
                  color: onlineStatus === s
                    ? s === 'online' ? '#4ade80' : s === 'busy' ? '#fbbf24' : '#94a3b8'
                    : 'var(--text-dim)',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  textTransform: 'capitalize', transition: 'all 0.2s'
                }}>
                {s === 'online' ? '🟢' : s === 'busy' ? '🟡' : '⚫'} {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translation Notice */}
      <div style={{
        background: 'rgba(201,150,60,0.08)',
        borderBottom: '1px solid var(--border-light)',
        padding: '8px 0', textAlign: 'center'
      }}>
        <p style={{ fontSize: 12, color: 'var(--gold)' }}>
          🌐 हिंदी में लिखें — यह अपने आप user की भाषा में translate होगा
        </p>
      </div>

      <div className="container" style={{ padding: '24px' }}>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, marginBottom: 24
        }}>
          {[
            { label: "Today's Sessions", value: todaySessions, icon: '💬', color: '#e8b460' },
            { label: 'Total Minutes',    value: totalMinutes,  icon: '⏱',  color: '#4ade80' },
            { label: "Today's Earnings", value: `₹${totalMinutes * 30}`, icon: '💰', color: '#818cf8' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 16, padding: '20px',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 20
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Waiting state */}
        {!sessionActive && (
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 20, padding: '60px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {onlineStatus === 'online' ? '🔮' : onlineStatus === 'busy' ? '⏳' : '😴'}
            </div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 24,
              color: 'var(--text-primary)', marginBottom: 8
            }}>
              {onlineStatus === 'online'
                ? 'Waiting for Consultation Requests...'
                : onlineStatus === 'busy'
                ? 'You are marked as Busy'
                : 'You are Offline'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {onlineStatus === 'online'
                ? 'You will receive a popup when a user wants to chat with you.'
                : onlineStatus === 'busy'
                ? 'Users will see you as busy. Change to Online to receive requests.'
                : 'You are not receiving requests. Go Online to start accepting chats.'}
            </p>
          </div>
        )}

        {/* Active chat */}
        {sessionActive && (
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 20, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 380px)', minHeight: 400
          }}>
            {/* Chat header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-light)',
              background: 'var(--navy-mid)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Active Consultation
                </p>
                <p style={{ fontSize: 12, color: 'var(--gold)' }}>
                  ⏱ {formatTime(sessionTime)}
                </p>
              </div>
              <button onClick={endSession}
                style={{
                  padding: '8px 16px', borderRadius: 100,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)'
                }}>
                End Session
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflow: 'auto', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 12
            }}>
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
                      justifyContent: msg.from === 'astrologer' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{
                          fontSize: 11, color: 'var(--text-dim)', marginBottom: 3,
                          textAlign: msg.from === 'astrologer' ? 'right' : 'left'
                        }}>
                          {msg.from === 'astrologer' ? 'You' : 'User'}
                        </div>
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: msg.from === 'astrologer' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: msg.from === 'astrologer' ? 'var(--gold-dim)' : 'var(--navy-mid)',
                          color: msg.from === 'astrologer' ? 'var(--gold-pale)' : 'var(--text-primary)',
                          fontSize: 15, lineHeight: 1.6
                        }}>
                          {msg.text}
                        </div>
                        {msg.original && (
                          <div style={{
                            fontSize: 11, color: 'var(--text-dim)',
                            marginTop: 3, fontStyle: 'italic',
                            textAlign: msg.from === 'astrologer' ? 'right' : 'left'
                          }}>
                            Translated: {msg.original}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    background: 'var(--navy-mid)',
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

            {/* Input */}
            <div style={{
              borderTop: '1px solid var(--border-light)',
              padding: '14px 16px', display: 'flex', gap: 10
            }}>
              <input
                type="text"
                placeholder="हिंदी में लिखें (Type in Hindi)..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1, padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 100, fontSize: 14,
                  color: 'var(--text-primary)', outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button className="btn-primary"
                onClick={sendMessage}
                disabled={!input.trim()}>
                भेजें 🌐
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}