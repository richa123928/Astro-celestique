import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  pending:   { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  confirmed: { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  completed: { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
};

export default function Admin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab,  setActiveTab]  = useState('bookings');
  const [bookings,   setBookings]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [stats,      setStats]      = useState({
    totalBookings: 0, pendingBookings: 0,
    totalUsers: 0, totalRevenue: 0
  });

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // Not logged in
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    // Logged in but not admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }

    // Is admin — fetch data
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, usersRes] = await Promise.all([
        axios.get('/api/admin/bookings'),
        axios.get('/api/admin/users'),
      ]);
      setBookings(bookingsRes.data.bookings);
      setUsers(usersRes.data.users);
      setStats({
        totalBookings:   bookingsRes.data.bookings.length,
        pendingBookings: bookingsRes.data.bookings.filter(b => b.status === 'pending').length,
        totalUsers:      usersRes.data.users.length,
        totalRevenue:    bookingsRes.data.bookings.reduce((sum, b) => sum + (b.amountINR || 0), 0),
      });
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/admin/bookings/${bookingId}`, { status });
      toast.success('Status updated!');
      fetchData();
      setSelected(null);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Show loader while auth is loading
  if (authLoading || loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--navy-deep)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid var(--border-light)',
          borderTop: '2px solid var(--gold)',
          animation: 'rotate 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '32px 0'
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="section-label">ADMIN PANEL</span>
              <h1 style={{
                fontFamily: 'var(--font-serif)', fontSize: 36,
                color: 'var(--text-primary)', marginTop: 4
              }}>
                Astro Celestique Dashboard
              </h1>
            </div>
            <button className="btn-secondary" onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, marginBottom: 32
        }}>
          {[
            { label: 'Total Bookings',  value: stats.totalBookings,  icon: '📋', color: '#e8b460' },
            { label: 'Pending',         value: stats.pendingBookings, icon: '⏳', color: '#fbbf24' },
            { label: 'Total Users',     value: stats.totalUsers,      icon: '👥', color: '#4ade80' },
            { label: 'Total Revenue',   value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: '#818cf8' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 16, padding: '24px',
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['bookings', 'users'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px', borderRadius: 100,
                border: '1px solid',
                borderColor: activeTab === tab ? 'var(--gold)' : 'var(--border-light)',
                background: activeTab === tab ? 'rgba(201,150,60,0.15)' : 'transparent',
                color: activeTab === tab ? 'var(--gold-light)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s'
              }}>
              {tab === 'bookings'
                ? `📋 Puja Bookings (${stats.totalBookings})`
                : `👥 Users (${stats.totalUsers})`}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                No bookings yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.map(booking => (
                  <div key={booking._id} style={{
                    background: 'var(--navy-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 16, padding: '20px 24px',
                    display: 'flex', alignItems: 'center',
                    gap: 20, flexWrap: 'wrap'
                  }}>
                    <div style={{
                      padding: '4px 12px', borderRadius: 100,
                      background: STATUS_COLORS[booking.status]?.bg,
                      color: STATUS_COLORS[booking.status]?.color,
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                      flexShrink: 0
                    }}>
                      {booking.status?.toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {PUJA_NAMES[booking.pujaType]}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {booking.primaryPerson?.name} · {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 180 }}>
                      {booking.user?.email || 'N/A'}
                    </div>

                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gold-light)', flexShrink: 0 }}>
                      ₹{booking.amountINR?.toLocaleString('en-IN')}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => setSelected(booking)}
                        style={{
                          padding: '8px 16px', borderRadius: 100,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-muted)', fontSize: 12,
                          cursor: 'pointer', fontFamily: 'var(--font-sans)'
                        }}>
                        View Details
                      </button>
                      {booking.status === 'pending' && (
                        <button onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          style={{
                            padding: '8px 16px', borderRadius: 100,
                            background: 'rgba(34,197,94,0.15)',
                            border: '1px solid rgba(34,197,94,0.3)',
                            color: '#4ade80', fontSize: 12,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)'
                          }}>
                          ✓ Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button onClick={() => updateBookingStatus(booking._id, 'completed')}
                          style={{
                            padding: '8px 16px', borderRadius: 100,
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            color: '#818cf8', fontSize: 12,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)'
                          }}>
                          ✓ Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {users.map(u => (
              <div key={u._id} style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 20
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(201,150,60,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0
                }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {u.name}
                    {u.role === 'admin' && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, padding: '2px 8px',
                        background: 'rgba(201,150,60,0.2)', color: 'var(--gold)',
                        borderRadius: 100
                      }}>ADMIN</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Joined: {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gold-light)', fontWeight: 600 }}>
                  💰 ₹{u.walletBalance}
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 100,
                  background: u.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: u.isActive ? '#4ade80' : '#f87171',
                  fontSize: 11, fontWeight: 600
                }}>
                  {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: 24
        }}>
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border)',
            borderRadius: 24, padding: '40px',
            width: '100%', maxWidth: 560,
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--text-primary)' }}>
                Booking Details
              </h3>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {[
              { label: 'Puja Type',     value: PUJA_NAMES[selected.pujaType] },
              { label: 'Status',        value: selected.status },
              { label: 'Amount',        value: `₹${selected.amountINR?.toLocaleString('en-IN')}` },
              { label: 'Booked On',     value: new Date(selected.createdAt).toLocaleDateString('en-IN') },
              { label: 'Preferred Date',value: selected.preferredDate ? new Date(selected.preferredDate).toDateString() : 'Flexible' },
              { label: '---',           value: '' },
              { label: 'Person Name',   value: selected.primaryPerson?.name },
              { label: 'Date of Birth', value: selected.primaryPerson?.dob ? new Date(selected.primaryPerson.dob).toDateString() : 'N/A' },
              { label: 'Time of Birth', value: selected.primaryPerson?.timeNotAvailable ? 'Not Available' : selected.primaryPerson?.timeOfBirth || 'N/A' },
              { label: 'Place of Birth',value: selected.primaryPerson?.placeOfBirth },
              { label: 'Special Notes', value: selected.specialNotes || 'None' },
            ].map((item, i) => (
              item.label === '---' ? (
                <div key={i} style={{ borderTop: '1px solid var(--border-light)', margin: '12px 0' }} />
              ) : (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border-light)',
                  fontSize: 14
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>
                    {item.value}
                  </span>
                </div>
              )
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {selected.status === 'pending' && (
                <button className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => updateBookingStatus(selected._id, 'confirmed')}>
                  ✓ Confirm Booking
                </button>
              )}
              {selected.status === 'confirmed' && (
                <button className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => updateBookingStatus(selected._id, 'completed')}>
                  ✓ Mark Complete
                </button>
              )}
              <button className="btn-secondary"
                onClick={() => updateBookingStatus(selected._id, 'cancelled')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}