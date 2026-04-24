import { useState, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useChartStorage() {
  const [saving,  setSaving]  = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedId, setSavedId] = useState(null);

  const saveChart = useCallback(async (chartData, meta) => {
    setSaving(true); setSaveError(null);
    try {
      const body = {
        name:      meta.name,
        location:  meta.location,
        lat:       meta.lat,
        lon:       meta.lon,
        birthDate: meta.date instanceof Date ? meta.date.toISOString() : meta.date,
        lagnaSign: chartData.lagnaSign,
        ayanamsa:  chartData.ayanamsa,
        planets:   chartData.planets,
        panchanga: {
          tithi:     chartData.panchanga?.tithi,
          nakshatra: chartData.panchanga?.nakshatra,
          vara:      chartData.panchanga?.vara,
          yoga:      chartData.panchanga?.yoga,
          karana:    chartData.panchanga?.karana,
        },
      };

      console.log('[saveChart] Sending to:', API);
      console.log('[saveChart] birthDate:', body.birthDate, 'lat:', body.lat, 'lon:', body.lon);

      const res  = await fetch(`${API}/api/charts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      console.log('[saveChart] Response:', res.status, json.success ? 'OK' : json.error);
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setSavedId(json.data.customerId);
      return json.data;
    } catch (err) {
      console.error('[saveChart] Error:', err.message);
      setSaveError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const listCharts = useCallback(async (limit = 50) => {
    const res  = await fetch(`${API}/api/charts?limit=${limit}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.items;
  }, []);

  const getChart = useCallback(async (id) => {
    const res  = await fetch(`${API}/api/charts/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    return json.data;
  }, []);

  const deleteChart = useCallback(async (id) => {
    const res = await fetch(`${API}/api/charts/${id}`, { method: 'DELETE' });
    if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
  }, []);

  return { saveChart, listCharts, getChart, deleteChart, saving, saveError, savedId };
}
