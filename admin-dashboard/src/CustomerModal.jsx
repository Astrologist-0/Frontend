import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { api } from './api';

export default function CustomerModal({ customer, onClose, onSaved }) {
  const isEdit = !!customer;
  const [form, setForm] = useState({ name:'', location:'', lat:'', lon:'', birthDate:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer) {
      setForm({
        name:      customer.name      || '',
        location:  customer.location  || '',
        lat:       customer.lat       != null ? String(customer.lat) : '',
        lon:       customer.lon       != null ? String(customer.lon) : '',
        birthDate: customer.birthDate ? new Date(customer.birthDate).toISOString().slice(0,16) : '',
      });
    }
  }, [customer]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = {
        name: form.name, location: form.location,
        lat: parseFloat(form.lat), lon: parseFloat(form.lon),
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
      };
      const saved = isEdit ? await api.update(customer.customerId, payload) : await api.create(payload);
      onSaved(saved.data);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width:'100%', maxWidth:440 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <span className="cinzel" style={{ color:'#c4b5fd', fontWeight:600, fontSize:13, letterSpacing:'0.05em' }}>
            {isEdit ? 'Edit Customer' : 'Add Customer'}
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,0.5)', padding:4, borderRadius:6, display:'flex', alignItems:'center' }}
            onMouseEnter={e => e.currentTarget.style.color='#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(148,163,184,0.5)'}>
            <X size={16}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:20, display:'flex', flexDirection:'column', gap:16 }}>

          <div>
            <label className="lbl">Name</label>
            <input className="field" placeholder="Full name" value={form.name} onChange={set('name')}/>
          </div>

          <div>
            <label className="lbl">Birth Date & Time</label>
            <input type="datetime-local" className="field" value={form.birthDate} onChange={set('birthDate')} required/>
          </div>

          <div>
            <label className="lbl">Location</label>
            <input className="field" placeholder="City, Country" value={form.location} onChange={set('location')}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label className="lbl">Latitude</label>
              <input className="field" placeholder="28.61" value={form.lat} onChange={set('lat')} required/>
            </div>
            <div>
              <label className="lbl">Longitude</label>
              <input className="field" placeholder="77.20" value={form.lon} onChange={set('lon')} required/>
            </div>
          </div>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, padding:'10px 14px', color:'#fca5a5', fontSize:12 }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', gap:10, paddingTop:4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>
              {saving ? <RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }}/> : <Save size={13}/>}
              {isEdit ? 'Update' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
