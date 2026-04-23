import React, { useState } from 'react';
import { generatePredictions } from '../utils/predictions';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_STYLE = {
  'Love & Relationships': { border: 'rgba(236,72,153,0.3)', bg: 'rgba(236,72,153,0.06)', header: 'rgba(236,72,153,0.08)', color: '#f9a8d4' },
  'Career & Success':     { border: 'rgba(59,130,246,0.3)',  bg: 'rgba(59,130,246,0.06)',  header: 'rgba(59,130,246,0.08)',  color: '#93c5fd' },
};

function PredictionCard({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  const s = CATEGORY_STYLE[item.category] || {
    border: 'rgba(139,92,246,0.2)', bg: 'rgba(139,92,246,0.04)',
    header: 'rgba(139,92,246,0.07)', color: '#a78bfa',
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${s.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        style={{ background: s.header }}
      >
        <span className="text-xl leading-none">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: s.color }}>{item.category}</div>
          <div className="text-sm font-semibold text-gray-100 truncate">{item.title}</div>
        </div>
        {open
          ? <ChevronUp size={14} className="text-gray-500 flex-shrink-0" />
          : <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-white/5" style={{ background: s.bg }}>
          {item.bullets ? (
            <ul className="space-y-3">
              {item.bullets.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
                  <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Predictions({ chartData }) {
  if (!chartData) return null;
  const predictions = generatePredictions(chartData);

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
        <Sparkles size={14} className="text-purple-400" />
        <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Predictions</span>
        <span className="ml-auto text-xs text-gray-600">Vedic Jyotiṣa</span>
      </div>
      <div className="p-4 space-y-2">
        {predictions.map((item, i) => (
          <PredictionCard key={i} item={item} index={i} />
        ))}
      </div>
      <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-600 text-center">
        Interpretations are indicative. Consult a Jyotiṣī for detailed analysis.
      </div>
    </div>
  );
}
