import React, { useState, useRef, useEffect } from 'react';
import API from '../services/api';

export default function PlaceAutocomplete({
  value, onChange, onSelect, placeholder = 'City, State, Country', inputStyle
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (text) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/places/search', { params: { q: text } });
        setSuggestions(data.results || []);
        setOpen(true);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleSelect = (place) => {
    onChange(place.displayName);
    setOpen(false);
    setSuggestions([]);
    if (onSelect) onSelect(place);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text" required placeholder={placeholder} value={value}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        style={inputStyle} autoComplete="off"
      />
      {loading && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-muted)' }}>
          searching…
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
          background: 'var(--navy-card)', border: '1px solid var(--border-light)',
          borderRadius: 12, overflow: 'hidden', zIndex: 20, maxHeight: 260, overflowY: 'auto'
        }}>
          {suggestions.map((place, i) => (
            <div
              key={i}
              onClick={() => handleSelect(place)}
              style={{
                padding: '12px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,150,60,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {place.displayName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}