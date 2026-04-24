import React, { useState } from 'react';
import { calcChart } from '../utils/astro';
import { generateCompatibilityReport } from '../utils/compatibility';
import { Heart, RefreshCw, User } from 'lucide-react';

const FACTOR_COLORS = { 8:'#4ade80', 7:'#4ade80', 6:'#86efac', 5:'#fbbf24', 4:'#fbbf24', 3:'#fb923c', 2:'#f87171', 1:'#f87171', 0:'#ef4444' };

export default function Compatibility({ chart1 }) {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const localISO = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [form, setForm] = useState({ name:'', date: localISO, lat:'28.61', lon:'77.20' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const calculate = (e) => {
    e.preventDefault();
    if (!chart1) { setError('Please calculate your birth chart first.'); return; }
    setLoading(true); setError(null);
    setTimeout(() => {
      try {
        const chart2 = calcChart(new Date(form.date), parseFloat(form.lat), parseFloat(form.lon));
        const report = generateCompatibilityReport(chart1, chart2, chart1.meta?.name || 'You', form.name || 'Partner');
        setResult(report);
      } catch (e) { setError(e.message); }
      setLoading(false);
    }, 100);
  };

  const inputCls = "w-full bg-white/[0.04] border border-purple-900/25 rounded-xl px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-gray-600 font-[Inter]";

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
        <Heart size={14} className="text-pink-400" />
        <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Kundli Matching</span>
        <span className="ml-auto text-xs text-gray-600">Ashtakoot compatibility</span>
      </div>

      <div className="p-5">
        {!chart1 && (
          <div className="text-sm text-amber-400/80 mb-4 p-3 rounded-xl" style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
            ⚠️ Calculate your birth chart first, then enter your partner's details below.
          </div>
        )}

        <form onSubmit={calculate} className="space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <User size={11}/> Partner's Details
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name</label>
            <input className={inputCls} placeholder="Partner's name" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Birth Date & Time</label>
            <input type="datetime-local" className={inputCls} value={form.date} onChange={set('date')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
              <input className={inputCls} placeholder="28.61" value={form.lat} onChange={set('lat')} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
              <input className={inputCls} placeholder="77.20" value={form.lon} onChange={set('lon')} required />
            </div>
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            style={{ background:'linear-gradient(135deg,#ec4899,#a855f7)', boxShadow:'0 4px 16px rgba(236,72,153,0.3)' }}>
            {loading ? <RefreshCw size={14} className="animate-spin"/> : <Heart size={14}/>}
            Calculate Compatibility
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-4">
            {/* Score ring */}
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background:'rgba(236,72,153,0.06)', border:'1px solid rgba(236,72,153,0.2)' }}>
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={result.percentage >= 70 ? '#4ade80' : result.percentage >= 50 ? '#fbbf24' : '#f87171'}
                    strokeWidth="3" strokeDasharray={`${result.percentage} 100`} strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white">{result.score}</span>
                  <span className="text-xs text-gray-500">/{result.total}</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-1">{result.person1.name} & {result.person2.name}</div>
                <div className="text-xs text-gray-400 mb-2">{result.verdict}</div>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>🌙 {result.person1.nakshatra}</span>
                  <span>🌙 {result.person2.nakshatra}</span>
                </div>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="space-y-2">
              {result.factors.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-400 flex-shrink-0">{f.name}</div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width:`${(f.points/f.max)*100}%`, background: FACTOR_COLORS[f.points] || '#a78bfa' }}/>
                  </div>
                  <div className="text-xs font-semibold w-8 text-right flex-shrink-0" style={{ color: FACTOR_COLORS[f.points] || '#a78bfa' }}>
                    {f.points}/{f.max}
                  </div>
                </div>
              ))}
            </div>

            {/* Descriptions */}
            <div className="space-y-1.5">
              {result.factors.map((f, i) => (
                <div key={i} className="text-xs text-gray-400 flex items-start gap-2">
                  <span className="font-medium text-gray-300 flex-shrink-0">{f.name}:</span>
                  {f.desc}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
