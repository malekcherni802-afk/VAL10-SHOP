import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { fetchProduct, getImageUrl } from '../../lib/api';

export default function ProductPage({ product: init }) {
  const router  = useRouter();
  const { id }  = router.query;
  const [product, setProduct] = useState(init || null);
  const [loading, setLoading] = useState(!init);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded]         = useState(false);

  useEffect(() => {
    if (!init && id) {
      fetchProduct(id)
        .then(p => { setProduct(p); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [id, init]);

  if (loading) return <FullLoader />;
  if (!product) return <NotFound />;

  const images = product.images || [];
  const activeSrc = images[activeImg] ? getImageUrl(images[activeImg]) : null;

  return (
    <>
      <Head>
        <title>{product.name} — VALIO</title>
      </Head>

      {/* Minimal nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 68, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 52px',
        background: 'rgba(0,0,0,0.95)', borderBottom: '1px solid var(--steel)',
        backdropFilter: 'blur(16px)',
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none', border: 'none', color: 'var(--ghost)',
            fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: 'none', transition: 'color .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ghost)'}
        >
          ← Collection
        </button>
        <div style={{
          fontFamily: '"Uncial Antiqua", serif',
          fontSize: '1.5rem', color: '#fff',
        }}>
          VALIO
        </div>
        <div style={{ width: 100 }} />
      </nav>

      <main style={{ background: 'var(--void)', minHeight: '100vh', paddingTop: 68 }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '60px 52px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 80, alignItems: 'start',
            }}
          >
            {/* Left — gallery */}
            <div>
              {/* Main image */}
              <div style={{
                aspectRatio: '3/4', overflow: 'hidden',
                background: 'var(--forge)', marginBottom: 10,
                position: 'relative',
              }}>
                {activeSrc ? (
                  <img
                    src={activeSrc}
                    alt={product.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                      filter: 'brightness(0.88) contrast(1.05)',
                    }}
                  />
                ) : <PlaceholderImg />}
                {/* Gold border */}
                <div style={{
                  position: 'absolute', inset: 0,
                  border: '1px solid rgba(212,168,67,0.2)',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {images.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: 64, height: 64, overflow: 'hidden',
                        border: i === activeImg
                          ? '1px solid var(--gold)'
                          : '1px solid var(--blade)',
                        opacity: i === activeImg ? 1 : 0.5,
                        cursor: 'none',
                        transition: 'border-color .3s, opacity .3s',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right — info */}
            <div>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
                letterSpacing: '0.3em', color: 'var(--gold)',
                textTransform: 'uppercase', marginBottom: 18,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 14, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
                {product.category || 'Apparel'}
              </div>

              <h1 style={{
                fontFamily: '"Bebas Neue", sans-serif', fontWeight: 400,
                fontSize: 'clamp(2.2rem, 4vw, 3.8rem)',
                letterSpacing: '0.05em', color: '#fff',
                textTransform: 'uppercase', lineHeight: 0.95,
                marginBottom: 28,
              }}>
                {product.name}
              </h1>

              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 500, fontSize: '2rem',
                color: 'var(--gold)', marginBottom: 32,
              }}>
                {product.price ? `${Number(product.price).toLocaleString()} DZD` : ''}
              </div>

              <div style={{ width: '100%', height: 1, background: 'var(--blade)', marginBottom: 32 }} />

              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.98rem', color: 'rgba(232,232,232,0.55)',
                lineHeight: 1.85, marginBottom: 44,
              }}>
                {product.description}
              </p>

              {product.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 44 }}>
                  {product.tags.map(t => (
                    <span key={t} style={{
                      fontFamily: '"DM Mono", monospace', fontSize: '0.52rem',
                      letterSpacing: '0.12em', color: 'var(--ash)',
                      border: '1px solid var(--blade)', padding: '4px 12px',
                      textTransform: 'uppercase',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {product.soldOut ? (
                <div style={{
                  fontFamily: '"Bebas Neue", sans-serif', fontSize: '1rem',
                  letterSpacing: '0.15em', textAlign: 'center', padding: '20px',
                  border: '1px solid rgba(200,60,40,0.3)',
                  color: 'rgba(200,60,40,0.7)',
                }}>
                  SOLD OUT
                </div>
              ) : (
                <>
                  <motion.button
                    className="btn-gold"
                    onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 2200); }}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                  >
                    {added ? '✓ ADDED' : 'ADD TO COLLECTION'}
                  </motion.button>
                  <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    SAVE TO WISHLIST
                  </button>
                </>
              )}

              {/* Specs */}
              <div style={{ marginTop: 48, borderTop: '1px solid var(--blade)', paddingTop: 32 }}>
                {[
                  ['Material',  'Premium performance fabric'],
                  ['Edition',   'Limited — handcrafted run'],
                  ['Shipping',  'Algeria · Worldwide available'],
                  ['Returns',   '14-day return window'],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: 'grid', gridTemplateColumns: '130px 1fr',
                    gap: 16, marginBottom: 14,
                  }}>
                    <span style={{
                      fontFamily: '"DM Mono", monospace', fontSize: '0.52rem',
                      letterSpacing: '0.18em', color: 'var(--ash)',
                      textTransform: 'uppercase', paddingTop: 2,
                    }}>
                      {k}
                    </span>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.85rem', color: 'var(--ghost)',
                    }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          main > div > div { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </>
  );
}

function PlaceholderImg() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--forge)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: '"Uncial Antiqua", serif', fontSize: '5rem', color: 'rgba(212,168,67,0.12)' }}>V</span>
    </div>
  );
}

function FullLoader() {
  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '1px solid var(--steel)', borderTop: '1px solid var(--gold)',
        borderRadius: '50%', animation: 'spin .8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"DM Mono", monospace', fontSize: '0.7rem',
      letterSpacing: '0.2em', color: 'var(--ash)', textTransform: 'uppercase',
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
    return { props: { product: await res.json() } };
  } catch (_) {
    return { props: { product: null } };
  }
}
