import React, { useState } from 'react';
import { generateForecasts } from '../utils/transits';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

export default function Forecast({ chartData }) {
  const [period, setPeriod] = useState('daily');

  if (!chartData) return null;

  const { forecasts, date } = generateForecasts(chartData, period);

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Transit Forecast</div>
            <div className="text-xs text-gray-500 mt-0.5">Current planetary influences on your chart</div>
          </div>

          {/* Period selector */}
          <div className="flex gap-1 rounded-xl p-1" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(139,92,246,0.15)' }}>
            {['daily','weekly','monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize"
                style={{
                  background: period === p ? 'rgba(139,92,246,0.4)' : 'transparent',
                  color: period === p ? '#fff' : 'rgba(148,163,184,0.7)',
                  border: period === p ? '1px solid rgba(139,92,246,0.4)' : 'none',
                }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {forecasts.map((f, i) => (
          <div key={i} className="rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${f.alert ? 'rgba(239,68,68,0.3)' : f.highlight ? 'rgba(34,197,94,0.3)' : f.color + '25'}`,
              background: f.alert ? 'rgba(239,68,68,0.05)' : f.highlight ? 'rgba(34,197,94,0.05)' : f.color + '08',
            }}>
            <div className="px-4 py-3.5 flex items-start gap-3">
              <span className="text-xl leading-none flex-shrink-0">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-100 mb-1">{f.title}</div>
                <p className="text-sm text-gray-300 leading-relaxed">{f.text}</p>
              </div>
              {f.positive !== undefined && (
                <div className="flex-shrink-0">
                  {f.positive
                    ? <TrendingUp size={16} className="text-green-400"/>
                    : <AlertCircle size={16} className="text-amber-400"/>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-white/[0.05] text-xs text-gray-600 flex items-center gap-1.5">
        <Calendar size={11}/> Forecast for {date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
      </div>
    </div>
  );
}
