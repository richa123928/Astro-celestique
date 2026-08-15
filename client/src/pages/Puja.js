import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import usePayment from '../hooks/usePayment';
import useIsMobile from '../hooks/useIsMobile';


const PUJAS = [
  {
    key: 'grah_shanti',
    name: 'Grah Shanti Pooja',
    price: 5100,
    icon: '🪐',
    duration: '2-3 hours',
    desc: 'Pacify malefic planets affecting your birth chart. Performed to neutralise negative planetary influences causing obstacles in life.',
    benefits: ['Removes planetary obstacles', 'Improves career prospects', 'Brings mental peace', 'Neutralises bad dasha effects'],
    extraFields: [],
  },
  {
    key: 'death_shanti',
    name: 'Death Shanti Pooja',
    price: 7100,
    icon: '🕯️',
    duration: '3-4 hours',
    desc: 'Sacred rituals for ancestral peace and moksha. Performed for the peace of departed souls and to remove pitru dosha.',
    benefits: ['Ancestral blessings', 'Removes Pitru Dosha', 'Family harmony', 'Spiritual liberation for departed soul'],
    extraFields: ['deceased'],
  },
  {
    key: 'lakshmi_vriddhi',
    name: 'Lakshmi Vriddhi Pooja',
    price: 4100,
    icon: '💰',
    duration: '2 hours',
    desc: 'Invoke Goddess Lakshmi for abundance, wealth and financial prosperity. Ideal for new business or financial struggles.',
    benefits: ['Financial abundance', 'Business growth', 'Removes debt obstacles', 'Attracts new opportunities'],
    extraFields: [],
  },
  {
    key: 'love_relationship',
    name: 'Love / Relationship Pooja',
    price: 3100,
    icon: '❤️',
    duration: '2 hours',
    desc: 'Strengthen romantic bonds and resolve relationship issues through divine intervention and cosmic alignment.',
    benefits: ['Strengthens love bonds', 'Resolves conflicts', 'Attracts soulmate', 'Improves compatibility'],
    extraFields: ['partner'],
  },
  {
    key: 'new_home',
    name: 'New Home Pooja',
    price: 5100,
    icon: '🏡',
    duration: '2-3 hours',
    desc: 'Griha Pravesh blessings for your new home. Purify and energise your living space with divine protection.',
    benefits: ['Divine protection', 'Positive energy', 'Family harmony', 'Prosperity in new home'],
    extraFields: [],
  },
  {
    key: 'saraswati',
    name: 'Saraswati Pooja',
    price: 2100,
    icon: '📚',
    duration: '1-2 hours',
    desc: 'Invoke Goddess Saraswati for blessings in education, arts, wisdom and creative pursuits.',
    benefits: ['Academic success', 'Enhanced memory', 'Creative inspiration', 'Wisdom and clarity'],
    extraFields: [],
  },
  {
    key: 'marriage',
    name: 'Marriage Pooja',
    price: 7100,
    icon: '💍',
    duration: '4-5 hours',
    desc: 'Sacred Vivah Sanskar rituals for a blessed and harmonious marriage. Complete Vedic wedding ceremony blessings.',
    benefits: ['Divine blessings', 'Marital harmony', 'Removes marriage obstacles', 'Long lasting union'],
    extraFields: ['partner'],
  },
  {
    key: 'sarv_karya_samporan',
    name: 'Sarv Karya Samporan',
    price: 11000,
    icon: '✨',
    duration: '5-6 hours',
    desc: 'The most powerful all-purpose puja for complete wish fulfillment and removal of all life obstacles.',
    benefits: ['All wishes fulfilled', 'Complete obstacle removal', 'Success in all endeavors', 'Divine grace and protection'],
    extraFields: [],
  },
];

export default function Puja() {
  const { convert }         = useCurrency();
  const { initiatePayment } = usePayment();
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const [selected, setSelected] = useState(null);
  const [step,     setStep]     = useState(1); // 1=list, 2=form, 3=success
  const [loading,  setLoading]  = useState(false);
  const [form,     setForm]     = useState({
    name: '', dob: '', tob: '', timeNA: false, pob: '',
    partnerName: '', partnerDob: '', partnerPob: '',
    deceasedName: '', dateOfDeath: '', placeOfDeath: '',
    preferredDate: '', notes: ''
  });

  const isMobile = useIsMobile();

  const handleBook = (puja) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a puja');
      navigate('/auth');
      return;
    }
    setSelected(puja);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // First create the puja booking
      const { data } = await axios.post('/api/puja/book', {
        pujaType: selected.key,
        primaryPerson: {
          name:             form.name,
          dob:              form.dob,
          timeOfBirth:      form.timeNA ? null : form.tob,
          timeNotAvailable: form.timeNA,
          placeOfBirth:     form.pob
        },
        secondaryPerson: selected.extraFields.includes('partner') ? {
          name:         form.partnerName,
          dob:          form.partnerDob,
          placeOfBirth: form.partnerPob
        } : null,
        deceasedDetails: selected.extraFields.includes('deceased') ? {
          name:         form.deceasedName,
          dateOfDeath:  form.dateOfDeath,
          placeOfDeath: form.placeOfDeath
        } : null,
        preferredDate: form.preferredDate,
        specialNotes:  form.notes,
        amountINR:     selected.price,
      });

      // Then initiate payment
      await initiatePayment({
        amount:      selected.price,
        purpose:     'puja',
        pujaId:      data.puja._id,
        description: selected.name,
        onSuccess:   () => {
          setStep(3);
          window.scrollTo(0, 0);
        }
      });

    } catch (err) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // ── Success Screen ──────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy-deep)',
        paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🙏</div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 40,
            color: 'var(--text-primary)', marginBottom: 12
          }}>
            Booking Confirmed!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 8 }}>
            Your {selected.name} has been booked successfully.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
            Our team will contact you within 24 hours to confirm the details.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => { setStep(1); setSelected(null); }}>
              Book Another Puja
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Booking Form ────────────────────────────────────────────────────────────
  if (step === 2 && selected) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>
        <div className="container" style={{ padding: '48px 24px', maxWidth: 700 }}>

          {/* Back */}
          <button className="btn-ghost" style={{ marginBottom: 24 }}
            onClick={() => { setStep(1); setSelected(null); }}>
            ← Back to Pujas
          </button>

          {/* Puja Info */}
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: '28px',
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 20
          }}>
            <span style={{ fontSize: 48 }}>{selected.icon}</span>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: 28,
                color: 'var(--text-primary)', marginBottom: 4
              }}>
                {selected.name}
              </h2>
              <div style={{ display: 'flex', gap: 16, fontSize: 14, color: 'var(--text-muted)' }}>
                <span>⏱ {selected.duration}</span>
                <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
                  {convert(selected.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{
            background: 'var(--navy-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 20, padding: '36px'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Primary Person */}
              <Section title="Your Details">
                <Field label="Full Name *">
                  <Input placeholder="Name of person for whom puja is performed"
                    value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
                </Field>
                <Row>
                  <Field label="Date of Birth *">
                    <Input type="date" value={form.dob}
                      onChange={v => setForm(f => ({ ...f, dob: v }))} required />
                  </Field>
                  <Field label="Time of Birth">
                    <Input type="time" value={form.tob} disabled={form.timeNA}
                      onChange={v => setForm(f => ({ ...f, tob: v }))} />
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginTop: 8, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer'
                    }}>
                      <input type="checkbox" checked={form.timeNA}
                        onChange={e => setForm(f => ({ ...f, timeNA: e.target.checked, tob: '' }))} />
                      Time not available
                    </label>
                  </Field>
                </Row>
                <Field label="Place of Birth *">
                  <Input placeholder="City, State, Country"
                    value={form.pob} onChange={v => setForm(f => ({ ...f, pob: v }))} required />
                </Field>
              </Section>

              {/* Partner Details */}
              {selected.extraFields.includes('partner') && (
                <Section title="Partner's Details">
                  <Field label="Partner's Full Name *">
                    <Input placeholder="Partner's full name"
                      value={form.partnerName} onChange={v => setForm(f => ({ ...f, partnerName: v }))} required />
                  </Field>
                  <Row>
                    <Field label="Partner's Date of Birth *">
                      <Input type="date" value={form.partnerDob}
                        onChange={v => setForm(f => ({ ...f, partnerDob: v }))} required />
                    </Field>
                    <Field label="Partner's Place of Birth *">
                      <Input placeholder="City, Country"
                        value={form.partnerPob} onChange={v => setForm(f => ({ ...f, partnerPob: v }))} required />
                    </Field>
                  </Row>
                </Section>
              )}

              {/* Deceased Details */}
              {selected.extraFields.includes('deceased') && (
                <Section title="Deceased Person's Details">
                  <Field label="Name of Deceased *">
                    <Input placeholder="Full name"
                      value={form.deceasedName} onChange={v => setForm(f => ({ ...f, deceasedName: v }))} required />
                  </Field>
                  <Row>
                    <Field label="Date of Death *">
                      <Input type="date" value={form.dateOfDeath}
                        onChange={v => setForm(f => ({ ...f, dateOfDeath: v }))} required />
                    </Field>
                    <Field label="Place of Death">
                      <Input placeholder="City, Country"
                        value={form.placeOfDeath} onChange={v => setForm(f => ({ ...f, placeOfDeath: v }))} />
                    </Field>
                  </Row>
                </Section>
              )}

              {/* Scheduling */}
              <Section title="Scheduling">
                <Field label="Preferred Date">
                  <Input type="date" value={form.preferredDate}
                    onChange={v => setForm(f => ({ ...f, preferredDate: v }))} />
                </Field>
                <Field label="Special Notes / Intentions">
                  <textarea
                    placeholder="Any specific wishes, intentions or instructions..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{
                      ...inputStyle, height: 100, resize: 'vertical'
                    }}
                  />
                </Field>
              </Section>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '16px',
                background: loading ? 'var(--gold-dim)' : 'var(--gold)',
                color: 'var(--navy-deep)', border: 'none',
                borderRadius: 100, fontSize: 16, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}>
                {loading ? 'Booking...' : `Book ${selected.name} — ${convert(selected.price)}`}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
                🔒 Secure booking · Our team will contact you within 24 hours
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Puja List ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '60px 0 40px'
      }}>
        <div className="container">
          <span className="section-label">SACRED PUJA SERVICES</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Astrology services,<br />
            <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>
              performed with devotion.
            </em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 560 }}>
            Temple-trained pandits perform personalised pujas across Bharat.
            Each ceremony is recorded and a detailed report is sent to you.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20
        }}>
          {PUJAS.map(p => (
            <div key={p.key} style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 20, padding: '28px',
              display: 'flex', flexDirection: 'column', gap: 16,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span style={{ fontSize: 40 }}>{p.icon}</span>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)', fontSize: 22,
                    color: 'var(--text-primary)', marginBottom: 4
                  }}>
                    {p.name}
                  </h3>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>⏱ {p.duration}</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {p.desc}
              </p>

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 10 }}>✦</span>
                    <span style={{ color: 'var(--text-muted)' }}>{b}</span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', paddingTop: 16,
                borderTop: '1px solid var(--border-light)'
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 2 }}>
                    STARTING FROM
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--gold-light)' }}>
                    {convert(p.price)}
                  </div>
                </div>
                <button className="btn-primary" onClick={() => handleBook(p)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-light)',
  borderRadius: 10, fontSize: 14,
  color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'var(--font-sans)', display: 'block',
};

function Section({ title, children }) {
  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-serif)', fontSize: 22,
        color: 'var(--text-primary)', marginBottom: 20,
        paddingBottom: 12, borderBottom: '1px solid var(--border-light)'
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
      {children}
    </div>
  );
}

function Input({ onChange, ...props }) {
  return (
    <input
      {...props}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}