import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
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
  const [viewMode, setViewMode] = useState('image'); // 'image' | '3d'

  useEffect(() => {
    if (!initialProduct && id) {
      fetchProduct(id)
        .then(p => { setProduct(p); setLoading(false); })
        .catch(() => { setLoading(false); });
    }
  }, [id]);

  useEffect(() => {
    if (product?.model3D) setViewMode('3d');
  }, [product]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '1px solid rgba(192,160,96,0.3)',
          borderTop: '1px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.2rem',
          color: 'rgba(192,192,192,0.4)',
          fontStyle: 'italic',
        }}>
          Product not found.
        </div>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const model3DUrl = product.model3D ? `${apiUrl}${product.model3D}` : null;

  return (
    <>
      <Head>
        <title>{product.name} — VALIO</title>
      </Head>

      <ShopNav />

      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px' }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 60,
          }}>
            <button
              onClick={() => router.push('/shop')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'Cinzel, serif',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: 'rgba(192,192,192,0.4)',
                cursor: 'none',
                textTransform: 'uppercase',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,192,192,0.4)'}
            >
              Collection
            </button>
            <span style={{ color: 'rgba(192,192,192,0.2)', fontSize: '0.7rem' }}>→</span>
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: 'rgba(192,192,192,0.6)',
              textTransform: 'uppercase',
            }}>
              {product.name}
            </span>
          </div>

          {/* Product layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'start',
          }}>
            {/* Left: viewer */}
            <div>
              {/* View toggle */}
              {product.model3D && (
                <div style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 16,
                }}>
                  {['image', '3d'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{
                        background: viewMode === mode ? 'rgba(192,160,96,0.15)' : 'transparent',
                        border: `1px solid ${viewMode === mode ? 'var(--accent)' : 'rgba(192,192,192,0.2)'}`,
                        color: viewMode === mode ? 'var(--accent)' : 'rgba(192,192,192,0.4)',
                        fontFamily: 'Cinzel, serif',
                        fontSize: '0.6rem',
                        letterSpacing: '0.15em',
                        padding: '8px 20px',
                        cursor: 'none',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s',
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
                  background: '#0a0a0a',
                  border: '1px solid rgba(192,160,96,0.1)',
                }}>
                  <ProductViewer3D modelUrl={model3DUrl} />
                </div>
              ) : (
                <ImageGallery images={product.images} productName={product.name} />
              )}
            </div>

            {/* Right: product info */}
            <div style={{ paddingTop: 20 }}>
              {/* Category */}
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.6rem',
                letterSpacing: '0.25em',
                color: 'rgba(192,160,96,0.6)',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                {product.category}
              </div>

              {/* Name */}
              <h1 style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 700,
                fontSize: 'clamp(1.8rem, 3vw, 3rem)',
                letterSpacing: '0.1em',
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: 24,
              }}>
                {product.name}
              </h1>

              {/* Price */}
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2rem',
                color: 'var(--accent)',
                marginBottom: 32,
              }}>
                ${product.price?.toLocaleString()}
              </div>

              {/* Divider */}
              <div style={{
                width: '100%',
                height: 1,
                background: 'rgba(192,160,96,0.15)',
                marginBottom: 32,
              }} />

              {/* Description */}
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.05rem',
                color: 'rgba(192,192,192,0.7)',
                lineHeight: 1.9,
                marginBottom: 48,
              }}>
                {product.description}
              </div>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
                  {product.tags.map(tag => (
                    <span key={tag} style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.55rem',
                      letterSpacing: '0.15em',
                      color: 'rgba(192,192,192,0.4)',
                      border: '1px solid rgba(192,192,192,0.15)',
                      padding: '4px 12px',
                      textTransform: 'uppercase',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              {product.soldOut ? (
                <div style={{
                  border: '1px solid rgba(180,50,50,0.3)',
                  color: 'rgba(180,50,50,0.7)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  padding: '20px 40px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}>
                  Sold Out
                </div>
              ) : (
                <button
                  style={{
                    width: '100%',
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '0.75rem',
                    letterSpacing: '0.25em',
                    padding: '20px 40px',
                    cursor: 'none',
                    textTransform: 'uppercase',
                    transition: 'opacity 0.3s ease, transform 0.2s ease',
                    marginBottom: 16,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Add to Collection
                </button>
              )}

              {/* Wishlist */}
              <button
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: 'rgba(192,192,192,0.5)',
                  border: '1px solid rgba(192,192,192,0.15)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  padding: '14px 40px',
                  cursor: 'none',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(192,192,192,0.4)';
                  e.currentTarget.style.color = 'rgba(192,192,192,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(192,192,192,0.15)';
                  e.currentTarget.style.color = 'rgba(192,192,192,0.5)';
                }}
              >
                Save to Wishlist
              </button>

              {/* Details */}
              <div style={{
                marginTop: 48,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 32,
              }}>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(192,160,96,0.6)',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}>
                  Details
                </div>
                <div style={{
                  display: 'grid',
                  gap: 10,
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '0.9rem',
                  color: 'rgba(192,192,192,0.5)',
                }}>
                  <div>Handcrafted limited edition</div>
                  <div>Worldwide shipping available</div>
                  <div>Returns within 14 days</div>
                  {product.model3D && <div>3D preview available above</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          main > div > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/products/${params.id}`);
    if (!res.ok) return { props: { product: null } };
    const product = await res.json();
    return { props: { product } };
  } catch {
    return { props: { product: null } };
  }
}
