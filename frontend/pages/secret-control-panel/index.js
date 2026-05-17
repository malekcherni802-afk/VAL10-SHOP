import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { adminLogin, fetchProducts, deleteProduct, uploadToCloudinary } from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ── APPAREL CATEGORIES ONLY ───────────────────────────────── */
const CATS = ['hoodies', 't-shirts', 'compression', 'outerwear', 'other'];

/* ════════════════════════════════════════════════════════════ */
/*  LOGIN SCREEN                                               */
/* ════════════════════════════════════════════════════════════ */
function LoginScreen({ onAuth }) {
  const [pw, setPw]       = useState('');
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await adminLogin(pw);
    if (res.token) {
      localStorage.setItem('valio_token', res.token);
      onAuth(res.token);
    } else {
      setErr('Access denied.');
    }
    setBusy(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 380, border: '1px solid rgba(212,168,67,0.2)',
        padding: '52px 44px',
      }}>
        <div style={{
          fontFamily: '"Uncial Antiqua", serif', fontSize: '1.8rem',
          color: '#fff', textAlign: 'center', marginBottom: 6,
        }}>
          VALIO
        </div>
        <div style={{
          fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
          letterSpacing: '0.3em', color: 'var(--gold)',
          textAlign: 'center', marginBottom: 44,
          textTransform: 'uppercase',
        }}>
          Control Panel
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
              letterSpacing: '0.2em', color: 'var(--gold)',
              display: 'block', marginBottom: 8, textTransform: 'uppercase',
            }}>
              Access Key
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="admin-field"
              placeholder="••••••••••••"
              required autoFocus
            />
          </div>
          {err && (
            <div style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem',
              color: 'rgba(200,60,40,0.8)', marginBottom: 16, textAlign: 'center',
            }}>
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="btn-gold"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {busy ? 'VERIFYING...' : 'ENTER'}
          </button>
        </form>

        <div style={{
          marginTop: 32, fontFamily: '"DM Mono", monospace',
          fontSize: '0.5rem', letterSpacing: '0.2em',
          color: 'rgba(85,85,85,0.4)', textAlign: 'center',
        }}>
          RESTRICTED ACCESS
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PRODUCT FORM                                               */
/* ════════════════════════════════════════════════════════════ */
function ProductForm({ product, token, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price?.toString() || '',
    category:    product?.category    || 'hoodies',
    soldOut:     product?.soldOut     || false,
    featured:    product?.featured    || false,
    tags:        product?.tags?.join(', ') || '',
  });
  const [imageFiles,  setImageFiles]  = useState([]);
  const [previews,    setPreviews]    = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [uploadedUrls, setUploadedUrls] = useState(product?.images || []);
  const fileRef = useRef(null);

  const handleFiles = (files) => {
    const arr = Array.from(files);
    setImageFiles(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async () => {
    if (!imageFiles.length) return;
    setUploading(true);
    setError('');
    try {
      const urls = await Promise.all(
        imageFiles.map(f => uploadToCloudinary(f).then(r => r.url))
      );
      setUploadedUrls(prev => [...prev, ...urls]);
      setImageFiles([]);
      setPreviews([]);
    } catch (_) {
      setError('Image upload failed. Check Cloudinary credentials.');
    }
    setUploading(false);
  };

  const removeExisting = (url) => {
    setUploadedUrls(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');

    if (imageFiles.length > 0) {
      setError('Please upload your images first before saving.');
      setSaving(false); return;
    }

    const payload = {
      name:        form.name,
      description: form.description,
      price:       form.price,
      category:    form.category,
      soldOut:     form.soldOut,
      featured:    form.featured,
      tags:        form.tags,
      imageUrls:   JSON.stringify(uploadedUrls),
    };

    try {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)));

      const url    = product ? `${API_URL}/api/products/${product._id}` : `${API_URL}/api/products`;
      const method = product ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error('Save failed');
      onSaved();
    } catch (_) {
      setError('Failed to save product.');
    }
    setSaving(false);
  };

  const label = (text) => (
    <label style={{
      display: 'block', fontFamily: '"DM Mono", monospace',
      fontSize: '0.55rem', letterSpacing: '0.2em',
      color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8,
    }}>
      {text}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 680, display: 'grid', gap: 24 }}>

      {/* Name */}
      <div>
        {label('Product Name *')}
        <input
          className="admin-field" required placeholder="e.g. Legacy Hoodie"
          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
      </div>

      {/* Description */}
      <div>
        {label('Description *')}
        <textarea
          className="admin-field" required rows={4} placeholder="Describe this piece..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Price + Category */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          {label('Price (DZD) *')}
          <input
            type="number" min="0" className="admin-field" required
            placeholder="0"
            value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          />
        </div>
        <div>
          {label('Category')}
          <select
            className="admin-field"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            {CATS.map(c => (
              <option key={c} value={c} style={{ background: '#111' }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        {label('Tags (comma-separated)')}
        <input
          className="admin-field" placeholder="black, limited, premium"
          value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
        />
      </div>

      {/* Toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[['soldOut','Sold Out'],['featured','Featured']].map(([key, lbl]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
              style={{
                width: 44, height: 22,
                background: form[key] ? 'var(--gold)' : 'var(--steel)',
                border: 'none', borderRadius: 11, cursor: 'none',
                position: 'relative', transition: 'background .3s', flexShrink: 0,
              }}
            >
              <div style={{
                width: 16, height: 16, background: '#000', borderRadius: '50%',
                position: 'absolute', top: 3,
                left: form[key] ? 25 : 3, transition: 'left .3s',
              }} />
            </button>
            <span style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.58rem',
              letterSpacing: '0.12em', color: 'var(--ghost)', textTransform: 'uppercase',
            }}>
              {lbl}
            </span>
          </div>
        ))}
      </div>

      {/* IMAGE UPLOAD — Cloudinary */}
      <div style={{ border: '1px solid var(--blade)', padding: 20 }}>
        <div style={{
          fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
          letterSpacing: '0.2em', color: 'var(--gold)',
          textTransform: 'uppercase', marginBottom: 16,
        }}>
          Images — Cloudinary Upload
        </div>

        {/* Existing uploaded images */}
        {uploadedUrls.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {uploadedUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeExisting(url)}
                  style={{
                    position: 'absolute', top: 2, right: 2,
                    background: 'rgba(200,40,40,0.85)', border: 'none',
                    color: '#fff', width: 18, height: 18, borderRadius: '50%',
                    fontSize: '0.75rem', cursor: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New file picker */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '1px dashed var(--blade)',
            padding: '20px', textAlign: 'center',
            cursor: 'none', marginBottom: 12,
            background: 'rgba(255,255,255,0.02)',
            transition: 'border-color .3s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--blade)'}
        >
          <div style={{
            fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
            letterSpacing: '0.15em', color: 'var(--ash)', textTransform: 'uppercase',
          }}>
            {imageFiles.length > 0
              ? `${imageFiles.length} file(s) selected`
              : 'Click to select images'}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file" accept="image/*" multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />

        {/* Previews */}
        {previews.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {previews.map((src, i) => (
              <img key={i} src={src} alt=""
                style={{ width: 60, height: 60, objectFit: 'cover', opacity: 0.7 }} />
            ))}
          </div>
        )}

        {/* Upload button */}
        {imageFiles.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="btn-gold"
            style={{ fontSize: '0.7rem', padding: '10px 24px' }}
          >
            {uploading ? 'UPLOADING...' : `UPLOAD TO CLOUDINARY (${imageFiles.length})`}
          </button>
        )}

        <div style={{
          marginTop: 12, fontFamily: '"DM Mono", monospace',
          fontSize: '0.5rem', letterSpacing: '0.12em',
          color: 'rgba(85,85,85,0.5)',
        }}>
          Images stored securely via Cloudinary. API secret never exposed to client.
        </div>
      </div>

      {error && (
        <div style={{
          border: '1px solid rgba(200,40,40,0.3)',
          color: 'rgba(200,60,40,0.8)', padding: '12px 16px',
          fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 14 }}>
        <button
          type="submit" disabled={saving} className="btn-gold"
          style={{ fontSize: '0.75rem', padding: '12px 32px' }}
        >
          {saving ? 'SAVING...' : product ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
        </button>
        <button
          type="button" onClick={onCancel} className="btn-outline"
          style={{ fontSize: '0.7rem' }}
        >
          CANCEL
        </button>
      </div>
    </form>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PRODUCT LIST                                               */
/* ════════════════════════════════════════════════════════════ */
function ProductList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 0',
        fontFamily: '"Playfair Display", serif', fontStyle: 'italic',
        fontSize: '1rem', color: 'var(--ash)',
      }}>
        No products yet. Add your first piece.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 2 }}>
      {products.map(p => (
        <div
          key={p._id}
          style={{
            display: 'grid',
            gridTemplateColumns: '72px 1fr auto',
            gap: 20, alignItems: 'center',
            background: 'var(--forge)',
            border: '1px solid var(--steel)',
            padding: '14px 18px',
            transition: 'border-color .3s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--steel)'}
        >
          {/* Thumb */}
          <div style={{ width: 72, height: 72, background: 'var(--iron)', overflow: 'hidden' }}>
            {p.images?.[0] ? (
              <img
                src={p.images[0].startsWith('http') ? p.images[0] : `${API_URL}${p.images[0]}`}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Uncial Antiqua", serif', fontSize: '1.5rem',
                color: 'rgba(212,168,67,0.2)',
              }}>
                V
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{
              fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem',
              letterSpacing: '0.06em', color: '#fff', marginBottom: 4,
            }}>
              {p.name}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '0.9rem', color: 'var(--gold)',
              }}>
                {p.price ? `${Number(p.price).toLocaleString()} DZD` : '—'}
              </span>
              <span style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.52rem',
                color: 'var(--ash)', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>
                {p.category}
              </span>
              {p.soldOut && (
                <span style={{
                  fontFamily: '"DM Mono", monospace', fontSize: '0.5rem',
                  color: 'rgba(200,60,40,0.8)',
                  border: '1px solid rgba(200,60,40,0.3)', padding: '2px 8px',
                  letterSpacing: '0.1em',
                }}>
                  SOLD OUT
                </span>
              )}
              {p.featured && (
                <span style={{
                  fontFamily: '"DM Mono", monospace', fontSize: '0.5rem',
                  color: 'var(--gold)',
                  border: '1px solid rgba(212,168,67,0.3)', padding: '2px 8px',
                  letterSpacing: '0.1em',
                }}>
                  FEATURED
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onEdit(p)} className="btn-gold"
              style={{ fontSize: '0.62rem', padding: '8px 18px' }}
            >
              EDIT
            </button>
            <button
              onClick={() => onDelete(p._id)}
              style={{
                background: 'rgba(200,40,40,0.15)',
                border: '1px solid rgba(200,40,40,0.35)',
                color: 'rgba(200,60,40,0.8)',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '0.7rem', letterSpacing: '0.1em',
                padding: '8px 18px', cursor: 'none',
                transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,40,40,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(200,40,40,0.15)'}
            >
              DELETE
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  DASHBOARD                                                  */
/* ════════════════════════════════════════════════════════════ */
function Dashboard({ token, onLogout }) {
  const [products, setProducts]  = useState([]);
  const [editing,  setEditing]   = useState(null);
  const [showForm, setShowForm]  = useState(false);
  const [tab, setTab]            = useState('products');

  const load = () => {
    fetchProducts({ limit: 200 }).then(d => setProducts(d.products || [])).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    await deleteProduct(id, token);
    load();
  };

  const tabs = ['products', 'add product'];

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: '#000',
        borderRight: '1px solid rgba(212,168,67,0.12)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 0', flexShrink: 0,
      }}>
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(212,168,67,0.1)' }}>
          <div style={{
            fontFamily: '"Uncial Antiqua", serif', fontSize: '1.3rem',
            color: '#fff', marginBottom: 4,
          }}>
            VALIO
          </div>
          <div style={{
            fontFamily: '"DM Mono", monospace', fontSize: '0.5rem',
            letterSpacing: '0.25em', color: 'var(--gold)',
            textTransform: 'uppercase',
          }}>
            Control Panel
          </div>
        </div>

        <nav style={{ flex: 1, padding: '20px 0' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => {
                if (t === 'add product') { setShowForm(true); setEditing(null); setTab('products'); }
                else setTab(t);
              }}
              style={{
                width: '100%', background: tab === t && t !== 'add product'
                  ? 'rgba(212,168,67,0.08)' : 'transparent',
                border: 'none',
                borderLeft: tab === t && t !== 'add product'
                  ? '2px solid var(--gold)' : '2px solid transparent',
                color: tab === t && t !== 'add product' ? 'var(--gold)' : 'var(--ash)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.6rem', letterSpacing: '0.12em',
                padding: '13px 24px', textAlign: 'left',
                cursor: 'none', textTransform: 'uppercase',
                transition: 'all .25s',
              }}
            >
              {t === 'add product' ? '+ Add Product' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0 16px' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', background: 'transparent',
              border: '1px solid rgba(200,40,40,0.25)',
              color: 'rgba(200,60,40,0.6)',
              fontFamily: '"DM Mono", monospace', fontSize: '0.58rem',
              letterSpacing: '0.12em', padding: 10,
              cursor: 'none', textTransform: 'uppercase', transition: 'all .3s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,40,40,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,40,40,0.25)'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          borderBottom: '1px solid rgba(212,168,67,0.1)',
          padding: '22px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h1 style={{
            fontFamily: '"Bebas Neue", sans-serif', fontWeight: 400,
            fontSize: '1.2rem', letterSpacing: '0.1em', color: '#fff',
          }}>
            {showForm ? (editing ? 'Edit Product' : 'Add Product') : 'Products'}
          </h1>
          <div style={{
            fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
            letterSpacing: '0.15em', color: 'var(--ash)',
          }}>
            {products.length} products
          </div>
        </div>

        <div style={{ padding: '36px 40px' }}>
          {tab === 'products' && !showForm && (
            <div>
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-gold"
                  onClick={() => { setShowForm(true); setEditing(null); }}
                  style={{ fontSize: '0.7rem', padding: '10px 24px' }}
                >
                  + ADD PRODUCT
                </button>
              </div>
              <ProductList
                products={products}
                onEdit={p => { setEditing(p); setShowForm(true); }}
                onDelete={handleDelete}
              />
            </div>
          )}

          {showForm && (
            <ProductForm
              product={editing}
              token={token}
              onSaved={() => { setShowForm(false); setEditing(null); load(); }}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PAGE ROOT                                                  */
/* ════════════════════════════════════════════════════════════ */
export default function SecretControlPanel() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('valio_token');
    if (t) setToken(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('valio_token');
    setToken(null);
  };

  return (
    <>
      <Head>
        <title>Control Panel</title>
        {/* Prevent indexing of admin route */}
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {token
        ? <Dashboard token={token} onLogout={handleLogout} />
        : <LoginScreen onAuth={setToken} />
      }
    </>
  );
}
