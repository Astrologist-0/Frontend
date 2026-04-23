import React from 'react';

const PLANET_COLORS = {
  Su:'#f59e0b', Mo:'#93c5fd', Ma:'#f87171', Me:'#4ade80',
  Jp:'#fde68a', Ve:'#f9a8d4', Sa:'#94a3b8', Ra:'#c084fc', Ke:'#fb923c', As:'#fcd34d',
};

const PLANET_SYMBOLS = {
  Su:'☀', Mo:'☽', Ma:'♂', Me:'☿', Jp:'♃', Ve:'♀', Sa:'♄', Ra:'☊', Ke:'☋', As:'↑',
};

export default function GrahaTable({ grahaInfo }) {
  if (!grahaInfo) return null;

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/5">
        <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Graha Positions</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="border-b border-white/5">
              {['Graha','Name','Kāraka','Position','Nakṣatra','House'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grahaInfo.map((row, i) => (
              <tr key={row.id} className="border-b border-white/[0.04] transition-colors" style={{ ':hover': {} }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base" style={{ color: PLANET_COLORS[row.id] }}>{PLANET_SYMBOLS[row.id]}</span>
                    <span className="text-sm font-bold" style={{ color: PLANET_COLORS[row.id] }}>{row.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300 sanskrit">{row.name}</td>
                <td className="px-4 py-3">
                  {row.karaka && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                      {row.karaka}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-300">{row.lon}</td>
                <td className="px-4 py-3 text-sm text-gray-400 sanskrit">{row.nakshatra} <span className="text-gray-600">{row.nakLord}</span></td>
                <td className="px-4 py-3">
                  <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                    {row.house}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
