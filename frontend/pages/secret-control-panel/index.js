/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import {
  adminLogin,
  fetchProducts,
  deleteProduct,
  uploadToCloudinary,
  fetchAllBackgrounds,
  addBackground,
  deleteBackground,
  patchBackground,
  fetchSettings,
  saveSettings,
} from '../../lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CATS = ['hoodies', 't-shirts', 'compression', 'outerwear', 'other'];

/* ─── UI ATOMS ──────────────────────────────────────────────── */
function Lbl({ children }) {
  return (
    <label style={{
      display: 'block', fontFamily: '"DM Mono",monospace',
      fontSize: '0.55rem', letterSpacing: '0.2em',
      color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8,
    }}>{children}</label>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 22,
          background: value ? 'var(--gold)' : 'var(--steel)',
          border: 'none', borderRadius: 11, cursor: 'none',
          position: 'relative', transition: 'background .3s', flexShrink: 0,
        }}
      >
        <div style={{
          width: 16, height: 16, background: '#000', borderRadius: '50%',
          position: 'absolute', top: 3,
          left: value ? 25 : 3, transition: 'left .3s',
        }} />
      </button>
      {label && (
        <span style={{
          fontFamily: '"DM Mono",monospace', fontSize: '0.58rem',
          letterSpacing: '0.12em', color: 'var(--ghost)', textTransform: 'uppercase',
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      border: '1px solid rgba(200,40,40,0.3)', color: 'rgba(210,70,50,0.9)',
      padding: '12px 16px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.85rem', marginTop: 8,
    }}>
      {msg}
    </div>
  );
}

function OkBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      border: '1px solid rgba(40,180,80,0.3)', color: 'rgba(60,200,100,0.9)',
      padding: '12px 16px', fontFamily: '"DM Sans",sans-serif', fontSize: '0.85rem', marginTop: 8,
    }}>
      {msg}
    </div>
  );
}

function Spin() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{
        width: 28, height: 28,
        border: '1px solid var(--steel)', borderTop: '1px solid var(--gold)',
        borderRadius: '50%', animation: 'spin .8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── CLOUDINARY UPLOADER ───────────────────────────────────── */
function Uploader({ onUploaded }) {
  const [files, setFiles]       = useState([]);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');
  const ref = useRef(null);

  const pick = (e) => {
    const arr = Array.from(e.target.files);
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
    setErr('');
  };

  const go = async () => {
    if (!files.length) return;
    setBusy(true);
    setErr('');
    try {
      const results = await Promise.all(files.map((f) => uploadToCloudinary(f)));
      onUploaded(results);
      setFiles([]);
      setPreviews([]);
      if (ref.current) ref.current.value = '';
    } catch (e) {
      setErr(e.message || 'Upload failed — check CLOUDINARY env vars in .env.local');
    }
    setBusy(false);
  };

  return (
    <div style={{ border: '1px solid var(--blade)', padding: 18 }}>
      <div
        onClick={() => ref.current && ref.current.click()}
        style={{
          border: '1px dashed var(--blade)', padding: '18px',
          textAlign: 'center', cursor: 'none', marginBottom: 10,
          background: 'rgba(255,255,255,0.02)', transition: 'border-color .3s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--blade)'; }}
      >
        <span style={{
          fontFamily: '"DM Mono",monospace', fontSize: '0.58rem',
          letterSpacing: '0.15em', color: 'var(--ash)', textTransform: 'uppercase',
        }}>
          {files.length ? `${files.length} file(s) selected` : 'Click to select images'}
        </span>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple onChange={pick} style={{ display: 'none' }} />

      {previews.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {previews.map((src, i) => (
            <img key={i} src={src} alt="" style={{ width: 60, height: 60, objectFit: 'cover', opacity: 0.75 }} />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button type="button" onClick={go} disabled={busy} className="btn-gold"
          style={{ fontSize: '0.68rem', padding: '10px 24px', marginTop: 4 }}>
          {busy ? 'UPLOADING…' : `UPLOAD TO CLOUDINARY (${files.length})`}
        </button>
      )}
      <ErrBox msg={err} />
      <div style={{
        marginTop: 10, fontFamily: '"DM Mono",monospace',
        fontSize: '0.48rem', letterSpacing: '0.12em', color: 'rgba(85,85,85,0.5)',
      }}>
        Stored securely via Cloudinary · API secret never leaves the server
      </div>
    </div>
  );
}

/* ─── PRODUCT FORM ──────────────────────────────────────────── */
function ProductForm({ product, token, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name:        product ? product.name        : '',
    description: product ? product.description : '',
    price:       product ? String(product.price || '') : '',
    category:    product ? (product.category || 'hoodies') : 'hoodies',
    soldOut:     product ? !!product.soldOut  : false,
    featured:    product ? !!product.featured : false,
    tags:        product && product.tags ? product.tags.join(', ') : '',
  });
  const [urls, setUrls]     = useState(product && product.images ? product.images : []);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('description', form.description);
      fd.append('price',       form.price);
      fd.append('category',    form.category);
      fd.append('soldOut',     String(form.soldOut));
      fd.append('featured',    String(form.featured));
      fd.append('tags',        form.tags);
      fd.append('imageUrls',   JSON.stringify(urls));

      const url    = product ? `${API_URL}/api/products/${product._id}` : `${API_URL}/api/products`;
      const method = product ? 'PATCH' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!r.ok) {
        const j = await r.json();
        throw new Error(j.error || 'Save failed');
      }
      onSaved();
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  };

  const removeUrl = (u) => setUrls((a) => a.filter((x) => x !== u));

  return (
    <form onSubmit={submit} style={{ maxWidth: 680, display: 'grid', gap: 22 }}>
      <div>
        <Lbl>Product Name *</Lbl>
        <input className="admin-field" required placeholder="Legacy Hoodie"
          value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} />
      </div>
      <div>
        <Lbl>Description *</Lbl>
        <textarea className="admin-field" required rows={4}
          value={form.description}
          onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
          style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <Lbl>Price (DZD) *</Lbl>
          <input type="number" min="0" className="admin-field" required
            value={form.price} onChange={(e) => setForm((v) => ({ ...v, price: e.target.value }))} />
        </div>
        <div>
          <Lbl>Category</Lbl>
          <select className="admin-field" value={form.category}
            onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))}
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            {CATS.map((c) => (
              <option key={c} value={c} style={{ background: '#111' }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Lbl>Tags (comma-separated)</Lbl>
        <input className="admin-field" placeholder="black, limited, premium"
          value={form.tags} onChange={(e) => setForm((v) => ({ ...v, tags: e.target.value }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Toggle value={form.soldOut}  onChange={(v) => setForm((s) => ({ ...s, soldOut:  v }))} label="Sold Out" />
        <Toggle value={form.featured} onChange={(v) => setForm((s) => ({ ...s, featured: v }))} label="Featured" />
      </div>

      {urls.length > 0 && (
        <div>
          <Lbl>Current Images</Lbl>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {urls.map((u, i) => (
              <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removeUrl(u)} style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'rgba(200,40,40,0.85)', border: 'none',
                  color: '#fff', width: 18, height: 18, borderRadius: '50%',
                  fontSize: '0.75rem', cursor: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Lbl>Upload Images (Cloudinary)</Lbl>
        <Uploader onUploaded={(rs) => setUrls((a) => [...a, ...rs.map((r) => r.url)])} />
      </div>

      <ErrBox msg={err} />

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={saving} className="btn-gold"
          style={{ fontSize: '0.72rem', padding: '12px 32px' }}>
          {saving ? 'SAVING…' : product ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline"
          style={{ fontSize: '0.7rem' }}>CANCEL</button>
      </div>
    </form>
  );
}

/* ─── PRODUCT LIST ──────────────────────────────────────────── */
function ProductList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 0',
        fontFamily: '"Playfair Display",serif', fontStyle: 'italic',
        fontSize: '1rem', color: 'var(--ash)',
      }}>No products yet. Add your first piece.</div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 2 }}>
      {products.map((p) => (
        <div key={p._id} style={{
          display: 'grid', gridTemplateColumns: '72px 1fr auto',
          gap: 18, alignItems: 'center',
          background: 'var(--forge)', border: '1px solid var(--steel)',
          padding: '14px 18px', transition: 'border-color .3s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--steel)'; }}
        >
          <div style={{ width: 72, height: 72, background: 'var(--iron)', overflow: 'hidden' }}>
            {p.images && p.images[0] ? (
              <img
                src={p.images[0].startsWith('http') ? p.images[0] : `${API_URL}${p.images[0]}`}
                alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Uncial Antiqua",serif', fontSize: '1.5rem',
                color: 'rgba(212,168,67,0.2)',
              }}>V</div>
            )}
          </div>
          <div>
            <div style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1rem', color: '#fff', marginBottom: 4 }}>
              {p.name}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '0.9rem', color: 'var(--gold)' }}>
                {p.price ? `${Number(p.price).toLocaleString()} DZD` : '—'}
              </span>
              <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.52rem', color: 'var(--ash)', textTransform: 'uppercase' }}>
                {p.category}
              </span>
              {p.soldOut && (
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', color: 'rgba(200,60,40,0.8)', border: '1px solid rgba(200,60,40,0.3)', padding: '2px 8px' }}>SOLD OUT</span>
              )}
              {p.featured && (
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', color: 'var(--gold)', border: '1px solid rgba(212,168,67,0.3)', padding: '2px 8px' }}>FEATURED</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onEdit(p)} className="btn-gold" style={{ fontSize: '0.62rem', padding: '8px 18px' }}>EDIT</button>
            <button onClick={() => onDelete(p._id)} style={{
              background: 'rgba(200,40,40,0.12)', border: '1px solid rgba(200,40,40,0.35)',
              color: 'rgba(200,60,40,0.8)', fontFamily: '"Bebas Neue",sans-serif',
              fontSize: '0.7rem', letterSpacing: '0.1em', padding: '8px 18px',
              cursor: 'none', transition: 'background .2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,40,40,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,40,40,0.12)'; }}
            >DELETE</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── BACKGROUNDS MANAGER ───────────────────────────────────── */
function BackgroundsManager({ token }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [err, setErr]       = useState('');
  const [ok, setOk]         = useState('');

  const load = async () => {
    setLoad(true);
    const d = await fetchAllBackgrounds(token);
    setItems(d.backgrounds || []);
    setLoad(false);
  };
  useEffect(() => { load(); }, []); // eslint-disable-line

  const onUploaded = async (results) => {
    setErr(''); setOk('');
    try {
      for (const r of results) {
        await addBackground({ url: r.url, public_id: r.public_id, label: '' }, token);
      }
      setOk(`${results.length} background(s) added.`);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleToggle = async (item) => {
    await patchBackground(item._id, { active: !item.active }, token);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this background image?')) return;
    await deleteBackground(id, token);
    load();
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <Lbl>Upload New Background Images</Lbl>
        <Uploader onUploaded={onUploaded} />
        <OkBox msg={ok} />
        <ErrBox msg={err} />
      </div>

      <div style={{
        fontFamily: '"DM Mono",monospace', fontSize: '0.55rem',
        letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 16,
      }}>
        Current Backgrounds ({items.length})
      </div>

      {loading ? <Spin /> : items.length === 0 ? (
        <div style={{ fontFamily: '"Playfair Display",serif', fontStyle: 'italic', color: 'var(--ash)', fontSize: '0.95rem', padding: '32px 0' }}>
          No backgrounds yet. Upload above — they replace the default slides on the shop page.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 2 }}>
          {items.map((item) => (
            <div key={item._id} style={{
              display: 'grid', gridTemplateColumns: '100px 1fr auto',
              gap: 16, alignItems: 'center',
              background: 'var(--forge)', border: '1px solid var(--steel)',
              padding: '12px 16px',
              opacity: item.active ? 1 : 0.45,
              transition: 'border-color .3s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--steel)'; }}
            >
              <div style={{ width: 100, height: 64, overflow: 'hidden', background: '#111' }}>
                <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--ghost)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url.split('/').pop()}
                </div>
                <div style={{ marginTop: 6, fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', color: item.active ? 'rgba(60,200,100,0.7)' : 'var(--ash)' }}>
                  {item.active ? 'ACTIVE' : 'HIDDEN'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleToggle(item)} className="btn-outline" style={{ fontSize: '0.6rem', padding: '7px 14px' }}>
                  {item.active ? 'HIDE' : 'SHOW'}
                </button>
                <button onClick={() => handleDelete(item._id)} style={{
                  background: 'rgba(200,40,40,0.12)', border: '1px solid rgba(200,40,40,0.3)',
                  color: 'rgba(200,60,40,0.8)', fontFamily: '"Bebas Neue",sans-serif',
                  fontSize: '0.68rem', letterSpacing: '0.1em', padding: '7px 14px',
                  cursor: 'none', transition: 'background .2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,40,40,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,40,40,0.12)'; }}
                >DELETE</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 20, fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: 'rgba(85,85,85,0.5)', lineHeight: 1.8 }}>
        Active images are fetched dynamically by the shop carousel.<br />
        Falls back to built-in photos when no backgrounds are uploaded.
      </div>
    </div>
  );
}

/* ─── SETTINGS PANEL ────────────────────────────────────────── */
function SettingsPanel({ token }) {
  const [cfg, setCfg] = useState({
    introOpacity:   0.6,
    introImgWidth:  '100%',
    introImgHeight: '100%',
    introEnabled:   true,
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState('');
  const [err, setErr]       = useState('');

  useEffect(() => {
    fetchSettings().then((d) => {
      if (d && Object.keys(d).length) {
        setCfg((prev) => ({
          introOpacity:   d.introOpacity   != null ? d.introOpacity   : prev.introOpacity,
          introImgWidth:  d.introImgWidth  != null ? d.introImgWidth  : prev.introImgWidth,
          introImgHeight: d.introImgHeight != null ? d.introImgHeight : prev.introImgHeight,
          introEnabled:   d.introEnabled   != null ? d.introEnabled   : prev.introEnabled,
        }));
      }
    });
  }, []);

  const save = async () => {
    setSaving(true); setOk(''); setErr('');
    try {
      await saveSettings(cfg, token);
      setOk('Settings saved successfully.');
    } catch (e) {
      setErr(e.message || 'Save failed');
    }
    setSaving(false);
  };

  const pct = Math.round(Number(cfg.introOpacity) * 100);

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 32 }}>
        Landing Page — Intro Clothing Preview Controls
      </div>

      <div style={{ display: 'grid', gap: 28 }}>
        <div>
          <Lbl>Show Boutique Background on Intro</Lbl>
          <Toggle
            value={!!cfg.introEnabled}
            onChange={(v) => setCfg((s) => ({ ...s, introEnabled: v }))}
            label={cfg.introEnabled ? 'Enabled' : 'Disabled'}
          />
        </div>

        <div>
          <Lbl>Clothing Preview Opacity — {pct}%</Lbl>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <input
              type="range" min="0" max="1" step="0.05"
              value={cfg.introOpacity}
              onChange={(e) => setCfg((s) => ({ ...s, introOpacity: parseFloat(e.target.value) }))}
              style={{ flex: 1, accentColor: 'var(--gold)', cursor: 'none' }}
            />
            <div style={{
              width: 52, height: 52,
              background: `rgba(212,168,67,${cfg.introOpacity})`,
              border: '1px solid var(--blade)', flexShrink: 0,
            }} />
          </div>
          <div style={{ marginTop: 8, fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.1em', color: 'var(--ash)' }}>
            Default: 0.6 (60%) — controls how visible the boutique rack preview is
          </div>
        </div>

        <div>
          <Lbl>Image Container Width</Lbl>
          <input className="admin-field" value={cfg.introImgWidth}
            onChange={(e) => setCfg((s) => ({ ...s, introImgWidth: e.target.value }))}
            placeholder="100%, 1200px, 90vw" />
          <div style={{ marginTop: 6, fontFamily: '"DM Mono",monospace', fontSize: '0.48rem', color: 'var(--ash)', letterSpacing: '0.1em' }}>
            CSS value — %, px, vw
          </div>
        </div>

        <div>
          <Lbl>Image Container Height</Lbl>
          <input className="admin-field" value={cfg.introImgHeight}
            onChange={(e) => setCfg((s) => ({ ...s, introImgHeight: e.target.value }))}
            placeholder="100%, 900px, 100vh" />
        </div>

        {/* Live preview */}
        <div style={{ border: '1px solid var(--blade)', padding: 16, position: 'relative', overflow: 'hidden', height: 130 }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(/lookbook-7.jpg)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: `brightness(${cfg.introOpacity}) saturate(0.6)`,
            width: cfg.introImgWidth, height: cfg.introImgHeight,
            maxWidth: '100%', maxHeight: '100%',
          }} />
          <div style={{
            position: 'absolute', bottom: 8, right: 12,
            fontFamily: '"DM Mono",monospace', fontSize: '0.5rem',
            letterSpacing: '0.15em', color: 'var(--gold)', textTransform: 'uppercase',
          }}>Live Preview</div>
        </div>

        <div>
          <button type="button" onClick={save} disabled={saving} className="btn-gold"
            style={{ fontSize: '0.72rem', padding: '12px 32px' }}>
            {saving ? 'SAVING…' : 'SAVE SETTINGS'}
          </button>
          <OkBox msg={ok} />
          <ErrBox msg={err} />
        </div>
      </div>

      <div style={{ marginTop: 32, borderTop: '1px solid var(--blade)', paddingTop: 20, fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: 'rgba(85,85,85,0.5)', lineHeight: 1.8 }}>
        Stored in MongoDB · Applied on every page load · No redeploy needed.
      </div>
    </div>
  );
}

/* ─── LOGIN ─────────────────────────────────────────────────── */
function LoginScreen({ onAuth }) {
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
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
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 380, border: '1px solid rgba(212,168,67,0.2)', padding: '52px 44px' }}>
        <div style={{ fontFamily: '"Uncial Antiqua",serif', fontSize: '1.8rem', color: '#fff', textAlign: 'center', marginBottom: 6 }}>VALIO</div>
        <div style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'var(--gold)', textAlign: 'center', marginBottom: 44, textTransform: 'uppercase' }}>Control Panel</div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}>
            <Lbl>Access Key</Lbl>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              className="admin-field" placeholder="••••••••" required autoFocus />
          </div>
          {err && <div style={{ color: 'rgba(200,60,40,0.8)', fontFamily: '"DM Sans",sans-serif', fontSize: '0.82rem', marginBottom: 14, textAlign: 'center' }}>{err}</div>}
          <button type="submit" disabled={busy} className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? 'VERIFYING…' : 'ENTER'}
          </button>
        </form>
        <div style={{ marginTop: 28, fontFamily: '"DM Mono",monospace', fontSize: '0.48rem', letterSpacing: '0.2em', color: 'rgba(85,85,85,0.4)', textAlign: 'center' }}>RESTRICTED ACCESS</div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
const TABS = [
  { id: 'products',    label: 'Products' },
  { id: 'add',         label: '+ Add Product' },
  { id: 'backgrounds', label: 'Shop Backgrounds' },
  { id: 'settings',    label: 'Settings' },
];

function Dashboard({ token, onLogout }) {
  const [tab, setTab]           = useState('products');
  const [products, setProducts] = useState([]);
  const [editing, setEditing]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch(`${API_URL}/api/products?limit=200`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const goTab = (id) => {
    if (id === 'add') { setShowForm(true); setEditing(null); setTab('products'); }
    else { setTab(id); setShowForm(false); setEditing(null); }
  };

  const hdr = showForm
    ? (editing ? 'Edit Product' : 'Add Product')
    : (TABS.find((t) => t.id === tab) || {}).label || '';

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 230, background: '#000', borderRight: '1px solid rgba(212,168,67,0.1)', display: 'flex', flexDirection: 'column', padding: '32px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(212,168,67,0.1)', marginBottom: 8 }}>
          <div style={{ fontFamily: '"Uncial Antiqua",serif', fontSize: '1.3rem', color: '#fff', marginBottom: 4 }}>VALIO</div>
          <div style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase' }}>Control Panel</div>
        </div>
        <nav style={{ flex: 1 }}>
          {TABS.map((t) => {
            const on = t.id !== 'add' && tab === t.id && !showForm;
            return (
              <button key={t.id} onClick={() => goTab(t.id)} style={{
                width: '100%', background: on ? 'rgba(212,168,67,0.08)' : 'transparent',
                border: 'none', borderLeft: on ? '2px solid var(--gold)' : '2px solid transparent',
                color: on ? 'var(--gold)' : 'var(--ash)',
                fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.12em',
                padding: '13px 24px', textAlign: 'left', cursor: 'none',
                textTransform: 'uppercase', transition: 'all .25s',
              }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = 'var(--ghost)'; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = 'var(--ash)'; }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '0 16px' }}>
          <button onClick={onLogout} style={{
            width: '100%', background: 'transparent',
            border: '1px solid rgba(200,40,40,0.25)', color: 'rgba(200,60,40,0.6)',
            fontFamily: '"DM Mono",monospace', fontSize: '0.58rem', letterSpacing: '0.12em',
            padding: 10, cursor: 'none', textTransform: 'uppercase', transition: 'all .3s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(200,40,40,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(200,40,40,0.25)'; }}
          >Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ borderBottom: '1px solid rgba(212,168,67,0.1)', padding: '22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontWeight: 400, fontSize: '1.2rem', letterSpacing: '0.1em', color: '#fff' }}>{hdr}</h1>
          {tab === 'products' && !showForm && (
            <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: 'var(--ash)' }}>
              {products.length} products
            </span>
          )}
        </div>

        <div style={{ padding: '36px 40px' }}>
          {tab === 'products' && !showForm && (
            <div>
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-gold" onClick={() => { setShowForm(true); setEditing(null); }}
                  style={{ fontSize: '0.7rem', padding: '10px 24px' }}>
                  + ADD PRODUCT
                </button>
              </div>
              <ProductList
                products={products}
                onEdit={(p) => { setEditing(p); setShowForm(true); }}
                onDelete={async (id) => {
                  if (!confirm('Delete this product permanently?')) return;
                  await deleteProduct(id, token);
                  load();
                }}
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
          {tab === 'backgrounds' && !showForm && <BackgroundsManager token={token} />}
          {tab === 'settings'    && !showForm && <SettingsPanel token={token} />}
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ROOT ─────────────────────────────────────────────── */
export default function SecretControlPanel() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('valio_token');
      if (t) setToken(t);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('valio_token');
    setToken(null);
  };

  return (
    <>
      <Head>
        <title>Control Panel</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {token ? <Dashboard token={token} onLogout={logout} /> : <LoginScreen onAuth={setToken} />}
    </>
  );
}
