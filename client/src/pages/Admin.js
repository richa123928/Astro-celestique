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

const EXPERTISE_OPTIONS = [
  'Vedic', 'KP System', 'Tarot', 'Numerology',
  'Vastu', 'Nadi', 'Prashna', 'Lal Kitab',
  'Palmistry', 'Love & Marriage', 'Career', 'Finance'
];

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Spanish', 'French', 'Arabic', 'Portuguese'];

const EMPTY_ASTROLOGER_FORM = {
  name: '', email: '', password: '', displayName: '', bio: '',
  expertise: [], languages: ['Hindi'], experience: '', pricePerMin: '', avatar: ''
};

export default function Admin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab,  setActiveTab]  = useState('bookings');
  const [bookings,   setBookings]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [astrologers, setAstrologers] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [showAstrologerForm, setShowAstrologerForm] = useState(false);
  const [astrologerForm, setAstrologerForm] = useState(EMPTY_ASTROLOGER_FORM);
  const [creatingAstrologer, setCreatingAstrologer] = useState(false);
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
      const [bookingsRes, usersRes, astrologersRes] = await Promise.all([
        axios.get('/api/admin/bookings'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/astrologers'),
      ]);
      setBookings(bookingsRes.data.bookings);
      setUsers(usersRes.data.users);
      setAstrologers(astrologersRes.data.astrologers);
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

  const toggleExpertise = (val) => {
    setAstrologerForm(f => ({
      ...f,
      expertise: f.expertise.includes(val)
        ? f.expertise.filter(e => e !== val)
        : [...f.expertise, val]
    }));
  };

  const toggleLanguage = (val) => {
    setAstrologerForm(f => ({
      ...f,
      languages: f.languages.includes(val)
        ? f.languages.filter(l => l !== val)
        : [...f.languages, val]
    }));
  };

  const handleCreateAstrologer = async (e) => {
    e.preventDefault();
    setCreatingAstrologer(true);
    try {
      await axios.post('/api/admin/astrologers', {
        ...astrologerForm,
        experience: Number(astrologerForm.experience),
        pricePerMin: Number(astrologerForm.pricePerMin),
      });
      toast.success('Astrologer account created!');
      setShowAstrologerForm(false);
      setAstrologerForm(EMPTY_ASTROLOGER_FORM);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create astrologer');
    } finally {
      setCreatingAstrologer(false);
    }
  };

  const toggleAstrologerActive = async (astrologer) => {
    try {
      if (astrologer.isActive) {
        await axios.delete(`/api/admin/astrologers/${astrologer._id}`);
        toast.success('Astrologer deactivated');
      } else {
        await axios.put(`/api/admin/astrologers/${astrologer._id}`, { isActive: true });
        toast.success('Astrologer reactivated');
      }
      fetchData();
    } catch (err) {
      toast.error('Failed to update astrologer');
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['bookings', 'users', 'astrologers'].map(tab => (
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
                  : tab === 'users'
                  ? `👥 Users (${stats.totalUsers})`
                  : `🔮 Astrologers (${astrologers.length})`}
              </button>
            ))}
          </div>
          {activeTab === 'astrologers' && (
            <button className="btn-primary" onClick={() => setShowAstrologerForm(true)}>
              + Add Astrologer
            </button>
          )}
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
                    {u.role === 'astrologer' && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, padding: '2px 8px',
                        background: 'rgba(99,102,241,0.2)', color: '#818cf8',
                        borderRadius: 100
                      }}>ASTROLOGER</span>
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

        {/* Astrologers Tab */}
        {activeTab === 'astrologers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {astrologers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                No astrologers yet — click "+ Add Astrologer" to create one
              </div>
            ) : astrologers.map(a => (
              <div key={a._id} style={{
                background: 'var(--navy-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0, overflow: 'hidden'
                }}>
                  {a.avatar ? <img src={a.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🔮'}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {a.displayName}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {a.user?.email} · {a.experience} yrs · {a.expertise?.join(', ') || 'No expertise set'}
                  </div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--gold-light)', fontWeight: 600, flexShrink: 0 }}>
                  ₹{a.pricePerMin}/min
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                  ⭐ {a.rating?.toFixed(1) || '0.0'} · {a.totalSessions || 0} sessions
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 100,
                  background: a.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: a.isActive ? '#4ade80' : '#f87171',
                  fontSize: 11, fontWeight: 600, flexShrink: 0
                }}>
                  {a.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
                <button onClick={() => toggleAstrologerActive(a)}
                  style={{
                    padding: '8px 16px', borderRadius: 100,
                    background: a.isActive ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    border: '1px solid', borderColor: a.isActive ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
                    color: a.isActive ? '#f87171' : '#4ade80', fontSize: 12,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0
                  }}>
                  {a.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
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

      {/* Create Astrologer Modal */}
      {showAstrologerForm && (
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
                Add New Astrologer
              </h3>
              <button onClick={() => { setShowAstrologerForm(false); setAstrologerForm(EMPTY_ASTROLOGER_FORM); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAstrologer} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Full Name *</label>
                <input required value={astrologerForm.name}
                  onChange={e => setAstrologerForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Rajesh Sharma" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Login Email *</label>
                  <input required type="email" value={astrologerForm.email}
                    onChange={e => setAstrologerForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle} placeholder="astrologer@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Login Password *</label>
                  <input required type="text" value={astrologerForm.password}
                    onChange={e => setAstrologerForm(f => ({ ...f, password: e.target.value }))}
                    style={inputStyle} placeholder="Min. 6 characters" minLength={6} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Display Name *</label>
                <input required value={astrologerForm.displayName}
                  onChange={e => setAstrologerForm(f => ({ ...f, displayName: e.target.value }))}
                  style={inputStyle} placeholder="e.g. Astrologer Rajesh Ji" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Bio</label>
                <textarea value={astrologerForm.bio}
                  onChange={e => setAstrologerForm(f => ({ ...f, bio: e.target.value }))}
                  style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                  placeholder="Short description shown to customers" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Experience (years) *</label>
                  <input required type="number" min="0" value={astrologerForm.experience}
                    onChange={e => setAstrologerForm(f => ({ ...f, experience: e.target.value }))}
                    style={inputStyle} placeholder="e.g. 12" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Price (₹/min) *</label>
                  <input required type="number" min="1" value={astrologerForm.pricePerMin}
                    onChange={e => setAstrologerForm(f => ({ ...f, pricePerMin: e.target.value }))}
                    style={inputStyle} placeholder="e.g. 30" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Expertise</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EXPERTISE_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => toggleExpertise(opt)}
                      style={{
                        padding: '6px 14px', borderRadius: 100, fontSize: 12,
                        border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        borderColor: astrologerForm.expertise.includes(opt) ? 'var(--gold)' : 'var(--border-light)',
                        background: astrologerForm.expertise.includes(opt) ? 'rgba(201,150,60,0.15)' : 'transparent',
                        color: astrologerForm.expertise.includes(opt) ? 'var(--gold-light)' : 'var(--text-muted)',
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {LANGUAGE_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => toggleLanguage(opt)}
                      style={{
                        padding: '6px 14px', borderRadius: 100, fontSize: 12,
                        border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                        borderColor: astrologerForm.languages.includes(opt) ? 'var(--gold)' : 'var(--border-light)',
                        background: astrologerForm.languages.includes(opt) ? 'rgba(201,150,60,0.15)' : 'transparent',
                        color: astrologerForm.languages.includes(opt) ? 'var(--gold-light)' : 'var(--text-muted)',
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={creatingAstrologer}
                style={{ width: '100%', justifyContent: 'center', padding: 14, marginTop: 8 }}>
                {creatingAstrologer ? 'Creating...' : 'Create Astrologer Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 16px', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-light)',
  borderRadius: 10, fontSize: 14,
  color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)',
};