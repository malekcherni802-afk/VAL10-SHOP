import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CustomCursor from '../../components/ui/CustomCursor';
import Navbar from '../../components/ui/Navbar';
import CartDrawer from '../../components/ui/CartDrawer';
import { fetchProductById, fetchProducts } from '../../lib/api';
import { useCart } from '../_app';

export async function getServerSideProps({ params }) {
  try {
    const product = await fetchProductById(params.id);
    // Related: same category, exclude this product
    const related = await fetchProducts({
      category: product.category !== 'other' ? product.category : undefined,
      limit: 5,
    }).catch(() => ({ products: [] }));

    const relatedFiltered = (related.products || [])
      .filter(p => p._id !== product._id)
      .slice(0, 4);

    return { props: { product, related: relatedFiltered } };
  } catch {
    return { notFound: true };
  }
}

export default function ProductPage({ product, related }) {
  const { addItem } = useCart();
  const router = useRouter();

  const [selectedImg,  setSelectedImg]  = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [added,        setAdded]        = useState(false);

  function handleAddToCart() {
    if (product.soldOut) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const img = product.images?.[selectedImg] || product.images?.[0];

  return (
    <>
      <Head>
        <title>{product.name} — VALIO</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
        {img && <meta property="og:image" content={img} />}
      </Head>

      <CustomCursor />
      <Navbar />
      <CartDrawer />

      <main style={{ background: '#000', minHeight: '100vh', paddingTop: '68px' }}>
        {/* ── Breadcrumb ── */}
        <div style={{
          padding:     '20px clamp(20px,5vw,80px)',
          borderBottom:'1px solid #111',
          display:     'flex',
          gap:         '8px',
          alignItems:  'center',
        }}>
          {[['Home', '/'], ['Shop', '/shop'], [product.category, `/shop?category=${product.category}`]].map(([label, href], i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {i > 0 && <span style={{ color: '#333' }}>/</span>}
              <Link href={href}
                style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#555', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#d4a843'}
                onMouseLeave={e => e.target.style.color = '#555'}>
                {label}
              </Link>
            </span>
          ))}
          <span style={{ color: '#333' }}>/</span>
          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#aaa', textTransform: 'uppercase' }}>
            {product.name}
          </span>
        </div>

        {/* ── Product layout ── */}
        <div style={{
          maxWidth:  '1400px',
          margin:    '0 auto',
          padding:   'clamp(40px,6vw,80px) clamp(20px,5vw,80px)',
          display:   'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap:       'clamp(32px,6vw,80px)',
        }}>
          {/* ── Images ── */}
          <div>
            {/* Main image */}
            <div style={{
              aspectRatio: '3/4',
              background:  '#0c0c0c',
              overflow:    'hidden',
              marginBottom:'8px',
            }}>
              {img ? (
                <img src={img} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a' }}>
                  NO IMAGE
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {product.images.map((url, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    style={{
                      width:        '72px', height: '88px',
                      flexShrink:   0,
                      border:       `2px solid ${i === selectedImg ? '#d4a843' : 'transparent'}`,
                      padding:      0, background: 'none',
                      overflow:     'hidden',
                      transition:   'border-color 0.25s ease',
                    }}>
                    <img src={url} alt={`View ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div>
            {/* Category */}
            <p style={{
              fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
              letterSpacing: '0.35em', color: '#d4a843', textTransform: 'uppercase',
              marginBottom:  '12px',
            }}>
              {product.category}
            </p>

            {/* Name */}
            <h1 style={{
              fontFamily: '"Bebas Neue",sans-serif',
              fontSize:   'clamp(2.2rem,5vw,3.8rem)',
              letterSpacing:'0.04em', color: '#e8e8e8', lineHeight: 0.95,
              marginBottom: '20px',
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <p style={{
              fontFamily: '"DM Mono",monospace',
              fontSize:   '1.4rem',
              color:      '#d4a843',
              marginBottom:'28px',
            }}>
              {product.price.toLocaleString()} DZD
            </p>

            <div className="rule" style={{ marginBottom: '28px' }} />

            {/* Description */}
            <p style={{
              color:       '#888',
              fontSize:    '0.9rem',
              lineHeight:  '1.8',
              marginBottom:'32px',
              whiteSpace:  'pre-wrap',
            }}>
              {product.description}
            </p>

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{
                  fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
                  letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase',
                  marginBottom:  '12px',
                }}>
                  Size
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      style={{
                        background:    selectedSize === size ? '#d4a843' : 'transparent',
                        color:         selectedSize === size ? '#000' : '#888',
                        border:        `1px solid ${selectedSize === size ? '#d4a843' : '#333'}`,
                        fontFamily:    '"DM Mono",monospace',
                        fontSize:      '0.75rem',
                        letterSpacing: '0.1em',
                        padding:       '10px 18px',
                        textTransform: 'uppercase',
                        transition:    'all 0.2s ease',
                      }}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sold out / add to cart */}
            {product.soldOut ? (
              <div style={{
                padding:     '18px 32px', textAlign: 'center',
                border:      '1px solid #2a2a2a', color: '#555',
                fontFamily:  '"Bebas Neue",sans-serif', fontSize: '1.1rem',
                letterSpacing:'0.15em',
              }}>
                SOLD OUT
              </div>
            ) : (
              <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAddToCart}>
                {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ marginTop: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{
                    background:    '#0c0c0c',
                    border:        '1px solid #1e1e1e',
                    color:         '#555',
                    fontFamily:    '"DM Mono",monospace',
                    fontSize:      '0.6rem',
                    letterSpacing: '0.1em',
                    padding:       '5px 12px',
                    textTransform: 'uppercase',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div style={{
            borderTop: '1px solid #111',
            padding:   'clamp(60px,8vw,100px) clamp(20px,5vw,80px)',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <h2 style={{
                fontFamily:    '"Bebas Neue",sans-serif',
                fontSize:      'clamp(1.8rem,4vw,3rem)',
                letterSpacing: '0.06em', color: '#555',
                marginBottom:  '40px',
              }}>
                YOU MAY ALSO LIKE
              </h2>
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap:                 '2px',
              }}>
                {related.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
