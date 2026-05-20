import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/ui/Navbar';
import CartDrawer from '../components/ui/CartDrawer';
import ProductCard from '../components/ui/ProductCard';
import { fetchProducts } from '../lib/api';

const CATEGORIES = [
  { value: 'all',         label: 'ALL' },
  { value: 'hoodies',     label: 'HOODIES' },
  { value: 't-shirts',    label: 'T-SHIRTS' },
  { value: 'compression', label: 'COMPRESSION' },
  { value: 'outerwear',   label: 'OUTERWEAR' },
  { value: 'accessories', label: 'ACCESSORIES' },
  { value: 'other',       label: 'OTHER' },
];

const PAGE_SIZE = 24;

export default function ShopPage() {
  const router   = useRouter();
  const initCat  = (router.query.category || 'all');

  const [category, setCategory] = useState(initCat);
  const [search,   setSearch]   = useState('');
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [skip,     setSkip]     = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [loadMore, setLoadMore] = useState(false);
  const [error,    setError]    = useState('');

  // Sync category from URL
  useEffect(() => {
    if (router.query.category) setCategory(router.query.category);
  }, [router.query.category]);

  const load = useCallback(async (reset = false) => {
    const currentSkip = reset ? 0 : skip;
    reset ? setLoading(true) : setLoadMore(true);
    setError('');
    try {
      const data = await fetchProducts({
        category: category !== 'all' ? category : undefined,
        search:   search || undefined,
        limit:    PAGE_SIZE,
        skip:     currentSkip,
      });
      if (reset) {
        setProducts(data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.products || [])]);
      }
      setTotal(data.total || 0);
      setSkip(currentSkip + PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadMore(false);
    }
  }, [category, search, skip]);

  // Reload when category or search changes
  useEffect(() => {
    setSkip(0);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  function handleCategoryChange(val) {
    setCategory(val);
    router.push({ pathname: '/shop', query: val !== 'all' ? { category: val } : {} }, undefined, { shallow: true });
  }

  const hasMore = products.length < total;

  return (
    <>
      <Head>
        <title>Shop — VALIO</title>
        <meta name="description" content="Browse the VALIO collection — luxury Algerian streetwear." />
      </Head>

      <CustomCursor />
      <Navbar />
      <CartDrawer />

      <main style={{ background: '#000', minHeight: '100vh', paddingTop: '68px' }}>
        {/* ── Page header ── */}
        <div style={{
          padding:     'clamp(48px,8vw,100px) clamp(20px,5vw,80px) clamp(32px,5vw,60px)',
          borderBottom:'1px solid #111',
          background:  'linear-gradient(to bottom, #0c0c0c, #000)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <p style={{
              fontFamily: '"DM Mono",monospace', fontSize: '0.6rem',
              letterSpacing: '0.4em', color: '#d4a843', textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              Collection
            </p>
            <h1 style={{
              fontFamily: '"Bebas Neue",sans-serif',
              fontSize:   'clamp(3rem,8vw,7rem)',
              letterSpacing:'0.04em', color: '#e8e8e8', lineHeight: 0.9,
              marginBottom: '32px',
            }}>
              THE SHOP
            </h1>

            {/* Search */}
            <div style={{ maxWidth: '440px' }}>
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="admin-field"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* ── Category filter ── */}
        <div style={{
          borderBottom: '1px solid #111',
          padding:      '0 clamp(20px,5vw,80px)',
          overflowX:    'auto',
          background:   '#000',
        }}>
          <div style={{
            maxWidth:     '1400px',
            margin:       '0 auto',
            display:      'flex',
            gap:          '0',
          }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  background:    'none',
                  border:        'none',
                  borderBottom:  category === cat.value ? '2px solid #d4a843' : '2px solid transparent',
                  color:         category === cat.value ? '#d4a843' : '#555',
                  fontFamily:    '"DM Mono",monospace',
                  fontSize:      '0.6rem',
                  letterSpacing: '0.2em',
                  padding:       '18px 20px',
                  textTransform: 'uppercase',
                  transition:    'color 0.2s ease, border-color 0.2s ease',
                  whiteSpace:    'nowrap',
                }}
                onMouseEnter={e => { if (category !== cat.value) e.target.style.color = '#aaa'; }}
                onMouseLeave={e => { if (category !== cat.value) e.target.style.color = '#555'; }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Products ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(32px,5vw,60px) clamp(20px,5vw,80px)' }}>
          {/* Count */}
          <p style={{
            fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
            letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase',
            marginBottom:  '32px',
          }}>
            {loading ? 'Loading…' : `${total} product${total !== 1 ? 's' : ''}`}
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.2)',
              padding: '16px 20px', marginBottom: '32px',
              fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', color: '#e05555',
            }}>
              {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2px',
            }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  background: '#0c0c0c', aspectRatio: '3/4',
                  animation: 'fadeIn 1.5s ease infinite alternate',
                  opacity: 0.4,
                }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase' }}>
                No products found
              </p>
            </div>
          ) : (
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap:                 '2px',
            }}>
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} priority={i < 4} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <button
                className="btn-outline"
                onClick={() => load(false)}
                disabled={loadMore}
              >
                {loadMore ? 'Loading…' : `LOAD MORE (${total - products.length} remaining)`}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
