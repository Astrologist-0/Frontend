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
import { useChartStorage } from './hooks/useChartStorage';
import { Star, RefreshCw, AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';

const DEFAULT = { date: new Date(), lat: 37.56, lon: -122.01, name: '', location: 'Fremont, California' };
const TABS = [
  { id: 'chart',       label: '✦ Chart' },
  { id: 'panchanga',   label: 'Pañcāṅga' },
  { id: 'graha',       label: 'Graha' },
  { id: 'dasha',       label: 'Daśā' },
  { id: 'yogas',       label: 'Yogas' },
  { id: 'forecast',    label: 'Forecast' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'remedies',    label: 'Remedies' },
  { id: 'bot',         label: '✦ Ask Jyotiṣa' },
];

export default function App() {
  const [input,     setInput]     = useState(DEFAULT);
  const [chartData, setChartData] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [tab,       setTab]       = useState('chart');
  const [now,       setNow]       = useState(new Date());
  const [justSaved, setJustSaved] = useState(false);

  const { saveChart, saving, saveError } = useChartStorage();

  const compute = useCallback((inp) => {
    setLoading(true); setError(null);
    setTimeout(async () => {
      try {
        const data = { ...calcChart(inp.date, inp.lat, inp.lon), meta: inp };
        setChartData(data);
        // Auto-save to DynamoDB
        try {
          await saveChart(data, inp);
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 3000);
        } catch (_) {}
      } catch (e) {
        setError(e.message || 'Calculation failed');
      }
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

  const handleSave = async () => {
    if (!chartData) return;
    try {
      await saveChart(chartData, input);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (_) {}
  };

  return (
    <div className="min-h-screen relative"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 10% -10%, #1a0a2e 0%, #07070f 55%)' }}>

      {/* Ambient orbs */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent 65%)', filter: 'blur(100px)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(7,7,15,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
              <Star size={14} className="text-white" fill="white" />
            </div>
            <div className="leading-none">
              <div className="font-cinzel font-semibold text-white text-sm tracking-wide">Astrologist</div>
              <div className="text-[10px] text-purple-400/50 tracking-wider hidden sm:block">Vedic Astrology</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-[11px] text-gray-500">{now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
              <div className="text-xs font-mono text-purple-400 tabular-nums">{now.toLocaleTimeString()}</div>
            </div>
            <button onClick={handleNow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-300 transition-all hover:text-white"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.24)' }}>
              <RefreshCw size={11} /> Now
            </button>
            {chartData && justSaved && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
                <CheckCircle size={11} /> Saved
              </span>
            )}
            {saving && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400">
                <RefreshCw size={11} className="animate-spin" /> Saving…
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <div className="flex flex-col xl:flex-row gap-5 xl:gap-6 items-start">

          {/* Left panel */}
          <div className="w-full xl:w-[340px] xl:flex-shrink-0 space-y-4">
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
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Chart Info</span>
                  <span className="text-[10px] font-mono text-purple-400/70">{chartData.ayanamsa?.toFixed(3)}° Lahiri</span>
                </div>
                {chartData.meta?.name && <div className="text-sm font-semibold text-white">{chartData.meta.name}</div>}
                {chartData.meta?.location && <div className="text-xs text-gray-400 leading-relaxed">{chartData.meta.location}</div>}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { label: 'Lagna',    value: chartData.RASHIS?.[chartData.lagnaSign] },
                    { label: 'Tithi',    value: chartData.panchanga?.tithi?.display },
                    { label: 'Nakṣatra', value: chartData.panchanga?.nakshatra?.name },
                    { label: 'Yoga',     value: chartData.panchanga?.yoga?.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-3"
                      style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.14)' }}>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-xs font-semibold text-purple-200 sanskrit leading-snug truncate">{value || '—'}</div>
                    </div>
                  ))}
                </div>

                {/* Save error */}
                {saveError && (
                  <div className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                    <AlertTriangle size={11} /> {saveError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
              <div className="tab-bar w-max sm:w-full">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`tab-btn sanskrit ${tab === t.id ? 'active' : ''}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="glass-dark glow-purple flex flex-col items-center justify-center py-28 gap-3">
                <RefreshCw size={22} className="animate-spin text-purple-400" />
                <span className="text-xs text-gray-500 tracking-wide">Calculating positions…</span>
              </div>
            )}

            {!loading && error && (
              <div className="glass-dark flex items-start gap-3 p-4" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-300 leading-relaxed">{error}</span>
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
                {tab === 'panchanga' && (
                  <Panchanga panchanga={chartData.panchanga} date={chartData.meta?.date}
                    coords={{ lat: chartData.meta?.lat, lon: chartData.meta?.lon }} />
                )}
                {tab === 'graha' && <GrahaTable grahaInfo={chartData.grahaInfo} />}
                {tab === 'dasha' && <DashaView chartData={chartData} />}
                {tab === 'yogas' && <YogaView chartData={chartData} />}
                {tab === 'predictions' && <Predictions chartData={chartData} />}
                {tab === 'remedies'    && <Remedies chartData={chartData} />}
                {tab === 'forecast'    && <Forecast chartData={chartData} />}
                {tab === 'bot'         && <ChartBot chartData={chartData} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
