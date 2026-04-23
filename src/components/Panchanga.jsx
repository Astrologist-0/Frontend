import React from 'react';
import { Sun, Moon, Star, Calendar, Clock } from 'lucide-react';

const TITHI_NAMES = ['Pratipadā','Dvitīyā','Tṛtīyā','Caturthī','Pañcamī','Ṣaṣṭhī','Saptamī','Aṣṭamī','Navamī','Daśamī','Ekādaśī','Dvādaśī','Trayodaśī','Caturdaśī','Pūrṇimā'];

function Row({ label, value, sub, icon: Icon, pct, color = '#a78bfa' }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '18', border: `1px solid ${color}30` }}>
        {Icon && <Icon size={14} style={{ color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-gray-100 sanskrit">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
        {pct !== undefined && (
          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Panchanga({ panchanga, date, coords }) {
  if (!panchanga) return null;
  const { tithi, nakshatra, vara, yoga, karana } = panchanga;
  const tithiName = TITHI_NAMES[(tithi.num - 1) % 15];

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/5">
        <div className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Pañcāṅga</div>
        {date && <div className="text-xs text-gray-500 mt-0.5">{date.toLocaleString()}</div>}
      </div>
      <div className="px-5">
        <Row label="Vāra" value={vara.name} sub={`Lord: ${vara.lord}`} icon={Sun} color="#f59e0b" />
        <Row label="Tithi" value={`${tithi.display} — ${tithiName}`} sub={`${tithi.pctLeft}% remaining · Lord: ${tithi.lord}`} icon={Moon} pct={parseFloat(tithi.pctLeft)} color="#93c5fd" />
        <Row label="Nakṣatra" value={`${nakshatra.name} (${nakshatra.num}/27)`} sub={`${nakshatra.pctLeft}% remaining · Lord: ${nakshatra.lord}`} icon={Star} pct={parseFloat(nakshatra.pctLeft)} color="#c084fc" />
        <Row label="Yoga" value={yoga.name} sub={`${yoga.pctLeft}% remaining · Lord: ${yoga.lord}`} icon={Calendar} pct={parseFloat(yoga.pctLeft)} color="#4ade80" />
        <Row label="Karaṇa" value={karana.name} sub={`${karana.pctLeft}% remaining`} icon={Clock} pct={parseFloat(karana.pctLeft)} color="#f9a8d4" />
      </div>
      {coords && (
        <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-600">
          {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
        </div>
      )}
    </div>
  );
}
