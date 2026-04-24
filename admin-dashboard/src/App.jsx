import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import CustomerModal from './CustomerModal';
import { Star, RefreshCw, Plus, Trash2, Edit2, Search, User, MapPin, Calendar, ChevronUp, ChevronDown, AlertTriangle, Users } from 'lucide-react';

const RASHIS     = ['Ar','Ta','Ge','Cn','Le','Vi','Li','Sc','Sg','Cp','Aq','Pi'];
const RASHI_FULL = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const P_COLORS = ['#f59e0b','#60a5fa','#f87171','#34d399','#fbbf24','#f472b6','#94a3b8','#a78bfa','#fb923c','#fcd34d','#818cf8','#6ee7b7'];

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [search,    setSearch]    = useState('');
  const [sortKey,   setSortKey]   = useState('createdAt');
  const [sortDir,   setSortDir]   = useState('desc');
  const [modal,     setModal]     = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [selected,  setSelected]  = useState(new Set());
  const [bulkDel,   setBulkDel]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.list(200);
      setCustomers(res.items || []);
      setSelected(new Set());
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer permanently?')) return;
    setDeleting(id);
    try { await api.delete(id); setCustomers(c => c.filter(x => x.customerId !== id)); setSelected(s => { const n = new Set(s); n.delete(id); return n; }); }
    catch (e) { alert('Delete failed: ' + e.message); }
    setDeleting(null);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected customer${selected.size > 1 ? 's' : ''}?`)) return;
    setBulkDel(true);
    const ids = [...selected];
    let failed = 0;
    for (const id of ids) {
      try { await api.delete(id); setCustomers(c => c.filter(x => x.customerId !== id)); }
      catch { failed++; }
    }
    setSelected(new Set());
    setBulkDel(false);
    if (failed > 0) alert(`${failed} deletion(s) failed.`);
  };

  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.customerId)));
  };

  const handleSaved = (data) => {
    setCustomers(prev => {
      const exists = prev.find(c => c.customerId === data.customerId);
      return exists ? prev.map(c => c.customerId === data.customerId ? data : c) : [data, ...prev];
    });
    setModal(null);
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = customers
    .filter(c => {
      const q = search.toLowerCase();
      return !q || (c.name||'').toLowerCase().includes(q) || (c.location||'').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const lagnaCount = {};
  customers.forEach(c => { if (c.lagnaSign != null) lagnaCount[c.lagnaSign] = (lagnaCount[c.lagnaSign]||0)+1; });
  const topLagna = Object.entries(lagnaCount).sort((a,b) => b[1]-a[1])[0];
  const thisMonth = customers.filter(c => c.createdAt && new Date(c.createdAt) > new Date(Date.now()-30*86400000)).length;

  const SortBtn = ({ k, label }) => (
    <span style={{ display:'flex', alignItems:'center', gap:4 }} onClick={() => toggleSort(k)}>
      {label}
      {sortKey === k
        ? (sortDir === 'asc' ? <ChevronUp size={11}/> : <ChevronDown size={11}/>)
        : <ChevronUp size={11} style={{ opacity:0.2 }}/>}
    </span>
  );

  const initials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse 80% 60% at 10% -10%, #1a0a2e 0%, #07070f 55%)' }}>

      {/* Ambient glow */}
      <div aria-hidden style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-128, left:'33%', width:500, height:500, borderRadius:'50%', opacity:0.06, background:'radial-gradient(circle,#7c3aed,transparent 65%)', filter:'blur(80px)' }}/>
      </div>

      {/* Header */}
      <header style={{ position:'sticky', top:0, zIndex:30, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(7,7,15,0.9)', backdropFilter:'blur(24px)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow:'0 0 16px rgba(124,58,237,0.4)', flexShrink:0 }}>
              <Star size={14} color="#fff" fill="#fff"/>
            </div>
            <div>
              <div className="cinzel" style={{ color:'#fff', fontWeight:600, fontSize:14, letterSpacing:'0.05em' }}>Astrologist</div>
              <div style={{ color:'rgba(167,139,250,0.5)', fontSize:10, letterSpacing:'0.08em' }}>Admin Dashboard</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="btn btn-ghost" onClick={load} disabled={loading}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setModal('add')}>
              <Plus size={13}/> Add Customer
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1280, margin:'0 auto', padding:'24px', display:'flex', flexDirection:'column', gap:24 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
          {[
            { label:'Total Customers', value: customers.length, color:'#a78bfa', icon:<Users size={18}/> },
            { label:'This Month',      value: thisMonth,        color:'#60a5fa', icon:<Calendar size={18}/> },
            { label:'With Name',       value: customers.filter(c=>c.name).length, color:'#4ade80', icon:<User size={18}/> },
            { label:'Top Lagna',       value: topLagna ? RASHI_FULL[topLagna[0]] : '—', color:'#fbbf24', icon:<Star size={18}/> },
          ].map(s => (
            <div key={s.label} className="card stat">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ color: s.color, opacity:0.5 }}>{s.icon}</div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="card" style={{ overflow:'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span className="cinzel" style={{ color:'#c4b5fd', fontWeight:600, fontSize:13, letterSpacing:'0.05em' }}>Customers</span>
              <span style={{ background:'rgba(139,92,246,0.12)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.2)', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>{filtered.length}</span>
              {selected.size > 0 && (
                <button className="btn btn-sm btn-danger" onClick={handleBulkDelete} disabled={bulkDel} style={{ marginLeft:4 }}>
                  {bulkDel ? <RefreshCw size={11} style={{ animation:'spin 1s linear infinite' }}/> : <Trash2 size={11}/>}
                  Delete {selected.size} selected
                </button>
              )}
            </div>
            <div style={{ position:'relative', minWidth:220 }}>
              <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(148,163,184,0.4)', pointerEvents:'none' }}/>
              <input className="field" style={{ paddingLeft:34, paddingTop:8, paddingBottom:8 }} placeholder="Search name or location…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin:'16px 20px', display:'flex', alignItems:'center', gap:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12, padding:'12px 16px', color:'#fca5a5', fontSize:13 }}>
              <AlertTriangle size={15}/> {error} — make sure the server is running on port 3001.
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width:40, paddingLeft:16 }}>
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < filtered.length; }}
                      onChange={toggleAll}
                      style={{ width:15, height:15, cursor:'pointer', accentColor:'#7c3aed' }}
                    />
                  </th>
                  <th><SortBtn k="name" label="Customer"/></th>
                  <th><SortBtn k="birthDate" label="Birth Date"/></th>
                  <th><SortBtn k="location" label="Location"/></th>
                  <th><SortBtn k="lagnaSign" label="Lagna"/></th>
                  <th><SortBtn k="panchanga.nakshatra.name" label="Nakṣatra"/></th>
                  <th><SortBtn k="createdAt" label="Saved"/></th>
                  <th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 0' }}>
                    <RefreshCw size={22} style={{ color:'#a78bfa', margin:'0 auto', animation:'spin 1s linear infinite' }}/>
                  </td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:'60px 0', color:'rgba(148,163,184,0.3)', fontSize:14 }}>
                    {search ? 'No results found.' : 'No customers yet. Click "Add Customer" to get started.'}
                  </td></tr>
                )}
                {!loading && filtered.map((c, idx) => {
                  const color = P_COLORS[c.lagnaSign ?? idx % P_COLORS.length];
                  return (
                    <tr key={c.customerId}
                      style={{ background: selected.has(c.customerId) ? 'rgba(139,92,246,0.08)' : 'transparent', transition:'background 0.15s', borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => { if (!selected.has(c.customerId)) e.currentTarget.style.background='rgba(139,92,246,0.04)'; }}
                      onMouseLeave={e => { if (!selected.has(c.customerId)) e.currentTarget.style.background = selected.has(c.customerId) ? 'rgba(139,92,246,0.08)' : 'transparent'; }}>

                      {/* Checkbox */}
                      <td style={{ paddingLeft:16, width:40 }}>
                        <input type="checkbox" checked={selected.has(c.customerId)} onChange={() => toggleSelect(c.customerId)}
                          style={{ width:15, height:15, cursor:'pointer', accentColor:'#7c3aed' }}/>
                      </td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div className="avatar" style={{ background: color+'18', borderColor: color+'30', color }}>
                            {initials(c.name)}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9' }}>{c.name || <span style={{ color:'rgba(148,163,184,0.35)', fontStyle:'italic' }}>Anonymous</span>}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
                              <span style={{ fontSize:10, color:'rgba(148,163,184,0.3)', fontFamily:'monospace' }}>{c.customerId.slice(0,8)}…</span>
                              {c.type === 'partner' && (
                                <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:10, background:'rgba(236,72,153,0.15)', color:'#f9a8d4', border:'1px solid rgba(236,72,153,0.25)' }}>
                                  ❤️ Partner{c.linkedTo ? ` of ${c.linkedTo}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Birth date */}
                      <td>
                        {c.birthDate ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#cbd5e1' }}>
                            <Calendar size={12} style={{ color:'rgba(148,163,184,0.35)' }}/>
                            {new Date(c.birthDate).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}
                          </div>
                        ) : <span style={{ color:'rgba(148,163,184,0.25)' }}>—</span>}
                      </td>

                      {/* Location */}
                      <td>
                        {c.location ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#cbd5e1', maxWidth:180 }}>
                            <MapPin size={12} style={{ color:'rgba(148,163,184,0.35)', flexShrink:0 }}/>
                            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.location}</span>
                          </div>
                        ) : <span style={{ color:'rgba(148,163,184,0.25)' }}>—</span>}
                      </td>

                      {/* Lagna */}
                      <td>
                        {c.lagnaSign != null ? (
                          <span className="badge badge-gold" style={{ background: color+'15', color, borderColor: color+'30' }}>
                            {RASHI_FULL[c.lagnaSign]}
                          </span>
                        ) : <span style={{ color:'rgba(148,163,184,0.25)' }}>—</span>}
                      </td>

                      {/* Nakshatra */}
                      <td>
                        {c.panchanga?.nakshatra?.name ? (
                          <span className="badge badge-purple">{c.panchanga.nakshatra.name}</span>
                        ) : <span style={{ color:'rgba(148,163,184,0.25)' }}>—</span>}
                      </td>

                      {/* Saved */}
                      <td style={{ fontSize:12, color:'rgba(148,163,184,0.45)', whiteSpace:'nowrap' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8 }}>
                          <button className="btn btn-sm btn-edit" onClick={() => setModal(c)}>
                            <Edit2 size={11}/> Edit
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.customerId)} disabled={deleting === c.customerId}>
                            {deleting === c.customerId ? <RefreshCw size={11} style={{ animation:'spin 1s linear infinite' }}/> : <Trash2 size={11}/>}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modal && (
        <CustomerModal
          customer={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
