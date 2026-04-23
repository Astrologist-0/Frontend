import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Clock, RefreshCw, AlertCircle, Search, Loader } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch';

export default function ChartForm({ onSubmit, loading }) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const localISO = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [form, setForm] = useState({
    name: '', date: localISO,
    lat: '37.56', lon: '-122.01', location: 'Fremont, California',
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);
  const { suggestions, loading: searching, error: searchError, search, clear } = useLocationSearch();

  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, location: val }));
    search(val);
    if (val.length >= 3) setShowDropdown(true);
  };

  const handleSelect = (result) => {
    setForm(f => ({ ...f, location: result.address, lat: result.lat.toFixed(6), lon: result.lon.toFixed(6) }));
    setShowDropdown(false); clear();
  };

  const handleGeo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setForm(f => ({ ...f, lat: pos.coords.latitude.toFixed(6), lon: pos.coords.longitude.toFixed(6), location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ date: new Date(form.date), lat: parseFloat(form.lat), lon: parseFloat(form.lon), name: form.name, location: form.location });
  };

  const labelCls = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Name */}
      <div>
        <label className={labelCls}>Name</label>
        <input className="input-field" placeholder="Enter name…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>

      {/* Date & Time */}
      <div>
        <label className={labelCls}><Clock size={10} className="inline mr-1" />Date & Time</label>
        <input type="datetime-local" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
      </div>

      {/* Location */}
      <div ref={wrapperRef} className="relative">
        <label className={labelCls}>
          <MapPin size={10} className="inline mr-1" />Location
          {!searchError && <span className="ml-2 text-green-500/50 normal-case tracking-normal">Google Maps</span>}
        </label>
        <div className="relative">
          <input
            className="input-field pr-9"
            placeholder="Search city or address…"
            value={form.location}
            onChange={handleLocationChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
            {searching ? <Loader size={13} className="animate-spin" /> : <Search size={13} />}
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden shadow-2xl" style={{ background: '#0f0f1f', border: '1px solid rgba(139,92,246,0.3)' }}>
            {suggestions.map(r => (
              <div key={r.id} onClick={() => handleSelect(r)} className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors border-b border-white/5 last:border-0" style={{ ':hover': { background: 'rgba(139,92,246,0.1)' } }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <MapPin size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-gray-100 truncate">{r.address}</div>
                  <div className="text-xs text-gray-500">{r.lat.toFixed(4)}, {r.lon.toFixed(4)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchError === 'no-key' && (
          <p className="mt-1.5 text-xs text-amber-400/70 flex items-center gap-1">
            <AlertCircle size={10} /> Set VITE_GOOGLE_MAPS_API_KEY in .env
          </p>
        )}
      </div>

      {/* Lat / Lon */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Latitude</label>
          <input className="input-field" placeholder="37.56" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} required />
        </div>
        <div>
          <label className={labelCls}>Longitude</label>
          <input className="input-field" placeholder="-122.01" value={form.lon} onChange={e => setForm(f => ({ ...f, lon: e.target.value }))} required />
        </div>
      </div>

      {/* Use My Location */}
      <button type="button" onClick={handleGeo} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-purple-400 transition-all" style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <MapPin size={12} /> Use My Location
      </button>

      {/* Submit */}
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}>
        {loading && <RefreshCw size={14} className="animate-spin" />}
        Calculate Chart
      </button>
    </form>
  );
}
