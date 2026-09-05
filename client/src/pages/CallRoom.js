import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function CallRoom() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const astrologer = location.state?.astrologer;

  const [status, setStatus] = useState('idle'); // idle | requesting | waiting | in-call | declined | ended
  const [callId, setCallId] = useState(null);
  const [socket, setSocket] = useState(null);
  const { convert } = useCurrency();
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const billingRef = useRef(null);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!astrologer) { navigate('/consultations'); return; }
    const newSocket = io('https://astro-celestique.onrender.com');
    setSocket(newSocket);

    newSocket.on('call_request_sent', ({ callId }) => {
      setCallId(callId);
      setStatus('waiting');
    });

    newSocket.on('call_started', ({ callId: startedCallId }) => {
  setCallId(startedCallId);
  setStatus('in-call');

  // Start billing — deduct per minute, same pattern as chat
  billingRef.current = setInterval(async () => {
    try {
      const { data } = await axios.post('/api/consultation/deduct', {
        sessionId: startedCallId,
        amount: astrologer.rate,
        astrologerName: astrologer.name
      });
      setWalletBalance(data.walletBalance);
      if (data.walletBalance < astrologer.rate) {
        toast.error('Low wallet balance! Please add funds.');
      }
      if (data.walletBalance <= 0) {
        socket.emit('end_call', { callId: startedCallId, astrologerId: astrologer.id });
        toast.error('Wallet empty! Call ended.');
      }
    } catch (err) {
      console.error('Billing error:', err);
    }
  }, 60000); // every minute
});

    newSocket.on('call_declined', ({ message }) => {
      setStatus('declined');
      toast.error(message);
    });

    newSocket.on('call_ended', () => {
      if (billingRef.current) clearInterval(billingRef.current);
      setStatus('ended');
    });

    newSocket.on('call_error', ({ message }) => {
      toast.error(message);
      navigate('/consultations');
    });

    return () => {
      newSocket.disconnect();
      if (billingRef.current) clearInterval(billingRef.current);
    };
  }, []);

  // Once in-call, mount the ZegoCloud prebuilt UI into the container
  useEffect(() => {
    if (status !== 'in-call' || !containerRef.current || !callId) return;

    const appID = Number(process.env.REACT_APP_ZEGO_APP_ID);
    const serverSecret = process.env.REACT_APP_ZEGO_SERVER_SECRET;
    const roomID = callId;
    const userID = user?._id || `guest_${Date.now()}`;
    const userName = user?.name || 'Guest';

    // NOTE: generateKitTokenForTest is for quick setup/testing only — before
    // real launch, this token should be generated on your backend instead,
    // so the ServerSecret never ships in frontend code.
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, serverSecret, roomID, userID, userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: containerRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      showTextChat: false,
      onLeaveRoom: () => {
        socket?.emit('end_call', { callId, astrologerId: astrologer.id });
        navigate('/consultations');
      }
    });
  }, [status, callId]);

  const requestCall = () => {
  if (!user) { navigate('/auth'); return; }
  if (walletBalance < astrologer.rate) {
    toast.error(`Insufficient balance! You need at least ${convert(astrologer.rate)} to start.`);
    return;
  }
  setStatus('requesting');
  socket.emit('call_request', {
    astrologerId: astrologer.id.toString(),
    userId: user._id,
    userName: user.name
  });
};

  if (!astrologer) return null;

  if (status === 'idle' || status === 'requesting' || status === 'waiting') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{
            width: 90, height: 90, borderRadius: '50%', overflow: 'hidden',
            margin: '0 auto 20px', background: 'var(--navy-light)'
          }}>
            {astrologer.avatar ? (
              <img src={astrologer.avatar} alt={astrologer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : <div style={{ fontSize: 44, lineHeight: '90px' }}>🔮</div>}
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 8 }}>
            {astrologer.name}
          </h3>
          {status === 'idle' && (
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: 16, marginTop: 16 }}
              onClick={requestCall}>
              📞 Start Voice/Video Call
            </button>
          )}
          {(status === 'requesting' || status === 'waiting') && (
            <>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid var(--border-light)', borderTop: '3px solid var(--gold)',
                animation: 'rotate 1s linear infinite', margin: '20px auto'
              }} />
              <p style={{ color: 'var(--text-muted)' }}>Connecting to {astrologer.name}...</p>
            </>
          )}
          <button onClick={() => navigate('/consultations')}
            style={{
              marginTop: 24, padding: '10px 24px', borderRadius: 100,
              background: 'transparent', border: '1px solid var(--border-light)',
              color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)'
            }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (status === 'declined' || status === 'ended') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{status === 'ended' ? '🙏' : '😔'}</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)', marginBottom: 16 }}>
            {status === 'ended' ? 'Call Ended' : 'Astrologer Unavailable'}
          </h3>
          <button className="btn-primary" onClick={() => navigate('/consultations')}>
            Back to Astrologers
          </button>
        </div>
      </div>
    );
  }

  // in-call — full-screen container for ZegoCloud's UI
  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />
  );
}