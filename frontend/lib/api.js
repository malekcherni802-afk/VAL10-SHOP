const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ── Products ─────────────────────────────────────────────── */
export async function fetchProducts(params = {}) {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${API_URL}/api/products${q ? '?' + q : ''}`);
  if (!r.ok) throw new Error('Failed to fetch products');
  return r.json();
}
export async function fetchProduct(id) {
  const r = await fetch(`${API_URL}/api/products/${id}`);
  if (!r.ok) throw new Error('Not found');
  return r.json();
}

/* ── Auth ─────────────────────────────────────────────────── */
export async function adminLogin(password) {
  const r = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return r.json();
}

/* ── Product mutations ────────────────────────────────────── */
export async function createProduct(formData, token) {
  const r = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return r.json();
}
export async function updateProduct(id, formData, token) {
  const r = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return r.json();
}
export async function deleteProduct(id, token) {
  const r = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}

/* ── Backgrounds ──────────────────────────────────────────── */
export async function fetchBackgrounds() {
  try {
    const r = await fetch(`${API_URL}/api/backgrounds`);
    if (!r.ok) return { backgrounds: [] };
    return r.json();
  } catch (_) { return { backgrounds: [] }; }
}
export async function fetchAllBackgrounds(token) {
  const r = await fetch(`${API_URL}/api/backgrounds/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}
export async function addBackground(data, token) {
  const r = await fetch(`${API_URL}/api/backgrounds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return r.json();
}
export async function deleteBackground(id, token) {
  const r = await fetch(`${API_URL}/api/backgrounds/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.json();
}
export async function patchBackground(id, data, token) {
  const r = await fetch(`${API_URL}/api/backgrounds/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return r.json();
}

/* ── Settings ─────────────────────────────────────────────── */
export async function fetchSettings() {
  try {
    const r = await fetch(`${API_URL}/api/settings`);
    if (!r.ok) return {};
    return r.json();
  } catch (_) { return {}; }
}
export async function saveSettings(data, token) {
  const r = await fetch(`${API_URL}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return r.json();
}

/* ── Cloudinary upload via Next.js API route ──────────────── */
export async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append('file', file);
  const r = await fetch('/api/upload', { method: 'POST', body: fd });
  const json = await r.json();
  if (!r.ok) throw new Error(json.error || 'Upload failed');
  return json; // { url, public_id }
}

/* ── Helpers ──────────────────────────────────────────────── */
export function getImageUrl(p) {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  return `${API_URL}${p}`;
}
export { API_URL };
