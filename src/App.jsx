import React, { useState, useEffect, useCallback } from 'react';
import { calcChart }    from './utils/astro';
import BirthChart       from './components/BirthChart';
import Panchanga        from './components/Panchanga';
import GrahaTable       from './components/GrahaTable';
import ChartForm        from './components/ChartForm';
import Predictions      from './components/Predictions';
import DashaView        from './components/DashaView';
import YogaView         from './components/YogaView';
import Remedies         from './components/Remedies';
import Forecast         from './components/Forecast';
import ChartBot         from './components/ChartBot';
import Compatibility    from './components/Compatibility';
import { useChartStorage } from './hooks/useChartStorage';
import { Star, RefreshCw, AlertTriangle, Sparkles, CheckCircle, SlidersHorizontal, X } from 'lucide-react';

const DEFAULT = { date: new Date(), lat: 37.56, lon: -122.01, name: '', location: 'Fremont, California' };

const TABS = [
  { id: 'chart',         label: 'Chart',       short: '✦' },
  { id: 'panchanga',     label: 'Pañcāṅga',    short: '📅' },
  { id: 'graha',         label: 'Graha',        short: '🪐' },
  { id: 'dasha',         label: 'Daśā',         short: '⏳' },
  { id: 'yogas',         label: 'Yogas',        short: '🔮' },
  { id: 'forecast',      label: 'Forecast',     short: '🌤' },
  { id: 'predictions',   label: 'Predictions',  short: '🌟' },
  { id: 'compatibility', label: 'Match',        short: '❤️' },
  { id: 'remedies',      label: 'Remedies',     short: '💎' },
  { id: 'bot',           label: 'Ask Jyotiṣa',  short: '🤖' },
];

export default function App() {
  const [input,      setInput]      = useState(DEFAULT);
  const [chartData,  setChartData]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState('chart');
  const [now,        setNow]        = useState(new Date());
  const [justSaved,  setJustSaved]  = useState(false);
  const [showForm,   setShowForm]   = useState(false); // mobile form toggle

  const { saveChart, saving, saveError } = useChartStorage();

  const compute = useCallback((inp) => {
    setLoading(true); setError(null);
    setTimeout(async () => {
      try {
        const data = { ...calcChart(inp.date, inp.lat, inp.lon), meta: inp };
        setChartData(data);
        try {
          await saveChart(data, inp);
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 3000);
        } catch (e) { console.error('Auto-save:', e.message); }
      } catch (e) { setError(e.message || 'Calculation failed'); }
      setLoading(false);
    }, 80);
  }, [saveChart]);

  useEffect(() => { compute(DEFAULT); }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (inp) => { setInput(inp); compute(inp); setShowForm(false); };
  const handleNow    = () => { const n = { ...input, date: new Date() }; setInput(n); compute(n); };

  return (
    <div className="min-h-screen relative"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 10% -10%, #1a0a2e 0%, #07070f 55%)' }}>

      {/* Ambient orbs */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle,#7c3aed,transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(7,7,15,0.9)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
              <Star size={14} className="text-white" fill="white" />
            </div>
            <div className="leading-none">
              <div className="font-cinzel font-semibold text-white text-sm tracking-wide">Astrologist</div>
              <div className="text-[10px] text-purple-400/50 tracking-wider hidden sm:block">Vedic Astrology</div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <div className="text-[11px] text-gray-500">{now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
              <div className="text-xs font-mono text-purple-400 tabular-nums">{now.toLocaleTimeString()}</div>
            </div>
            <button onClick={handleNow}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-300"
              style={{ background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.24)' }}>
              <RefreshCw size={11}/> <span className="hidden sm:inline">Now</span>
            </button>
            {justSaved && (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac' }}>
                <CheckCircle size={11}/> Saved
              </span>
            )}
            {/* Mobile: toggle form */}
            <button onClick={() => setShowForm(v => !v)}
              className="xl:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
              {showForm ? <X size={13}/> : <SlidersHorizontal size={13}/>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile form drawer ── */}
      {showForm && (
        <div className="xl:hidden border-b border-white/[0.06] px-4 py-4"
          style={{ background:'rgba(7,7,15,0.97)' }}>
          <ChartForm onSubmit={handleSubmit} loading={loading} />
          {chartData && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              <span>Lagna: <b className="text-purple-300">{chartData.RASHIS?.[chartData.lagnaSign]}</b></span>
              <span>Nakṣatra: <b className="text-purple-300">{chartData.panchanga?.nakshatra?.name}</b></span>
              <span className="font-mono text-purple-400/60">{chartData.ayanamsa?.toFixed(3)}° Lahiri</span>
            </div>
          )}
        </div>
      )}

      {/* ── Main layout ── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col xl:flex-row gap-5 xl:gap-6 items-start">

          {/* ── Left panel (desktop only) ── */}
          <div className="hidden xl:block w-[340px] flex-shrink-0 space-y-4">
            <div className="glass-dark glow-purple p-5">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={13} className="text-purple-400" />
                <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Chart Details</span>
              </div>
              <ChartForm onSubmit={handleSubmit} loading={loading} />
            </div>

            {chartData && (
              <div className="glass-dark p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Chart Info</span>
                  <span className="text-[10px] font-mono text-purple-400/70">{chartData.ayanamsa?.toFixed(3)}° Lahiri</span>
                </div>
                {chartData.meta?.name && <div className="text-sm font-semibold text-white">{chartData.meta.name}</div>}
                {chartData.meta?.location && <div className="text-xs text-gray-400">{chartData.meta.location}</div>}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label:'Lagna',    value: chartData.RASHIS?.[chartData.lagnaSign] },
                    { label:'Tithi',    value: chartData.panchanga?.tithi?.display },
                    { label:'Nakṣatra', value: chartData.panchanga?.nakshatra?.name },
                    { label:'Yoga',     value: chartData.panchanga?.yoga?.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3"
                      style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.14)' }}>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-xs font-semibold text-purple-200 sanskrit truncate">{value || '—'}</div>
                    </div>
                  ))}
                </div>
                {saveError && (
                  <div className="text-xs text-amber-400/70 flex items-center gap-1.5 pt-1">
                    <AlertTriangle size={10}/> Auto-save failed
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Tab bar — scrollable */}
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <div className="flex gap-1 p-1 rounded-xl w-max sm:w-full"
                style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(139,92,246,0.14)' }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="flex-shrink-0 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                    style={{
                      background: tab === t.id ? 'linear-gradient(135deg,rgba(124,58,237,0.55),rgba(79,70,229,0.55))' : 'transparent',
                      color: tab === t.id ? '#fff' : 'rgba(148,163,184,0.65)',
                      border: tab === t.id ? '1px solid rgba(139,92,246,0.4)' : 'none',
                      boxShadow: tab === t.id ? '0 2px 12px rgba(124,58,237,0.25)' : 'none',
                    }}>
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="glass-dark flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw size={20} className="animate-spin text-purple-400" />
                <span className="text-xs text-gray-500">Calculating positions…</span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="glass-dark flex items-start gap-3 p-4" style={{ borderColor:'rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Content */}
            {!loading && !error && chartData && (
              <>
                {tab === 'chart' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <BirthChart chartData={chartData} title="Rāśi" />
                    <BirthChart chartData={chartData} title="Navāṃśa" />
                  </div>
                )}
                {tab === 'panchanga'     && <Panchanga panchanga={chartData.panchanga} date={chartData.meta?.date} coords={{ lat: chartData.meta?.lat, lon: chartData.meta?.lon }} />}
                {tab === 'graha'         && <GrahaTable grahaInfo={chartData.grahaInfo} />}
                {tab === 'dasha'         && <DashaView chartData={chartData} />}
                {tab === 'yogas'         && <YogaView chartData={chartData} />}
                {tab === 'forecast'      && <Forecast chartData={chartData} />}
                {tab === 'predictions'   && <Predictions chartData={chartData} />}
                {tab === 'compatibility' && <Compatibility chart1={chartData} />}
                {tab === 'remedies'      && <Remedies chartData={chartData} />}
                {tab === 'bot'           && <ChartBot chartData={chartData} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
