import React, { useState } from 'react';
import { detectYogas } from '../utils/yogas';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TYPE_STYLE = {
  auspicious:  { border:'rgba(34,197,94,0.25)',  bg:'rgba(34,197,94,0.05)',  header:'rgba(34,197,94,0.08)',  color:'#86efac' },
  challenging: { border:'rgba(239,68,68,0.25)',   bg:'rgba(239,68,68,0.05)',  header:'rgba(239,68,68,0.08)',  color:'#fca5a5' },
  mixed:       { border:'rgba(245,158,11,0.25)',  bg:'rgba(245,158,11,0.05)', header:'rgba(245,158,11,0.08)', color:'#fcd34d' },
  neutral:     { border:'rgba(139,92,246,0.2)',   bg:'rgba(139,92,246,0.04)', header:'rgba(139,92,246,0.07)', color:'#a78bfa' },
};

function YogaCard({ yoga, index }) {
  const [open, setOpen] = useState(index < 3);
  const s = TYPE_STYLE[yoga.type] || TYPE_STYLE.neutral;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${s.border}` }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ background: s.header }}>
        <span className="text-xl leading-none">{yoga.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-100 sanskrit">{yoga.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: s.bg, color: s.color, border:`1px solid ${s.border}` }}>
              {yoga.type}
            </span>
          </div>
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0"/> : <ChevronDown size={14} className="text-gray-500 flex-shrink-0"/>}
      </button>
      {open && (
        <div className="px-4 py-3.5 border-t border-white/[0.05]" style={{ background: s.bg }}>
          <p className="text-sm text-gray-300 leading-relaxed">{yoga.desc}</p>
        </div>
      )}
    </div>
  );
}

export default function YogaView({ chartData }) {
  if (!chartData) return null;
  const yogas = detectYogas(chartData.planets, chartData.lagnaSign);
  const auspicious  = yogas.filter(y => y.type === 'auspicious');
  const challenging = yogas.filter(y => y.type === 'challenging');
  const mixed       = yogas.filter(y => y.type === 'mixed' || y.type === 'neutral');

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <div className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Yoga Analysis</div>
          <div className="text-xs text-gray-500 mt-0.5">Planetary combinations in your chart</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {auspicious.length > 0 && <span className="px-2 py-1 rounded-lg font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#86efac' }}>{auspicious.length} auspicious</span>}
          {challenging.length > 0 && <span className="px-2 py-1 rounded-lg font-medium" style={{ background:'rgba(239,68,68,0.1)', color:'#fca5a5' }}>{challenging.length} challenging</span>}
        </div>
      </div>
      <div className="p-4 space-y-2">
        {yogas.map((y, i) => <YogaCard key={i} yoga={y} index={i} />)}
      </div>
    </div>
  );
}
