import React, { useState, useEffect } from 'react';
import { useChartStorage } from '../hooks/useChartStorage';
import { RefreshCw, Trash2, User, MapPin, Calendar } from 'lucide-react';

const RASHIS = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];

export default function CustomersList() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const { listCharts, deleteChart } = useChartStorage();

  const load = async () => {
    setLoading(true); setError(null);
    try { setItems(await listCharts(100)); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete chart for "${name || id}"?`)) return;
    try { await deleteChart(id); setItems(i => i.filter(x => x.customerId !== id)); }
    catch (e) { alert('Delete failed: ' + e.message); }
  };

  if (loading) return (
    <div className="glass-dark flex items-center justify-center py-20 gap-3">
      <RefreshCw size={18} className="animate-spin text-purple-400" />
      <span className="text-sm text-gray-500">Loading customers…</span>
    </div>
  );

  if (error) return (
    <div className="glass-dark p-5 text-sm text-red-400">
      Failed to load: {error}. Make sure the server is running on port 3001.
    </div>
  );

  return (
    <div className="glass-dark glow-purple">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div>
          <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">Saved Charts</span>
          <span className="ml-3 text-xs text-gray-500">{items.length} records</span>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-purple-400 transition-all"
          style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center text-gray-600 text-sm">No charts saved yet.</div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {items
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(item => (
              <div key={item.customerId} className="px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                  <User size={15} className="text-purple-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white truncate">
                      {item.name || 'Anonymous'}
                    </span>
                    {item.lagnaSign !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                        {RASHIS[item.lagnaSign]} Lagna
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> {item.location}
                      </span>
                    )}
                    {item.birthDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(item.birthDate).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                      </span>
                    )}
                    {item.createdAt && (
                      <span className="text-gray-600">
                        Saved {new Date(item.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Planet summary */}
                  {item.planets && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {Object.entries(item.planets).slice(0, 5).map(([p, lon]) => (
                        <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(139,92,246,0.1)', color: 'rgba(167,139,250,0.7)', border: '1px solid rgba(139,92,246,0.15)' }}>
                          {p} {RASHIS[Math.floor(lon / 30)]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button onClick={() => handleDelete(item.customerId, item.name)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
