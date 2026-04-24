import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, RefreshCw, Search, Loader } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch';

export default function ChartForm({ onSubmit, loading }) {

  const [form, setForm] = useState({
    name: '',
    date: '',
    lat: '',
    lon: '',
    location: '',
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const { suggestions, loading: searching, search, clear } = useLocationSearch();

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, location: val, lat: '', lon: '' }));
    search(val);
    if (val.length >= 3) setShowDropdown(true);
  };

  const handleSelect = (result) => {
    setForm(f => ({ ...f, location: result.address, lat: result.lat.toFixed(6), lon: result.lon.toFixed(6) }));
    setShowDropdown(false);
    clear();
  };

  const handleGeo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({
        ...f,
        lat: pos.coords.latitude.toFixed(6),
        lon: pos.coords.longitude.toFixed(6),
        location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
      }));
    }, () => alert('Could not get location. Please search manually.'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.lat || !form.lon) {
      alert('Please select a place from the search suggestions to get accurate coordinates.');
      return;
    }
    onSubmit({
      date: new Date(form.date),
      lat: parseFloat(form.lat),
      lon: parseFloat(form.lon),
      name: form.name,
      location: form.location,
    });
  };

  const lbl = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Name */}
      <div>
        <label className={lbl}>Your Name</label>
        <input
          className="input-field"
          placeholder="Enter your full name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Date & Time */}
      <div>
        <label className={lbl}><Clock size={10} className="inline mr-1" />Date & Time of Birth</label>
        <input
          type="datetime-local"
          className="input-field"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          required
        />
      </div>

      {/* Place of Birth */}
      <div ref={wrapperRef} className="relative">
        <label className={lbl}><MapPin size={10} className="inline mr-1" />Place of Birth</label>
        <div className="relative">
          <input
            className="input-field pr-9"
            placeholder="Search your birth city or town…"
            value={form.location}
            onChange={handleLocationChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
            {searching ? <Loader size={13} className="animate-spin" /> : <Search size={13} />}
          </div>
        </div>

        {/* Dropdown suggestions */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: '#0f0f1f', border: '1px solid rgba(139,92,246,0.3)' }}>
            {suggestions.map(r => (
              <div
                key={r.id}
                onClick={() => handleSelect(r)}
                className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <MapPin size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-100 truncate">{r.address}</div>
              </div>
            ))}
          </div>
        )}

        {/* Coordinates confirmed */}
        {form.lat && form.lon && (
          <div className="mt-1.5 text-xs text-green-500/60 flex items-center gap-1">
            ✓ Location confirmed
          </div>
        )}
      </div>

      {/* Use My Location */}
      <button
        type="button"
        onClick={handleGeo}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-purple-400 transition-all"
        style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}
      >
        <MapPin size={12} /> Use My Current Location
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
      >
        {loading && <RefreshCw size={14} className="animate-spin" />}
        Calculate Chart
      </button>
    </form>
  );
}
