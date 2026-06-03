import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['ALL', 'RUDRAKSHA', 'YANTRAS', 'GEMSTONES', 'PUJA KITS', 'MALAS'];

const REMEDIES = [
  {
    id: 1, category: 'RUDRAKSHA',
    name: 'Siddha 5-Mukhi Rudraksha Mala',
    price: 4200, rating: 4.8, reviews: 234,
    icon: '📿',
    desc: 'Energised 5-mukhi Rudraksha mala for mental peace, health and spiritual growth. Blessed by temple priests.',
    benefits: ['Mental peace', 'Health improvement', 'Spiritual growth', 'Removes fear'],
    planet: 'Jupiter',
  },
  {
    id: 2, category: 'RUDRAKSHA',
    name: '1-Mukhi Rudraksha (Ek Mukhi)',
    price: 21000, rating: 4.9, reviews: 89,
    icon: '🔮',
    desc: 'The most powerful Rudraksha representing Lord Shiva. Extremely rare and powerful for moksha and liberation.',
    benefits: ['Moksha path', 'Supreme consciousness', 'Removes all sins', 'Divine blessing'],
    planet: 'Sun',
  },
  {
    id: 3, category: 'YANTRAS',
    name: 'Shree Yantra · Pure Copper',
    price: 2800, rating: 4.7, reviews: 456,
    icon: '🔱',
    desc: 'Energised Shree Yantra engraved on pure copper. Attracts prosperity, abundance and Lakshmi\'s blessings.',
    benefits: ['Wealth attraction', 'Business growth', 'Positive energy', 'Lakshmi blessings'],
    planet: 'Venus',
  },
  {
    id: 4, category: 'YANTRAS',
    name: 'Kuber Yantra · Gold Plated',
    price: 3500, rating: 4.6, reviews: 312,
    icon: '✨',
    desc: 'Gold plated Kuber Yantra for financial abundance and removal of poverty. Powerful wealth magnet.',
    benefits: ['Financial growth', 'Removes poverty', 'Business success', 'Debt removal'],
    planet: 'Mercury',
  },
  {
    id: 5, category: 'GEMSTONES',
    name: 'Certified Blue Sapphire (Neelam)',
    price: 38500, rating: 4.9, reviews: 167,
    icon: '💎',
    desc: 'Lab certified natural Blue Sapphire for Saturn. Brings discipline, career success and removes Sade Sati effects.',
    benefits: ['Career success', 'Discipline', 'Saturn remedy', 'Financial stability'],
    planet: 'Saturn',
  },
  {
    id: 6, category: 'GEMSTONES',
    name: 'Natural Ruby (Manik)',
    price: 15000, rating: 4.8, reviews: 203,
    icon: '❤️',
    desc: 'Natural certified Ruby for Sun. Enhances leadership, confidence, health and government relations.',
    benefits: ['Leadership', 'Health boost', 'Sun strengthening', 'Confidence'],
    planet: 'Sun',
  },
  {
    id: 7, category: 'GEMSTONES',
    name: 'Yellow Sapphire (Pukhraj)',
    price: 12000, rating: 4.8, reviews: 289,
    icon: '💛',
    desc: 'Natural Yellow Sapphire for Jupiter. Brings wisdom, wealth, marriage prospects and spiritual growth.',
    benefits: ['Wisdom', 'Marriage prospects', 'Jupiter remedy', 'Wealth'],
    planet: 'Jupiter',
  },
  {
    id: 8, category: 'PUJA KITS',
    name: 'Rahu Shanti Puja Kit',
    price: 6500, rating: 4.7, reviews: 178,
    icon: '🪔',
    desc: 'Complete kit for Rahu Shanti puja including all materials, instructions and energised items.',
    benefits: ['Rahu pacification', 'Removes confusion', 'Career clarity', 'Mental peace'],
    planet: 'Rahu',
  },
  {
    id: 9, category: 'PUJA KITS',
    name: 'Navgraha Puja Kit',
    price: 8500, rating: 4.8, reviews: 234,
    icon: '🌟',
    desc: 'Complete Navgraha puja kit for all 9 planets. Balances all planetary energies in your chart.',
    benefits: ['All planet balance', 'Complete harmony', 'Life obstacles removed', 'Divine blessings'],
    planet: 'All 9 Planets',
  },
  {
    id: 10, category: 'MALAS',
    name: 'Tulsi Mala 108 Beads',
    price: 850, rating: 4.9, reviews: 567,
    icon: '🌿',
    desc: 'Sacred Tulsi mala for Vishnu devotees. Purifies the wearer and attracts divine blessings.',
    benefits: ['Purification', 'Vishnu blessings', 'Spiritual practice', 'Protection'],
    planet: 'Mercury',
  },
  {
    id: 11, category: 'MALAS',
    name: 'Sphatik (Crystal) Mala',
    price: 1200, rating: 4.7, reviews: 345,
    icon: '🔮',
    desc: 'Pure crystal Sphatik mala for chanting. Amplifies spiritual energy and mantra power.',
    benefits: ['Mantra amplification', 'Clarity of mind', 'Spiritual energy', 'Peace'],
    planet: 'Moon',
  },
  {
    id: 12, category: 'RUDRAKSHA',
    name: 'Gauri Shankar Rudraksha',
    price: 7500, rating: 4.8, reviews: 123,
    icon: '🕉️',
    desc: 'Two naturally joined Rudraksha beads representing Shiva-Parvati union. Best for marriage and relationships.',
    benefits: ['Marriage harmony', 'Relationship healing', 'Shiva-Parvati blessings', 'Family peace'],
    planet: 'Moon',
  },
];

export default function Remedies() {
  const { convert }                         = useCurrency();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedItem,   setSelectedItem]   = useState(null);
  const [cart,           setCart]           = useState([]);

  const filtered = activeCategory === 'ALL'
    ? REMEDIES
    : REMEDIES.filter(r => r.category === activeCategory);

  const addToCart = (item) => {
    setCart(c => {
      const existing = c.find(i => i.id === item.id);
      if (existing) {
        toast.success('Already in cart!');
        return c;
      }
      toast.success(`${item.name} added to cart!`);
      return [...c, { ...item, qty: 1 }];
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-deep)', paddingTop: 80 }}>

      {/* Header */}
      <div style={{
        background: 'var(--navy-dark)',
        borderBottom: '1px solid var(--border-light)',
        padding: '60px 0 40px'
      }}>
        <div className="container">
          <span className="section-label">REMEDIES & SACRED RITUALS</span>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 4vw, 60px)',
            fontWeight: 400, color: 'var(--text-primary)',
            marginBottom: 16, lineHeight: 1.1
          }}>
            Spiritual <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Correctives</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            Authentic gemstones, energised yantras, Rudraksha and puja kits —
            sourced through lineage and blessed by temple priests.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px', borderRadius: 100,
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--gold)' : 'var(--border-light)',
                background: activeCategory === cat ? 'var(--gold)' : 'transparent',
                color: activeCategory === cat ? 'var(--navy-deep)' : 'var(--text-muted)',
                fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.06em'
              }}>
              {cat}
            </button>
          ))}

          {/* Cart */}
          {cart.length > 0 && (
            <button
              onClick={() => toast.success(`${cart.length} items in cart. Payment integration coming soon!`)}
              style={{
                marginLeft: 'auto', padding: '8px 20px', borderRadius: 100,
                background: 'var(--gold)', border: 'none',
                color: 'var(--navy-deep)', fontFamily: 'var(--font-sans)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}>
              🛒 Cart ({cart.length})
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20
        }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: 'var(--navy-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 20, overflow: 'hidden',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Image */}
              <div style={{
                width: '100%', height: 180,
                background: 'linear-gradient(135deg, var(--navy-light) 0%, var(--navy-mid) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 72, position: 'relative'
              }}>
                {item.icon}
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(201,150,60,0.15)',
                  border: '1px solid var(--border)',
                  borderRadius: 100, padding: '3px 10px',
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.08em', color: 'var(--gold)'
                }}>
                  {item.category}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)', fontSize: 18,
                    color: 'var(--text-primary)', lineHeight: 1.3, flex: 1
                  }}>
                    {item.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--gold)', fontSize: 12 }}>
                    {'★'.repeat(Math.floor(item.rating))}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.rating} ({item.reviews} reviews)
                  </span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.benefits.slice(0, 2).map((b, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '3px 10px',
                      background: 'rgba(201,150,60,0.08)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 100, color: 'var(--text-muted)'
                    }}>
                      ✦ {b}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  🪐 Planet: <span style={{ color: 'var(--gold)' }}>{item.planet}</span>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginTop: 'auto',
                  paddingTop: 12, borderTop: '1px solid var(--border-light)'
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 2 }}>PRICE</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--gold-light)' }}>
                      {convert(item.price)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setSelectedItem(item)}
                      style={{
                        padding: '8px 14px', borderRadius: 100,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-light)',
                        color: 'var(--text-muted)', fontSize: 12,
                        cursor: 'pointer', fontFamily: 'var(--font-sans)'
                      }}>
                      Details
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                      className="btn-primary"
                      style={{ fontSize: 12, padding: '8px 16px' }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedItem && (
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
            width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{
                background: 'rgba(201,150,60,0.15)',
                border: '1px solid var(--border)',
                borderRadius: 100, padding: '4px 12px',
                fontSize: 11, color: 'var(--gold)', fontWeight: 600
              }}>
                {selectedItem.category}
              </span>
              <button onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: 72, marginBottom: 20 }}>
              {selectedItem.icon}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: 28,
              color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center'
            }}>
              {selectedItem.name}
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', fontSize: 14 }}>
                {'★'.repeat(Math.floor(selectedItem.rating))}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {selectedItem.rating} · {selectedItem.reviews} reviews
              </span>
            </div>

            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24, textAlign: 'center' }}>
              {selectedItem.desc}
            </p>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>
                BENEFITS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedItem.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <span style={{ color: 'var(--gold)', fontSize: 10 }}>✦</span>
                    <span style={{ color: 'var(--text-muted)' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'rgba(201,150,60,0.05)',
              border: '1px solid var(--border-light)',
              borderRadius: 12, padding: '16px',
              marginBottom: 24,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>ASSOCIATED PLANET</div>
                <div style={{ fontSize: 15, color: 'var(--gold-light)', fontWeight: 600 }}>🪐 {selectedItem.planet}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>PRICE</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold-light)' }}>
                  {convert(selectedItem.price)}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
              onClick={() => { addToCart(selectedItem); setSelectedItem(null); }}>
              Add to Cart — {convert(selectedItem.price)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}