import React, { useState } from 'react';
import { calcVimshottariDasha, getCurrentDasha, formatDashaDate, PLANET_FULL } from '../utils/dasha';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';

const P_COLOR = {
  Su:'#f59e0b', Mo:'#60a5fa', Ma:'#f87171', Me:'#34d399',
  Jp:'#fbbf24', Ve:'#f472b6', Sa:'#94a3b8', Ra:'#a78bfa', Ke:'#fb923c',
};

function pct(start, end, now = new Date()) {
  const total = end - start;
  const elapsed = Math.min(Math.max(now - start, 0), total);
  return Math.round((elapsed / total) * 100);
}

function isActive(start, end, now = new Date()) {
  return now >= start && now < end;
}

export default function DashaView({ chartData }) {
  const [expanded, setExpanded] = useState(null);

  if (!chartData) return null;
  const { planets, meta } = chartData;
  const birthDate = meta?.date instanceof Date ? meta.date : new Date(meta?.date || Date.now());

  const dashas = calcVimshottariDasha(planets.Mo, birthDate, 120);
  const current = getCurrentDasha(dashas, new Date());

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Vimśottarī Daśā</div>
        <div className="text-xs text-gray-500 mt-0.5">120-year planetary period system</div>
      </div>

      {/* Current dasha highlight */}
      {current && (
        <div className="mx-4 mt-4 mb-2 rounded-xl p-4" style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)' }}>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Current Period</div>
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="text-xs text-gray-500">Mahādaśā</span>
              <div className="text-base font-bold" style={{ color: P_COLOR[current.maha.lord] }}>
                {current.maha.name}
              </div>
              <div className="text-xs text-gray-500">{formatDashaDate(current.maha.start)} – {formatDashaDate(current.maha.end)}</div>
            </div>
            {current.antar && (
              <>
                <ChevronRight size={14} className="text-gray-600" />
                <div>
                  <span className="text-xs text-gray-500">Antardaśā</span>
                  <div className="text-base font-bold" style={{ color: P_COLOR[current.antar.lord] }}>
                    {current.antar.name}
                  </div>
                  <div className="text-xs text-gray-500">{formatDashaDate(current.antar.start)} – {formatDashaDate(current.antar.end)}</div>
                </div>
              </>
            )}
          </div>
          {current.maha && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Mahādaśā progress</span>
                <span>{pct(current.maha.start, current.maha.end)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all" style={{ width:`${pct(current.maha.start, current.maha.end)}%`, background: P_COLOR[current.maha.lord] }}/>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dasha timeline */}
      <div className="px-4 pb-4 space-y-1.5 mt-2">
        {dashas.filter(d => d.end > new Date(Date.now() - 10 * 365.25 * 86400000)).slice(0, 12).map((d, i) => {
          const active = isActive(d.start, d.end);
          const past   = d.end < new Date();
          const isOpen = expanded === i;

          return (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${active ? P_COLOR[d.lord]+'40' : 'rgba(255,255,255,0.06)'}`, background: active ? P_COLOR[d.lord]+'0a' : 'transparent' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                {/* Planet dot */}
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: past ? 'rgba(255,255,255,0.15)' : P_COLOR[d.lord] }}/>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: past ? 'rgba(148,163,184,0.5)' : P_COLOR[d.lord] }}>
                      {d.name}
                    </span>
                    <span className="text-xs text-gray-600">{d.years}y</span>
                    {active && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: P_COLOR[d.lord]+'20', color: P_COLOR[d.lord] }}>Active</span>}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {formatDashaDate(d.start)} – {formatDashaDate(d.end)}
                  </div>
                </div>

                {active && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                    <Clock size={10}/> {pct(d.start, d.end)}%
                  </div>
                )}
                {isOpen ? <ChevronDown size={13} className="text-gray-500 flex-shrink-0"/> : <ChevronRight size={13} className="text-gray-500 flex-shrink-0"/>}
              </button>

              {/* Antardashas */}
              {isOpen && (
                <div className="border-t border-white/[0.05] px-4 py-2 space-y-1">
                  {d.antardashas.map((a, j) => {
                    const aActive = isActive(a.start, a.end);
                    const aPast   = a.end < new Date();
                    return (
                      <div key={j} className="flex items-center gap-3 py-1.5 rounded-lg px-2" style={{ background: aActive ? P_COLOR[a.lord]+'10' : 'transparent' }}>
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: aPast ? 'rgba(255,255,255,0.1)' : P_COLOR[a.lord] }}/>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium" style={{ color: aPast ? 'rgba(148,163,184,0.4)' : P_COLOR[a.lord] }}>{a.name}</span>
                          <span className="text-xs text-gray-600 ml-2">{formatDashaDate(a.start)} – {formatDashaDate(a.end)}</span>
                        </div>
                        {aActive && <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: P_COLOR[a.lord]+'20', color: P_COLOR[a.lord] }}>Now</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
