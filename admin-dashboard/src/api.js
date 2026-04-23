const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export const api = {
  list:   (limit = 100) => req(`/api/charts?limit=${limit}`),
  get:    (id)          => req(`/api/charts/${id}`),
  create: (data)        => req('/api/charts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data)    => req(`/api/charts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id)          => req(`/api/charts/${id}`, { method: 'DELETE' }),
};
