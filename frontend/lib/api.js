const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export async function fetchSettings() {
  try {
    const res = await fetch(`${API_URL}/api/settings`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export async function adminLogin(password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  return res.json();
}

export async function verifyToken(token) {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return res.json();
}

export async function createProduct(formData, token) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

export async function updateProduct(id, formData, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function updateSettings(settings, token) {
  const res = await fetch(`${API_URL}/api/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export function getImageUrl(path) {
  if (!path) return '/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

export { API_URL };
