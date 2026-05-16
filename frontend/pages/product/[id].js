import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import ShopNav from '../../components/shop/ShopNav';
import ImageGallery from '../../components/product/ImageGallery';
import Footer from '../../components/shop/Footer';
import { fetchProduct, getImageUrl } from '../../lib/api';

const ProductViewer3D = dynamic(
  () => import('../../components/product/ProductViewer3D'),
  { ssr: false }
);

export default function ProductPage({ product: initialProduct }) {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [viewMode, setViewMode] = useState('image');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!initialProduct && id) {
      fetchProduct(id)
        .then((p) => { setProduct(p); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [id, initialProduct]);

  useEffect(() => {
    if (product?.model3D) setViewMode('3d');
  }, [product]);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <Loader />;
  if (!product) return <NotFound />;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const model3DUrl = product.model3D ? `${apiUrl}${product.model3D}` : null;

  return (
    <>
      <Head>
        <title>{product.name} — VALIO</title>
      </Head>
      <ShopNav />

      <main style={{ background: 'var(--void)', minHeight: '100vh', paddingTop: 64 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 64px' }}>

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 64,
            }}
          >
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.2em',
                color: 'var(--mist)',
                cursor: 'none',
                textTransform: 'uppercase',
                padding: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--acid)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mist)'}
            >
              Collection
            </button>
            <span style={{ color: 'var(--slag)', fontSize: '0.7rem' }}>→</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              color: 'var(--ghost)',
              textTransform: 'uppercase',
            }}>
              {product.name}
            </span>
          </motion.div>

          {/* Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'start',
          }}>
            {/* Left: viewer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {product.model3D && (
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {['image', '3d'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{
                        background: viewMode === mode ? 'var(--acid)' : 'var(--iron)',
                        color: viewMode === mode ? 'var(--void)' : 'var(--mist)',
                        border: 'none',
                        fontFamily: 'var(--font-label)',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: '0.15em',
                        padding: '10px 24px',
                        cursor: 'none',
                        textTransform: 'uppercase',
                        transition: 'background 0.25s, color 0.25s',
                      }}
                    >
                      {mode === '3d' ? '3D View' : 'Photos'}
                    </button>
                  ))}
                </div>
              )}

              {viewMode === '3d' && model3DUrl ? (
                <div style={{
                  aspectRatio: '1',
                  background: 'var(--iron)',
                  border: '1px solid var(--slag)',
                }}>
                  <ProductViewer3D modelUrl={model3DUrl} />
                </div>
              ) : (
                <ImageGallery images={product.images} productName={product.name} />
              )}
            </motion.div>

            {/* Right: info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Category */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.3em',
                color: 'var(--acid)',
                textTransform: 'uppercase',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <span style={{ width: 16, height: 1, background: 'var(--acid)', display: 'inline-block' }} />
                {product.category}
              </div>

              {/* Name */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                letterSpacing: '-0.02em',
                color: '#fff',
                textTransform: 'uppercase',
                lineHeight: 0.95,
                marginBottom: 32,
              }}>
                {product.name}
              </h1>

              {/* Price */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '2.2rem',
                color: 'var(--acid)',
                letterSpacing: '-0.02em',
                marginBottom: 32,
              }}>
                ${product.price?.toLocaleString()}
              </div>

              <div className="rule-h" style={{ marginBottom: 32 }} />

              {/* Description */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                color: 'rgba(232,232,232,0.55)',
                lineHeight: 1.8,
                marginBottom: 40,
              }}>
                {product.description}
              </p>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 40 }}>
                  {product.tags.map((tag) => (
                    <span key={tag} style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.12em',
                      color: 'var(--mist)',
                      border: '1px solid var(--slag)',
                      padding: '4px 12px',
                      textTransform: 'uppercase',
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              {product.soldOut ? (
                <div style={{
                  border: '1px solid rgba(255,58,26,0.3)',
                  color: 'var(--rust)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.15em',
                  padding: '20px 40px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}>
                  Sold Out
                </div>
              ) : (
                <motion.button
                  className="btn-primary"
                  onClick={handleAdd}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {added ? '✓ Added to Collection' : 'Add to Collection'}
                </motion.button>
              )}

              <button
                className="btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Save to Wishlist
              </button>

              {/* Specs */}
              <div style={{
                marginTop: 48,
                borderTop: '1px solid var(--slag)',
                paddingTop: 32,
                display: 'grid',
                gap: 14,
              }}>
                {[
                  ['Material', 'Military-grade premium construction'],
                  ['Edition', 'Limited run — handcrafted'],
                  ['Shipping', 'Worldwide · 5–12 business days'],
                  ['Returns', '14-day return window'],
                ].map(([key, val]) => (
                  <div key={key} style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr',
                    gap: 16,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.2em',
                      color: 'var(--mist)',
                      textTransform: 'uppercase',
                      paddingTop: 2,
                    }}>
                      {key}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      color: 'var(--ghost)',
                    }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          main > div > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </>
  );
}

function Loader() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '1px solid var(--slag)',
        borderTop: '1px solid var(--acid)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-label)',
      letterSpacing: '0.2em',
      color: 'var(--mist)',
      textTransform: 'uppercase',
      fontSize: '0.8rem',
    }}>
      Product not found.
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/products/${params.id}`);
    if (!res.ok) return { props: { product: null } };
    const product = await res.json();
    return { props: { product } };
  } catch (_) {
    return { props: { product: null } };
  }
}
