import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import {
  login, verifyToken, refreshToken,
  fetchAllProductsAdmin, createProduct, updateProduct, deleteProduct,
  fetchSettings, updateSettings,
  fetchAllBackgroundsAdmin, createBackground, updateBackground, deleteBackground,
  fetchOrdersAdmin, fetchOrderStats, updateOrder, deleteOrder,
} from '../../lib/api';
import CloudinaryUploader from '../../components/ui/CloudinaryUploader';

/* ────────────────────────────────────────────────────────────── */
/*  CONSTANTS                                                      */
/* ────────────────────────────────────────────────────────────── */

const CATEGORIES = ['hoodies', 't-shirts', 'compression', 'outerwear', 'accessories', 'other'];
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:   { bg: 'rgba(212,168,67,0.12)',  color: '#d4a843' },
  confirmed: { bg: 'rgba(100,180,100,0.12)', color: '#64b464' },
  shipped:   { bg: 'rgba(100,160,220,0.12)', color: '#64a0dc' },
  delivered: { bg: 'rgba(150,100,220,0.12)', color: '#9664dc' },
  cancelled: { bg: 'rgba(224,85,85,0.12)',   color: '#e05555' },
};

const TABS = [
  { id: 'overview',     label: 'Overview',    icon: '◈' },
  { id: 'products',     label: 'Products',    icon: '▣' },
  { id: 'orders',       label: 'Orders',      icon: '◎' },
  { id: 'backgrounds',  label: 'Backgrounds', icon: '◉' },
  { id: 'settings',     label: 'Settings',    icon: '⚙' },
];

/* ────────────────────────────────────────────────────────────── */
/*  HELPERS                                                        */
/* ────────────────────────────────────────────────────────────── */

function Spinner({ size = 20 }) {
  return (
    <span style={{
      display:      'inline-block',
      width:        size, height: size,
      border:       `2px solid #333`,
      borderTop:    `2px solid #d4a843`,
      borderRadius: '50%',
      animation:    'spin 0.7s linear infinite',
      flexShrink:   0,
    }} />
  );
}

function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const bg = type === 'error' ? 'rgba(224,85,85,0.15)' : 'rgba(212,168,67,0.12)';
  const cl = type === 'error' ? '#e05555' : '#d4a843';
  const br = type === 'error' ? 'rgba(224,85,85,0.3)' : 'rgba(212,168,67,0.25)';
  return (
    <div style={{
      position:      'fixed', bottom: '32px', right: '32px',
      zIndex:         99999,
      background:     bg, border: `1px solid ${br}`,
      color:          cl,
      fontFamily:    '"DM Mono",monospace', fontSize: '0.75rem',
      letterSpacing: '0.1em',
      padding:        '14px 22px',
      maxWidth:       '380px',
      animation:      'slideUp 0.35s ease both',
      boxShadow:      '0 8px 40px rgba(0,0,0,0.8)',
    }}>
      {message}
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position:   'fixed', inset: 0, zIndex: 99990,
      background: 'rgba(0,0,0,0.85)',
      display:    'flex', alignItems: 'center', justifyContent: 'center',
      padding:    '24px',
    }}>
      <div style={{
        background: '#0c0c0c', border: '1px solid #2a2a2a',
        padding:    '40px', maxWidth: '420px', width: '100%',
      }}>
        <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '28px', fontFamily: '"DM Sans",sans-serif' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel}>
            CANCEL
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, background: '#e05555', border: 'none', color: '#fff',
            fontFamily: '"Bebas Neue",sans-serif', fontSize: '0.95rem',
            letterSpacing: '0.12em', padding: '14px', cursor: 'none',
          }}>
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  PRODUCT FORM MODAL                                            */
/* ────────────────────────────────────────────────────────────── */

function ProductModal({ token, product, onSave, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    price:       product?.price       || '',
    category:    product?.category    || 'other',
    sizes:       product?.sizes?.join(', ')  || '',
    tags:        product?.tags?.join(', ')   || '',
    stock:       product?.stock       || '',
    soldOut:     product?.soldOut     || false,
    featured:    product?.featured    || false,
    visible:     product?.visible     !== false ? true : false,
  });
  const [images,  setImages]  = useState(product?.images || []);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const set = field => e => setForm(f => ({
    ...f,
    [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  function addImage(url) {
    setImages(prev => [...prev, url]);
  }
  function removeImage(url) {
    setImages(prev => prev.filter(u => u !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || form.price === '') {
      setError('Name, description and price are required'); return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('imageUrls', JSON.stringify(images));

      if (isEdit) {
        await updateProduct(token, product._id, fd);
      } else {
        await createProduct(token, fd);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position:   'fixed', inset: 0, zIndex: 99980,
      background: 'rgba(0,0,0,0.9)',
      overflowY:  'auto',
      padding:    '40px 20px',
      display:    'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#0c0c0c', border: '1px solid #2a2a2a',
        width:      '100%', maxWidth: '700px',
        padding:    '40px',
        alignSelf:  'flex-start',
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.6rem', color: '#e8e8e8', letterSpacing: '0.1em' }}>
            {isEdit ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: '1.5rem', lineHeight: 1 }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)', color: '#e05555', padding: '12px 16px', marginBottom: '24px', fontFamily: '"DM Mono",monospace', fontSize: '0.75rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input className="admin-field" value={form.name} onChange={set('name')} required />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description *</label>
            <textarea className="admin-field" rows={4} value={form.description} onChange={set('description')}
              required style={{ resize: 'vertical' }} />
          </div>

          {/* Price + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Price (DZD) *</label>
              <input className="admin-field" type="number" min="0" step="1" value={form.price} onChange={set('price')} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select className="admin-field" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Sizes + Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Sizes (comma-separated)</label>
              <input className="admin-field" value={form.sizes} onChange={set('sizes')} placeholder="XS, S, M, L, XL" />
            </div>
            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input className="admin-field" value={form.tags} onChange={set('tags')} placeholder="black, oversized, logo" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label style={labelStyle}>Stock Count (optional)</label>
            <input className="admin-field" type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="Leave blank for unlimited" />
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {[
              { field: 'soldOut',  label: 'Sold Out' },
              { field: 'featured', label: 'Featured' },
              { field: 'visible',  label: 'Visible' },
            ].map(({ field, label }) => (
              <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'none' }}>
                <input type="checkbox" checked={form[field]} onChange={set(field)}
                  style={{ width: '16px', height: '16px', accentColor: '#d4a843' }} />
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase' }}>
                  {label}
                </span>
              </label>
            ))}
          </div>

          {/* Images */}
          <div>
            <label style={labelStyle}>Product Images</label>
            <CloudinaryUploader
              token={token}
              folder="valio/products"
              onUpload={addImage}
              onError={msg => setError(msg)}
            />
            {/* Image previews */}
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                {images.map((url, i) => (
                  <div key={url + i} style={{ position: 'relative', width: '80px', height: '100px' }}>
                    <img src={url} alt={`Image ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button type="button" onClick={() => removeImage(url)}
                      style={{
                        position:   'absolute', top: '4px', right: '4px',
                        background: 'rgba(0,0,0,0.8)', border: 'none',
                        color:      '#e05555', width: '20px', height: '20px',
                        fontSize:   '0.7rem', lineHeight: '20px',
                        display:    'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      ×
                    </button>
                    {i === 0 && (
                      <div style={{
                        position:   'absolute', bottom: '4px', left: '4px',
                        background: 'rgba(212,168,67,0.9)', color: '#000',
                        fontFamily: '"DM Mono",monospace', fontSize: '0.5rem',
                        padding:    '2px 5px', letterSpacing: '0.1em',
                      }}>
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn-gold" style={{ flex: 2, justifyContent: 'center' }} disabled={saving}>
              {saving ? <><Spinner size={16} /> SAVING…</> : (isEdit ? 'SAVE CHANGES' : 'CREATE PRODUCT')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  OVERVIEW TAB                                                   */
/* ────────────────────────────────────────────────────────────── */

function OverviewTab({ token }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderStats(token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const cards = stats ? [
    { label: 'Total Orders',    value: stats.total,     color: '#d4a843' },
    { label: 'Pending',         value: stats.pending,   color: '#d4a843' },
    { label: 'Shipped',         value: stats.shipped,   color: '#64a0dc' },
    { label: 'Delivered',       value: stats.delivered, color: '#64b464' },
    { label: 'Cancelled',       value: stats.cancelled, color: '#e05555' },
    { label: 'Revenue (Active)',value: `${(stats.revenue || 0).toLocaleString()} DZD`, color: '#9664dc' },
  ] : [];

  return (
    <div>
      <h2 style={sectionTitle}>Overview</h2>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555' }}>
          <Spinner /> Loading stats…
        </div>
      ) : (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap:                 '2px',
          marginBottom:        '48px',
        }}>
          {cards.map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#0c0c0c',
              border:     '1px solid #1a1a1a',
              padding:    '28px 24px',
            }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase', marginBottom: '12px' }}>
                {label}
              </p>
              <p style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '2.2rem', color, letterSpacing: '0.05em', lineHeight: 1 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: '28px', background: '#080808', border: '1px solid #1a1a1a' }}>
        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', color: '#555', lineHeight: 1.9 }}>
          VALIO Admin v4 — All data saved to MongoDB. Media hosted on Cloudinary.
          <br />Use the sidebar to manage products, orders, and site settings.
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  PRODUCTS TAB                                                   */
/* ────────────────────────────────────────────────────────────── */

function ProductsTab({ token, onToast }) {
  const [products,  setProducts]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [modal,     setModal]     = useState(null);   // null | 'new' | product object
  const [confirm,   setConfirm]   = useState(null);   // product to delete

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllProductsAdmin(token, {
        category: catFilter !== 'all' ? catFilter : undefined,
        limit: 200,
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, catFilter, onToast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(product) {
    try {
      await deleteProduct(token, product._id);
      onToast(`"${product.name}" deleted`);
      load();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setConfirm(null);
    }
  }

  async function handleToggle(product, field) {
    try {
      const fd = new FormData();
      fd.append(field, !product[field]);
      await updateProduct(token, product._id, fd);
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, [field]: !p[field] } : p));
      onToast(`${field} updated`);
    } catch (err) {
      onToast(err.message, 'error');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <h2 style={sectionTitle}>Products <span style={{ color: '#555', fontSize: '1rem' }}>({total})</span></h2>
        <button className="btn-gold" onClick={() => setModal('new')}>
          + NEW PRODUCT
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #1a1a1a', marginBottom: '24px', overflowX: 'auto' }}>
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            background:    'none', border: 'none',
            borderBottom:  catFilter === c ? '2px solid #d4a843' : '2px solid transparent',
            color:         catFilter === c ? '#d4a843' : '#555',
            fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
            letterSpacing: '0.15em', padding: '12px 18px',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
            transition:    'color 0.2s ease',
          }}>
            {c === 'all' ? 'ALL' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555', padding: '40px 0' }}>
          <Spinner /> Loading products…
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase' }}>
            No products
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {products.map(product => (
            <div key={product._id} style={{
              display:     'grid',
              gridTemplateColumns: '56px 1fr auto',
              gap:         '16px',
              alignItems:  'center',
              background:  '#0c0c0c',
              border:      '1px solid #161616',
              padding:     '12px 16px',
              transition:  'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#161616'}
            >
              {/* Thumbnail */}
              <div style={{ width: '56px', height: '70px', background: '#111', overflow: 'hidden', flexShrink: 0 }}>
                {product.images?.[0] && (
                  <img src={product.images[0]} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 500, fontSize: '0.88rem', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                  </span>
                  {!product.visible && <Badge color="#555">Hidden</Badge>}
                  {product.soldOut  && <Badge color="#e05555">Sold Out</Badge>}
                  {product.featured && <Badge color="#d4a843">Featured</Badge>}
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={metaStyle}>{product.category}</span>
                  <span style={{ ...metaStyle, color: '#d4a843' }}>{product.price.toLocaleString()} DZD</span>
                  {product.images?.length > 0 && <span style={metaStyle}>{product.images.length} image{product.images.length !== 1 ? 's' : ''}</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <AdminBtn onClick={() => handleToggle(product, 'visible')} title={product.visible ? 'Hide' : 'Show'}>
                  {product.visible ? '👁' : '🚫'}
                </AdminBtn>
                <AdminBtn onClick={() => handleToggle(product, 'featured')} title={product.featured ? 'Unfeature' : 'Feature'}>
                  {product.featured ? '★' : '☆'}
                </AdminBtn>
                <AdminBtn onClick={() => setModal(product)}>EDIT</AdminBtn>
                <AdminBtn onClick={() => setConfirm(product)} danger>DEL</AdminBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <ProductModal
          token={token}
          product={modal === 'new' ? null : modal}
          onSave={() => { setModal(null); load(); onToast('Product saved!'); }}
          onClose={() => setModal(null)}
        />
      )}
      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  ORDERS TAB                                                     */
/* ────────────────────────────────────────────────────────────── */

function OrdersTab({ token, onToast }) {
  const [orders,     setOrders]     = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search,     setSearch]     = useState('');
  const [expanded,   setExpanded]   = useState(null);
  const [confirm,    setConfirm]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrdersAdmin(token, {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        limit: 100,
      });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, search, onToast]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrder(token, orderId, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      onToast(`Order status → ${status}`);
    } catch (err) {
      onToast(err.message, 'error');
    }
  }

  async function handleDelete(order) {
    try {
      await deleteOrder(token, order._id);
      setOrders(prev => prev.filter(o => o._id !== order._id));
      setTotal(t => t - 1);
      onToast(`Order ${order.ref} deleted`);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <h2 style={sectionTitle}>Orders <span style={{ color: '#555', fontSize: '1rem' }}>({total})</span></h2>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          className="admin-field"
          placeholder="Search by ref, name, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
        <select className="admin-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ maxWidth: '180px' }}>
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: '24px', overflowX: 'auto' }}>
        {['all', ...ORDER_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            background:    'none', border: 'none',
            borderBottom:  statusFilter === s ? `2px solid ${STATUS_COLORS[s]?.color || '#d4a843'}` : '2px solid transparent',
            color:         statusFilter === s ? (STATUS_COLORS[s]?.color || '#d4a843') : '#555',
            fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
            letterSpacing: '0.15em', padding: '12px 18px',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
            transition:    'color 0.2s ease',
          }}>
            {s === 'all' ? 'ALL' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555', padding: '40px 0' }}>
          <Spinner /> Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase' }}>
            No orders found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || {};
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} style={{ background: '#0c0c0c', border: '1px solid #161616' }}>
                {/* Row */}
                <div style={{
                  display:     'grid',
                  gridTemplateColumns: '1fr auto',
                  gap:         '16px',
                  alignItems:  'center',
                  padding:     '14px 16px',
                  cursor:      'none',
                }}
                onClick={() => setExpanded(isOpen ? null : order._id)}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', color: '#d4a843', letterSpacing: '0.1em' }}>
                        {order.ref}
                      </span>
                      <span style={{
                        background:    sc.bg, color: sc.color,
                        fontFamily:    '"DM Mono",monospace', fontSize: '0.55rem',
                        letterSpacing: '0.15em', padding: '3px 8px',
                        textTransform: 'uppercase',
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={metaStyle}>{order.customer.name}</span>
                      <span style={metaStyle}>{order.customer.email}</span>
                      {order.customer.phone && <span style={metaStyle}>{order.customer.phone}</span>}
                      <span style={{ ...metaStyle, color: '#d4a843' }}>{order.total.toLocaleString()} DZD</span>
                      <span style={metaStyle}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span style={{ color: '#555', fontSize: '0.8rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}>▶</span>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid #1a1a1a', padding: '20px 16px' }}>
                    {/* Customer info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                      {[
                        ['Name',    order.customer.name],
                        ['Email',   order.customer.email],
                        ['Phone',   order.customer.phone  || '—'],
                        ['Wilaya',  order.customer.wilaya  || '—'],
                        ['Address', order.customer.address || '—'],
                      ].map(([lbl, val]) => (
                        <div key={lbl}>
                          <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>{lbl}</p>
                          <p style={{ fontSize: '0.82rem', color: '#ccc' }}>{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Line items */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase', marginBottom: '10px' }}>Items</p>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #111' }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: '44px', height: '55px', objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.82rem', color: '#ccc', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.65rem', color: '#888' }}>
                              {item.size ? `Size: ${item.size} · ` : ''}Qty: {item.quantity} · {(item.price * item.quantity).toLocaleString()} DZD
                            </p>
                          </div>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.9rem', color: '#d4a843' }}>
                          Total: {order.total.toLocaleString()} DZD
                        </span>
                      </div>
                    </div>

                    {/* Status change */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase' }}>Change Status:</p>
                      {ORDER_STATUSES.map(s => (
                        <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusChange(order._id, s); }}
                          style={{
                            background:    order.status === s ? (STATUS_COLORS[s]?.bg || 'transparent') : 'transparent',
                            border:        `1px solid ${order.status === s ? (STATUS_COLORS[s]?.color || '#555') : '#333'}`,
                            color:         order.status === s ? (STATUS_COLORS[s]?.color || '#ccc') : '#555',
                            fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
                            letterSpacing: '0.1em', padding: '7px 14px',
                            textTransform: 'uppercase', transition: 'all 0.2s ease',
                          }}>
                          {s}
                        </button>
                      ))}
                      <button onClick={(e) => { e.stopPropagation(); setConfirm(order); }}
                        style={{
                          marginLeft:    'auto',
                          background:    'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.25)',
                          color:         '#e05555', fontFamily: '"DM Mono",monospace',
                          fontSize:      '0.6rem', letterSpacing: '0.1em', padding: '7px 14px',
                          textTransform: 'uppercase',
                        }}>
                        DELETE ORDER
                      </button>
                    </div>

                    {order.notes && (
                      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a' }}>
                        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }}>Customer Note</p>
                        <p style={{ fontSize: '0.82rem', color: '#888' }}>{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message={`Delete order ${confirm.ref}? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  BACKGROUNDS TAB                                               */
/* ────────────────────────────────────────────────────────────── */

function BackgroundsTab({ token, onToast }) {
  const [bgs,     setBgs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [newUrls, setNewUrls] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBackgroundsAdmin(token);
      setBgs(data.backgrounds || []);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, onToast]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (newUrls.length === 0) { onToast('Upload at least one image first', 'error'); return; }
    try {
      for (const { url, public_id } of newUrls) {
        await createBackground(token, { url, public_id, order: bgs.length });
      }
      setNewUrls([]);
      onToast(`${newUrls.length} background(s) added`);
      load();
    } catch (err) {
      onToast(err.message, 'error');
    }
  }

  async function handleToggle(bg) {
    try {
      await updateBackground(token, bg._id, { active: !bg.active });
      setBgs(prev => prev.map(b => b._id === bg._id ? { ...b, active: !b.active } : b));
      onToast(`Background ${!bg.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      onToast(err.message, 'error');
    }
  }

  async function handleDelete(bg) {
    try {
      await deleteBackground(token, bg._id);
      setBgs(prev => prev.filter(b => b._id !== bg._id));
      onToast('Background deleted');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div>
      <h2 style={sectionTitle}>Shop Backgrounds</h2>
      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', color: '#555', marginBottom: '28px', lineHeight: 1.7 }}>
        These images cycle as the hero background on the homepage.
        Upload via Cloudinary below, then click "Add to Site".
      </p>

      {/* Upload + Add */}
      <div style={{ marginBottom: '32px', padding: '24px', background: '#080808', border: '1px solid #1a1a1a' }}>
        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>
          Upload New Backgrounds
        </p>
        <CloudinaryUploader
          token={token}
          folder="valio/backgrounds"
          onUpload={(url, public_id) => setNewUrls(prev => [...prev, { url, public_id }])}
          onError={msg => onToast(msg, 'error')}
        />
        {newUrls.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.65rem', color: '#888', marginBottom: '12px' }}>
              {newUrls.length} image(s) ready to add:
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {newUrls.map(({ url }, i) => (
                <div key={i} style={{ width: '80px', height: '100px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-gold" onClick={handleAdd}>
                ADD {newUrls.length} TO SITE
              </button>
              <button className="btn-outline" onClick={() => setNewUrls([])}>
                CLEAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Existing backgrounds */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555' }}>
          <Spinner /> Loading…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2px' }}>
          {bgs.map(bg => (
            <div key={bg._id} style={{ position: 'relative', background: '#0c0c0c', border: '1px solid #161616', overflow: 'hidden' }}>
              <div style={{ aspectRatio: '9/16', overflow: 'hidden' }}>
                <img src={bg.url} alt={bg.label || 'Background'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: bg.active ? 1 : 0.3, transition: 'opacity 0.3s' }} />
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    background:    bg.active ? 'rgba(100,180,100,0.12)' : 'rgba(85,85,85,0.12)',
                    color:         bg.active ? '#64b464' : '#555',
                    border:        `1px solid ${bg.active ? 'rgba(100,180,100,0.3)' : '#2a2a2a'}`,
                    fontFamily:    '"DM Mono",monospace', fontSize: '0.55rem',
                    letterSpacing: '0.15em', padding: '3px 8px',
                    textTransform: 'uppercase',
                  }}>
                    {bg.active ? 'Active' : 'Hidden'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <AdminBtn onClick={() => handleToggle(bg)} title={bg.active ? 'Deactivate' : 'Activate'}>
                      {bg.active ? '🚫' : '✓'}
                    </AdminBtn>
                    <AdminBtn onClick={() => setConfirm(bg)} danger>DEL</AdminBtn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmModal
          message="Delete this background image from the site?"
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  SETTINGS TAB                                                   */
/* ────────────────────────────────────────────────────────────── */

function SettingsTab({ token, onToast }) {
  const [settings, setSettings] = useState({
    siteName:            'VALIO',
    tagline:             'Made for Legacy',
    contactEmail:        '',
    shippingNote:        '',
    announcementBar:     '',
    announcementEnabled: false,
    maintenanceMode:     false,
    introEnabled:        true,
    introOpacity:        0.6,
    introImgWidth:       '100%',
    introImgHeight:      '100%',
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetchSettings()
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(err => onToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [onToast]);

  const set = field => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? Number(e.target.value)
      : e.target.value;
    setSettings(prev => ({ ...prev, [field]: val }));
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(token, settings);
      onToast('Settings saved!');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555', padding: '40px 0' }}>
        <Spinner /> Loading settings…
      </div>
    );
  }

  return (
    <div>
      <h2 style={sectionTitle}>Site Settings</h2>
      <form onSubmit={handleSave} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* General */}
        <Section label="General">
          <FieldRow label="Site Name">
            <input className="admin-field" value={settings.siteName || ''} onChange={set('siteName')} />
          </FieldRow>
          <FieldRow label="Tagline">
            <input className="admin-field" value={settings.tagline || ''} onChange={set('tagline')} />
          </FieldRow>
          <FieldRow label="Contact Email">
            <input className="admin-field" type="email" value={settings.contactEmail || ''} onChange={set('contactEmail')} />
          </FieldRow>
          <FieldRow label="Shipping Note">
            <input className="admin-field" value={settings.shippingNote || ''} onChange={set('shippingNote')} />
          </FieldRow>
        </Section>

        {/* Announcement bar */}
        <Section label="Announcement Bar">
          <FieldRow label="Message">
            <input className="admin-field" value={settings.announcementBar || ''} onChange={set('announcementBar')} />
          </FieldRow>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={!!settings.announcementEnabled} onChange={set('announcementEnabled')}
              style={{ width: '16px', height: '16px', accentColor: '#d4a843' }} />
            <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase' }}>
              Show Announcement Bar
            </span>
          </label>
        </Section>

        {/* Maintenance */}
        <Section label="Site Status">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" checked={!!settings.maintenanceMode} onChange={set('maintenanceMode')}
              style={{ width: '16px', height: '16px', accentColor: '#e05555' }} />
            <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase' }}>
              Maintenance Mode (site hidden from visitors)
            </span>
          </label>
        </Section>

        {/* Hero intro */}
        <Section label="Hero Image Settings">
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <input type="checkbox" checked={!!settings.introEnabled} onChange={set('introEnabled')}
              style={{ width: '16px', height: '16px', accentColor: '#d4a843' }} />
            <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase' }}>
              Enable Hero Background Slider
            </span>
          </label>
          <FieldRow label="Overlay Opacity (0–1)">
            <input className="admin-field" type="number" step="0.05" min="0" max="1"
              value={settings.introOpacity || 0.6} onChange={set('introOpacity')} />
          </FieldRow>
        </Section>

        <button type="submit" className="btn-gold" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? <><Spinner size={16} /> SAVING…</> : 'SAVE SETTINGS'}
        </button>
      </form>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  SMALL SHARED COMPONENTS                                        */
/* ────────────────────────────────────────────────────────────── */

const labelStyle = {
  display:       'block',
  fontFamily:    '"DM Mono",monospace',
  fontSize:      '0.6rem',
  letterSpacing: '0.15em',
  color:         '#555',
  textTransform: 'uppercase',
  marginBottom:  '8px',
};

const sectionTitle = {
  fontFamily:    '"Bebas Neue",sans-serif',
  fontSize:      '1.8rem',
  color:         '#e8e8e8',
  letterSpacing: '0.08em',
  marginBottom:  '28px',
};

const metaStyle = {
  fontFamily:    '"DM Mono",monospace',
  fontSize:      '0.65rem',
  color:         '#555',
  letterSpacing: '0.1em',
};

function Badge({ color, children }) {
  return (
    <span style={{
      background:    `${color}20`,
      color,
      border:        `1px solid ${color}50`,
      fontFamily:    '"DM Mono",monospace',
      fontSize:      '0.55rem',
      letterSpacing: '0.12em',
      padding:       '2px 7px',
      textTransform: 'uppercase',
      flexShrink:    0,
    }}>
      {children}
    </span>
  );
}

function AdminBtn({ onClick, children, danger = false, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background:    danger ? 'rgba(224,85,85,0.08)' : 'rgba(255,255,255,0.04)',
        border:        `1px solid ${danger ? 'rgba(224,85,85,0.2)' : '#2a2a2a'}`,
        color:         danger ? '#e05555' : '#888',
        fontFamily:    '"DM Mono",monospace',
        fontSize:      '0.6rem',
        letterSpacing: '0.1em',
        padding:       '7px 12px',
        textTransform: 'uppercase',
        transition:    'all 0.2s ease',
        whiteSpace:    'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color       = danger ? '#ff6666' : '#ccc';
        e.currentTarget.style.borderColor = danger ? 'rgba(224,85,85,0.5)' : '#555';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color       = danger ? '#e05555' : '#888';
        e.currentTarget.style.borderColor = danger ? 'rgba(224,85,85,0.2)' : '#2a2a2a';
      }}
    >
      {children}
    </button>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ background: '#080808', border: '1px solid #1a1a1a', padding: '24px' }}>
      <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '20px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  LOGIN SCREEN                                                   */
/* ────────────────────────────────────────────────────────────── */

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password.trim()) { setError('Password required'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await login(password);
      localStorage.setItem('valio_admin_token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:  '100vh',
      background: '#000',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding:    '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <h1 className="font-gothic" style={{
          fontSize:      '3rem',
          color:         '#d4a843',
          textAlign:     'center',
          marginBottom:  '8px',
          textShadow:    '0 0 40px rgba(212,168,67,0.4)',
        }}>
          VALIO
        </h1>
        <p style={{
          fontFamily:    '"DM Mono",monospace',
          fontSize:      '0.6rem',
          letterSpacing: '0.3em',
          color:         '#555',
          textAlign:     'center',
          textTransform: 'uppercase',
          marginBottom:  '48px',
        }}>
          Admin Panel
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Admin Password</label>
            <input
              type="password"
              className="admin-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              placeholder="Enter password…"
            />
          </div>
          {error && (
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', color: '#e05555' }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-gold" style={{ justifyContent: 'center' }} disabled={loading}>
            {loading ? <><Spinner size={16} /> AUTHENTICATING…</> : 'ENTER PANEL'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  MAIN ADMIN PAGE                                               */
/* ────────────────────────────────────────────────────────────── */

export default function AdminPage() {
  const [token,   setToken]   = useState(null);
  const [tab,     setTab]     = useState('overview');
  const [toast,   setToast]   = useState(null);
  const refreshTimer = useRef(null);

  // On mount: check localStorage for token and verify it
  useEffect(() => {
    const saved = localStorage.getItem('valio_admin_token');
    if (!saved) return;
    verifyToken(saved)
      .then(data => { if (data.valid) setToken(saved); })
      .catch(() => localStorage.removeItem('valio_admin_token'));
  }, []);

  // Auto-refresh token every 10 hours (before 12h expiry)
  useEffect(() => {
    if (!token) return;
    refreshTimer.current = setInterval(async () => {
      try {
        const data = await refreshToken(token);
        localStorage.setItem('valio_admin_token', data.token);
        setToken(data.token);
      } catch {
        handleLogout();
      }
    }, 10 * 60 * 60 * 1000);
    return () => clearInterval(refreshTimer.current);
  }, [token]);

  function handleLogout() {
    localStorage.removeItem('valio_admin_token');
    setToken(null);
    clearInterval(refreshTimer.current);
  }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  if (!token) return <LoginScreen onLogin={setToken} />;

  return (
    <>
      <Head>
        <title>Admin — VALIO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#000', display: 'flex' }}>
        {/* ── Sidebar ── */}
        <aside className="admin-sidebar" style={{
          width:       '220px',
          flexShrink:  0,
          background:  '#060606',
          borderRight: '1px solid #111',
          display:     'flex',
          flexDirection: 'column',
          position:    'sticky',
          top:         0,
          height:      '100vh',
          overflowY:   'auto',
        }}>
          {/* Logo */}
          <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid #111' }}>
            <h1 className="font-gothic" style={{ fontSize: '1.4rem', color: '#d4a843', marginBottom: '4px' }}>VALIO</h1>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: '#333', textTransform: 'uppercase' }}>
              Admin Panel
            </p>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '20px 0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display:       'flex',
                alignItems:    'center',
                gap:           '12px',
                width:         '100%',
                background:    tab === t.id ? 'rgba(212,168,67,0.07)' : 'none',
                border:        'none',
                borderLeft:    `3px solid ${tab === t.id ? '#d4a843' : 'transparent'}`,
                color:         tab === t.id ? '#d4a843' : '#555',
                fontFamily:    '"DM Mono",monospace',
                fontSize:      '0.65rem',
                letterSpacing: '0.15em',
                padding:       '13px 24px',
                textAlign:     'left',
                textTransform: 'uppercase',
                transition:    'all 0.2s ease',
              }}
              onMouseEnter={e => { if (tab !== t.id) { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
              onMouseLeave={e => { if (tab !== t.id) { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'none'; } }}
              >
                <span style={{ fontSize: '0.9rem' }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: '20px 24px', borderTop: '1px solid #111' }}>
            <button onClick={handleLogout} style={{
              background:    'none', border: '1px solid #1a1a1a',
              color:         '#333', fontFamily: '"DM Mono",monospace',
              fontSize:      '0.6rem', letterSpacing: '0.15em',
              padding:       '10px 16px', width: '100%', textAlign: 'center',
              textTransform: 'uppercase', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e05555'; e.currentTarget.style.borderColor = 'rgba(224,85,85,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#333';    e.currentTarget.style.borderColor = '#1a1a1a'; }}
            >
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowX: 'hidden', padding: 'clamp(28px,4vw,48px) clamp(20px,4vw,48px)' }}>
          {/* Mobile header */}
          <div style={{ display: 'none', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }} className="mobile-header">
            <h1 className="font-gothic" style={{ fontSize: '1.2rem', color: '#d4a843' }}>VALIO Admin</h1>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#555', fontFamily: '"DM Mono",monospace', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
              LOGOUT
            </button>
          </div>

          {/* Mobile tab selector */}
          <div style={{ marginBottom: '24px', overflowX: 'auto' }} className="mobile-tabs">
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  background:    'none', border: 'none',
                  borderBottom:  tab === t.id ? '2px solid #d4a843' : '2px solid transparent',
                  color:         tab === t.id ? '#d4a843' : '#555',
                  fontFamily:    '"DM Mono",monospace', fontSize: '0.55rem',
                  letterSpacing: '0.1em', padding: '10px 14px',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === 'overview'    && <OverviewTab    token={token} onToast={showToast} />}
          {tab === 'products'    && <ProductsTab    token={token} onToast={showToast} />}
          {tab === 'orders'      && <OrdersTab      token={token} onToast={showToast} />}
          {tab === 'backgrounds' && <BackgroundsTab token={token} onToast={showToast} />}
          {tab === 'settings'    && <SettingsTab    token={token} onToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .admin-sidebar  { display: none !important; }
          .mobile-header  { display: flex !important; }
          .mobile-tabs    { display: block !important; }
        }
        @media (min-width: 901px) {
          .mobile-header  { display: none !important; }
          .mobile-tabs    { display: none !important; }
        }
      `}</style>
    </>
  );
}
