import { useState, useEffect } from 'react';
import Head from 'next/head';
import { adminLogin, fetchProducts, deleteProduct, updateSettings, fetchSettings } from '../../lib/api';
import AdminProductForm from '../../components/admin/AdminProductForm';
import AdminProductList from '../../components/admin/AdminProductList';

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [settings, setSettings] = useState({});
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Check stored token
  useEffect(() => {
    const stored = localStorage.getItem('valio_admin_token');
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadProducts();
      loadSettings();
    }
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const result = await adminLogin(password);
    if (result.token) {
      localStorage.setItem('valio_admin_token', result.token);
      setToken(result.token);
    } else {
      setLoginError(result.error || 'Invalid credentials');
    }
    setLoginLoading(false);
  }

  function handleLogout() {
    localStorage.removeItem('valio_admin_token');
    setToken(null);
  }

  async function loadProducts() {
    try {
      const data = await fetchProducts({ limit: 100 });
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadSettings() {
    try {
      const s = await fetchSettings();
      setSettings(s);
    } catch (e) {}
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await deleteProduct(id, token);
    loadProducts();
  }

  async function handleSaveSettings() {
    await updateSettings(settings, token);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  const tabs = ['products', 'add product', 'settings'];

  // LOGIN SCREEN
  if (!token) {
    return (
      <>
        <Head><title>VALIO Admin</title></Head>
        <div style={{
          minHeight: '100vh',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 400,
            border: '1px solid rgba(192,160,96,0.2)',
            padding: 48,
          }}>
            {/* Logo */}
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900,
              fontSize: '2rem',
              letterSpacing: '0.5em',
              color: '#fff',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              VALIO
            </div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              color: 'var(--accent)',
              textAlign: 'center',
              marginBottom: 48,
              textTransform: 'uppercase',
            }}>
              Admin Access
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(192,160,96,0.7)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <div style={{
                  color: 'rgba(180,50,50,0.8)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.9rem',
                  marginBottom: 16,
                  textAlign: 'center',
                }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="admin-btn"
                style={{ width: '100%' }}
              >
                {loginLoading ? 'ENTERING...' : 'ENTER'}
              </button>
            </form>

            <div style={{
              marginTop: 32,
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.8rem',
              color: 'rgba(192,192,192,0.3)',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              Restricted access
            </div>
          </div>
        </div>
      </>
    );
  }

  // DASHBOARD
  return (
    <>
      <Head><title>VALIO Admin — Dashboard</title></Head>
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex' }}>
        {/* Sidebar */}
        <div style={{
          width: 240,
          background: '#000',
          borderRight: '1px solid rgba(192,160,96,0.15)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 0',
          flexShrink: 0,
        }}>
          {/* Logo */}
          <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(192,160,96,0.1)' }}>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900,
              fontSize: '1.2rem',
              letterSpacing: '0.4em',
              color: '#fff',
              marginBottom: 4,
            }}>
              VALIO
            </div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.75rem',
              color: 'var(--accent)',
              letterSpacing: '0.2em',
            }}>
              Admin Panel
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '24px 0' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowForm(false);
                  setEditingProduct(null);
                  if (tab === 'add product') {
                    setShowForm(true);
                    setActiveTab('products');
                  }
                }}
                style={{
                  width: '100%',
                  background: activeTab === tab && tab !== 'add product'
                    ? 'rgba(192,160,96,0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: activeTab === tab && tab !== 'add product'
                    ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === tab && tab !== 'add product'
                    ? 'var(--accent)' : 'rgba(192,192,192,0.5)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  padding: '14px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab) e.currentTarget.style.color = 'rgba(192,192,192,0.8)';
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab) e.currentTarget.style.color = 'rgba(192,192,192,0.5)';
                }}
              >
                {tab === 'add product' ? '+ Add Product' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: '0 16px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(180,50,50,0.3)',
                color: 'rgba(180,50,50,0.6)',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                padding: '10px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(180,50,50,0.6)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(180,50,50,0.3)'}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Header */}
          <div style={{
            borderBottom: '1px solid rgba(192,160,96,0.1)',
            padding: '24px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '1rem',
              letterSpacing: '0.2em',
              color: '#fff',
              fontWeight: 400,
            }}>
              {showForm
                ? (editingProduct ? 'Edit Product' : 'Add Product')
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
              }
            </h1>

            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.85rem',
              color: 'rgba(192,192,192,0.4)',
            }}>
              {products.length} products
            </div>
          </div>

          <div style={{ padding: '40px' }}>
            {/* Products list */}
            {activeTab === 'products' && !showForm && (
              <div>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="admin-btn"
                    onClick={() => { setShowForm(true); setEditingProduct(null); }}
                  >
                    + ADD PRODUCT
                  </button>
                </div>
                <AdminProductList
                  products={products}
                  onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
                  onDelete={handleDelete}
                />
              </div>
            )}

            {/* Product form */}
            {showForm && (
              <AdminProductForm
                product={editingProduct}
                token={token}
                onSaved={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  loadProducts();
                }}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              />
            )}

            {/* Settings */}
            {activeTab === 'settings' && !showForm && (
              <div style={{ maxWidth: 600 }}>
                <div style={{ display: 'grid', gap: 24 }}>
                  {[
                    { key: 'siteName', label: 'Site Name', type: 'text' },
                    { key: 'heroTagline', label: 'Hero Tagline', type: 'text' },
                    { key: 'accentColor', label: 'Accent Color', type: 'color' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{
                        display: 'block',
                        fontFamily: 'Cinzel, serif',
                        fontSize: '0.6rem',
                        letterSpacing: '0.2em',
                        color: 'rgba(192,160,96,0.7)',
                        textTransform: 'uppercase',
                        marginBottom: 8,
                      }}>
                        {field.label}
                      </label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input
                          type={field.type}
                          value={settings[field.key] || ''}
                          onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                          className={field.type !== 'color' ? 'admin-input' : ''}
                          style={field.type === 'color' ? {
                            width: 48, height: 36, padding: 2,
                            background: 'none', border: '1px solid rgba(192,160,96,0.3)',
                            cursor: 'pointer',
                          } : {}}
                        />
                        {field.type === 'color' && (
                          <input
                            type="text"
                            value={settings[field.key] || ''}
                            onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                            className="admin-input"
                            style={{ flex: 1 }}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Toggles */}
                  {[
                    { key: 'animationsEnabled', label: 'Animations Enabled' },
                    { key: 'smokeEnabled', label: 'Smoke Background' },
                  ].map(toggle => (
                    <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: '0.6rem',
                        letterSpacing: '0.2em',
                        color: 'rgba(192,160,96,0.7)',
                        textTransform: 'uppercase',
                      }}>
                        {toggle.label}
                      </label>
                      <button
                        onClick={() => setSettings(s => ({ ...s, [toggle.key]: !s[toggle.key] }))}
                        style={{
                          width: 48,
                          height: 24,
                          background: settings[toggle.key] ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: 12,
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.3s',
                        }}
                      >
                        <div style={{
                          width: 18, height: 18,
                          background: '#000',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: 3,
                          left: settings[toggle.key] ? 27 : 3,
                          transition: 'left 0.3s',
                        }} />
                      </button>
                    </div>
                  ))}

                  <button
                    className="admin-btn"
                    onClick={handleSaveSettings}
                    style={{ marginTop: 16 }}
                  >
                    {settingsSaved ? '✓ SAVED' : 'SAVE SETTINGS'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
