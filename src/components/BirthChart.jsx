import React from 'react';

// South Indian chart — signs FIXED, Lagna sign highlighted
// Pi(11) Ar(0)  Ta(1)  Ge(2)
// Aq(10) [ctr]  [ctr]  Cn(3)
// Cp(9)  [ctr]  [ctr]  Le(4)
// Sg(8)  Sc(7)  Li(6)  Vi(5)

const SIGN_ABBR  = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const SIGN_FULL  = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const P_COLOR = {
  Su:'#f59e0b', Mo:'#60a5fa', Ma:'#f87171', Me:'#34d399',
  Jp:'#fbbf24', Ve:'#f472b6', Sa:'#94a3b8', Ra:'#a78bfa',
  Ke:'#fb923c', As:'#fcd34d',
};

// flat row-major order for the 4×4 grid; -1 = center block
const CELLS = [
  11, 0,  1,  2,
  10, -1, -1, 3,
  9,  -1, -1, 4,
  8,  7,  6,  5,
];

export default function BirthChart({ chartData, title = 'Rāśi' }) {
  if (!chartData) return null;
  const { planets, lagnaSign } = chartData;

  // sign → planets
  const bySign = {};
  for (let s = 0; s < 12; s++) bySign[s] = [];
  for (const [p, lon] of Object.entries(planets)) {
    if (p === 'As') continue; // Lagna shown via cell highlight
    bySign[Math.floor(lon / 30)].push({ p, deg: Math.floor(lon % 30) });
  }

  return (
    <div className="glass-dark glow-purple overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">{title}</span>
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">South Indian</span>
      </div>

      {/* Chart */}
      <div className="p-3 flex-1">
        <div className="si-grid">
          {CELLS.map((signIdx, i) => {
            // center block — render once
            if (signIdx === -1) {
              if (i === 5) { // top-left of center 2×2
                return (
                  <div key="center" className="si-center">
                    <span className="font-cinzel text-[10px] text-purple-400/25 tracking-widest">{title}</span>
                  </div>
                );
              }
              return null;
            }

            const isLagna = signIdx === lagnaSign;
            const items   = bySign[signIdx] || [];

            return (
              <div
                key={signIdx}
                className={`si-cell ${isLagna ? 'si-cell-lagna' : ''}`}
                style={{ background: isLagna ? 'rgba(245,158,11,0.06)' : 'rgba(12,12,26,0.5)' }}
                title={SIGN_FULL[signIdx]}
              >
                {/* Sign badge */}
                <span
                  className="si-sign"
                  style={{
                    color:      isLagna ? '#f59e0b' : 'rgba(167,139,250,0.65)',
                    background: isLagna ? 'rgba(245,158,11,0.14)' : 'rgba(139,92,246,0.1)',
                    border:     `1px solid ${isLagna ? 'rgba(245,158,11,0.32)' : 'rgba(139,92,246,0.22)'}`,
                  }}
                >
                  {SIGN_ABBR[signIdx]}
                </span>

                {/* Lagna marker */}
                {isLagna && <span className="si-as-badge">As</span>}

                {/* Planets */}
                <div className="si-planets">
                  {items.map(({ p, deg }) => (
                    <span
                      key={p}
                      className="si-planet"
                      style={{
                        color:      P_COLOR[p] || '#c4b5fd',
                        background: (P_COLOR[p] || '#c4b5fd') + '1a',
                        border:     `1px solid ${(P_COLOR[p] || '#c4b5fd')}30`,
                      }}
                    >
                      {p} {deg}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/[0.04] pt-2">
        {Object.entries(P_COLOR).filter(([p]) => p !== 'As').map(([p, c]) => (
          <span key={p} className="text-[10px] font-medium" style={{ color: c + 'aa' }}>
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
