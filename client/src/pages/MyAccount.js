import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PUJA_NAMES = {
  grah_shanti:         'Grah Shanti Pooja',
  death_shanti:        'Death Shanti Pooja',
  lakshmi_vriddhi:     'Lakshmi Vriddhi Pooja',
  love_relationship:   'Love / Relationship Pooja',
  new_home:            'New Home Pooja',
  saraswati:           'Saraswati Pooja',
  marriage:            'Marriage Pooja',
  sarv_karya_samporan: 'Sarv Karya Samporan Pooja',
};

const STATUS_COLORS = {
  pending:   { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  shipped:   { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa' },
  delivered: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  completed: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
  cancelled: { bg: 'rgba(248,113,113,0.15)',color: '#f87171' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
      padding: '4px 12px', borderRadius: 100,
      background: s.bg, color: s.color
    }}>
      {status}
    </span>
  );
}

export default function MyAccount() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders'); // 'orders' | 'bookings'
  const [orders, setOrders]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/auth'); return; }

    const fetchAll = async () => {
      try {
        const [ordersRes, bookingsRes] = await Promise.all([
          axios.get('/api/remedies/my-orders'),
          axios.get('/api/puja/my-bookings')
        ]);
        setOrders(ordersRes.data.orders || []);
        setBookings(bookingsRes.data.pujas || bookingsRes.data.bookings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your account data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading your account...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400,
          color: 'var(--text-primary)', marginBottom: 24
        }}>
          My <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Account</span>
        </h1>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, borderBottom: '1px solid var(--border-light)' }}>
          {['orders', 'bookings'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '10px 4px', marginRight: 20, background: 'none', border: 'none',
                borderBottom: tab === t ? '2px solid var(--gold-light)' : '2px solid transparent',
                color: tab === t ? 'var(--gold-light)' : 'var(--text-muted)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
              }}>
              {t === 'orders' ? `Orders (${orders.length})` : `Puja Bookings (${bookings.length})`}
            </button>
          ))}
        </div>

        {error && <div style={{ color: '#f87171', marginBottom: 20 }}>{error}</div>}

        {tab === 'orders' && (
          orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't ordered any remedies yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {orders.map(order => (
                <div key={order._id} style={{
                  background: 'var(--navy-card)', border: '1px solid var(--border-light)',
                  borderRadius: 16, padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>
                        {convert(order.amount)}
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {order.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
                  </div>
                  {order.shippingAddress && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
                      Shipping to: {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'bookings' && (
          bookings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>You haven't booked any puja yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {bookings.map(booking => (
                <div key={booking._id} style={{
                  background: 'var(--navy-card)', border: '1px solid var(--border-light)',
                  borderRadius: 16, padding: 20
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>
                        {PUJA_NAMES[booking.pujaType] || booking.pujaType}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
                        {booking.preferredDate
                          ? new Date(booking.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'No date scheduled yet'}
                      </div>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {convert(booking.amountINR || 0)} · Payment: <StatusBadge status={booking.paymentStatus} />
                  </div>
                  {booking.specialNotes && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8, fontStyle: 'italic' }}>
                      "{booking.specialNotes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}