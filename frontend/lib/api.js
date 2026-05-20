/**
 * VALIO v4 — centralised API client
 * All requests use NEXT_PUBLIC_API_URL so the same code works in dev,
 * SSR (getServerSideProps), and production without any changes.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ── helpers ────────────────────────────────────────────────── */

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}

/* ── health ─────────────────────────────────────────────────── */

export async function fetchHealth() {
  const res = await fetch(`${BASE}/api/health`);
  return handleResponse(res);
}

/* ── auth ───────────────────────────────────────────────────── */

export async function login(password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ password }),
  });
  return handleResponse(res);
}

export async function verifyToken(token) {
  const res = await fetch(`${BASE}/api/auth/verify`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token }),
  });
  return handleResponse(res);
}

export async function refreshToken(token) {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
  });
  return handleResponse(res);
}

/* ── products — public ──────────────────────────────────────── */

export async function fetchProducts({ category, featured, limit, skip, search } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (featured) params.set('featured', 'true');
  if (limit)    params.set('limit', String(limit));
  if (skip)     params.set('skip', String(skip));
  if (search)   params.set('search', search);

  const res = await fetch(`${BASE}/api/products?${params.toString()}`, {
    next: { revalidate: 30 },
  });
  return handleResponse(res);
}

export async function fetchProductById(id) {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    next: { revalidate: 30 },
  });
  return handleResponse(res);
}

/* ── products — admin ───────────────────────────────────────── */

export async function fetchAllProductsAdmin(token, { category, limit, skip } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (limit) params.set('limit', String(limit));
  if (skip)  params.set('skip',  String(skip));

  const res = await fetch(`${BASE}/api/products/all?${params.toString()}`, {
    headers: authHeader(token),
  });
  return handleResponse(res);
}

export async function createProduct(token, formData) {
  const res = await fetch(`${BASE}/api/products`, {
    method:  'POST',
    headers: authHeader(token),
    body:    formData,
  });
  return handleResponse(res);
}

export async function updateProduct(token, id, formData) {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method:  'PATCH',
    headers: authHeader(token),
    body:    formData,
  });
  return handleResponse(res);
}

export async function deleteProduct(token, id) {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method:  'DELETE',
    headers: authHeader(token),
  });
  return handleResponse(res);
}

/* ── settings ───────────────────────────────────────────────── */

export async function fetchSettings() {
  const res = await fetch(`${BASE}/api/settings`, { next: { revalidate: 60 } });
  return handleResponse(res);
}

export async function updateSettings(token, settings) {
  const res = await fetch(`${BASE}/api/settings`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body:    JSON.stringify(settings),
  });
  return handleResponse(res);
}

/* ── backgrounds ────────────────────────────────────────────── */

export async function fetchBackgrounds() {
  const res = await fetch(`${BASE}/api/backgrounds`, { next: { revalidate: 60 } });
  return handleResponse(res);
}

export async function fetchAllBackgroundsAdmin(token) {
  const res = await fetch(`${BASE}/api/backgrounds/all`, {
    headers: authHeader(token),
  });
  return handleResponse(res);
}

export async function createBackground(token, payload) {
  const res = await fetch(`${BASE}/api/backgrounds`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateBackground(token, id, payload) {
  const res = await fetch(`${BASE}/api/backgrounds/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteBackground(token, id) {
  const res = await fetch(`${BASE}/api/backgrounds/${id}`, {
    method:  'DELETE',
    headers: authHeader(token),
  });
  return handleResponse(res);
}

/* ── orders — public ────────────────────────────────────────── */

export async function placeOrder(payload) {
  const res = await fetch(`${BASE}/api/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

/* ── orders — admin ─────────────────────────────────────────── */

export async function fetchOrdersAdmin(token, { status, limit, skip, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (limit)  params.set('limit',  String(limit));
  if (skip)   params.set('skip',   String(skip));
  if (search) params.set('search', search);

  const res = await fetch(`${BASE}/api/orders?${params.toString()}`, {
    headers: authHeader(token),
  });
  return handleResponse(res);
}

export async function fetchOrderStats(token) {
  const res = await fetch(`${BASE}/api/orders/stats`, {
    headers: authHeader(token),
  });
  return handleResponse(res);
}

export async function updateOrder(token, id, payload) {
  const res = await fetch(`${BASE}/api/orders/${id}`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteOrder(token, id) {
  const res = await fetch(`${BASE}/api/orders/${id}`, {
    method:  'DELETE',
    headers: authHeader(token),
  });
  return handleResponse(res);
}
