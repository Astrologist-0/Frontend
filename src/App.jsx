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
import { Star, RefreshCw, AlertTriangle, Sparkles, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT = { date: new Date(), lat: 37.56, lon: -122.01, name: '', location: 'Fremont, California' };

const TABS = [
  { id: 'chart',         label: 'Chart',       short: '✦'  },
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
  const [input,     setInput]     = useState(DEFAULT);
  const [chartData, setChartData] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [tab,       setTab]       = useState('chart');
  const [now,       setNow]       = useState(new Date());
  const [justSaved, setJustSaved] = useState(false);
  const [formOpen,  setFormOpen]  = useState(true);

  const { saveChart, saveError } = useChartStorage();

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

  const handleSubmit = (inp) => { setInput(inp); compute(inp); };
  const handleNow    = () => { const n = { ...input, date: new Date() }; setInput(n); compute(n); };

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 80% 60% at 10% -10%, #1a0a2e 0%, #07070f 55%)' }}>

      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle,#7c3aed,transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(7,7,15,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
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
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <div className="text-[11px] text-gray-500">{now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
              <div className="text-xs font-mono text-purple-400 tabular-nums">{now.toLocaleTimeString()}</div>
            </div>
            <button onClick={handleNow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-300"
              style={{ background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.24)' }}>
              <RefreshCw size={11}/> Now
            </button>
            {justSaved && (
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac' }}>
                <CheckCircle size={11}/> Saved
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5 xl:gap-6 items-start">

          {/* Left panel — always visible */}
          <div className="space-y-4">

            {/* Chart Details card */}
            <div className="glass-dark glow-purple overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4"
                onClick={() => setFormOpen(v => !v)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={13} className="text-purple-400" />
                  <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Chart Details</span>
                </div>
                <span className="text-gray-500">
                  {formOpen ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                </span>
              </button>
              {formOpen && (
                <div className="px-5 pb-5">
                  <ChartForm onSubmit={handleSubmit} loading={loading} />
                </div>
              )}
            </div>

            {/* Chart Info card */}
            {chartData && (
              <div className="glass-dark p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Chart Info</span>
                  <span className="text-[10px] font-mono text-purple-400/70">{chartData.ayanamsa?.toFixed(3)}° Lahiri</span>
                </div>
                {chartData.meta?.name && <div className="text-sm font-semibold text-white">{chartData.meta.name}</div>}
                {chartData.meta?.location && <div className="text-xs text-gray-400 leading-relaxed">{chartData.meta.location}</div>}
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Lagna',    value: chartData.RASHIS?.[chartData.lagnaSign] },
                    { label: 'Tithi',    value: chartData.panchanga?.tithi?.display },
                    { label: 'Nakṣatra', value: chartData.panchanga?.nakshatra?.name },
                    { label: 'Yoga',     value: chartData.panchanga?.yoga?.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3"
                      style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.14)' }}>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-xs font-semibold text-purple-200 sanskrit leading-snug truncate">{value || '—'}</div>
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

          {/* Right panel */}
          <div className="min-w-0 space-y-3">

            {/* Tab bar */}
            <div className="overflow-x-auto pb-1 -mx-1 px-1">
              <div className="flex gap-1 p-1 rounded-xl w-max xl:w-full"
                style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(139,92,246,0.14)' }}>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                    style={{
                      background: tab === t.id ? 'linear-gradient(135deg,rgba(124,58,237,0.55),rgba(79,70,229,0.55))' : 'transparent',
                      color: tab === t.id ? '#fff' : 'rgba(148,163,184,0.65)',
                      border: tab === t.id ? '1px solid rgba(139,92,246,0.4)' : 'none',
                      boxShadow: tab === t.id ? '0 2px 12px rgba(124,58,237,0.25)' : 'none',
                    }}>
                    <span className="md:hidden text-base leading-none">{t.short}</span>
                    <span className="hidden md:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="glass-dark flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw size={20} className="animate-spin text-purple-400" />
                <span className="text-xs text-gray-500">Calculating positions…</span>
              </div>
            )}

            {!loading && error && (
              <div className="glass-dark flex items-start gap-3 p-4" style={{ borderColor:'rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

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
      </div>
    </div>
  );
}
