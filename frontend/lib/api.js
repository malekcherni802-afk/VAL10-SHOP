const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ── Products ─────────────────────────────────────────────── */
export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/products${query ? '?' + query : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

/* ── Auth ─────────────────────────────────────────────────── */
export async function adminLogin(password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return res.json();
}

/* ── Product mutations (backend multipart) ────────────────── */
export async function createProduct(formData, token) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

export async function updateProduct(id, formData, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

/* ── Cloudinary secure upload via Next.js API route ──────── */
export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json(); // { url, public_id }
}

/* ── Helpers ──────────────────────────────────────────────── */
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

export { API_URL };
