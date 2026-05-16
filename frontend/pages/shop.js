import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import ShopNav from '../components/shop/ShopNav';
import ProductCard from '../components/shop/ProductCard';
import Footer from '../components/shop/Footer';
import SmokeCanvas from '../components/intro/SmokeCanvas';
import { fetchProducts } from '../lib/api';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const lenisRef = useRef(null);

  const categories = ['all', 'clothing', 'jewelry', 'accessories', 'footwear'];

  useEffect(() => {
    // Init Lenis smooth scroll
    async function initLenis() {
      try {
        const Lenis = (await import('@studio-freight/lenis')).default;
        const lenis = new Lenis({
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true,
        });
        lenisRef.current = lenis;

        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        console.log('Lenis not available');
      }
    }
    initLenis();

    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filter]);

  async function loadProducts() {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const data = await fetchProducts(params);
      setProducts(data.products || []);
    } catch (e) {
      console.error('Failed to load products:', e);
      setProducts([]);
    }
    setLoading(false);
  }

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = document.querySelectorAll('.reveal-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [products]);

  const featured = products.filter(p => p.featured);
  const all = products;

  return (
    <>
      <Head>
        <title>VALIO — Collection</title>
      </Head>

      <ShopNav />

      <main style={{ background: '#000', minHeight: '100vh' }}>
        {/* Hero Section */}
        <section
          ref={heroRef}
          style={{
            position: 'relative',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <SmokeCanvas opacity={0.4} />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 50%, #000 100%)',
            zIndex: 1,
          }} />

          {/* Decorative lines */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(192,160,96,0.15), transparent)',
            zIndex: 1,
          }} />

          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '0.85rem',
              letterSpacing: '0.4em',
              color: 'var(--accent)',
              marginBottom: 24,
              opacity: 0.8,
              textTransform: 'uppercase',
            }}>
              The Collection
            </div>

            <h1 style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900,
              fontSize: 'clamp(3.5rem, 10vw, 9rem)',
              letterSpacing: '0.3em',
              color: '#fff',
              lineHeight: 1,
              textShadow: '0 0 80px rgba(192,160,96,0.15)',
              marginBottom: 32,
            }}>
              VALIO
            </h1>

            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.1rem',
              color: 'rgba(192,192,192,0.5)',
              letterSpacing: '0.15em',
              fontStyle: 'italic',
              marginBottom: 48,
            }}>
              Wear the Darkness
            </div>

            {/* Scroll cue */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.6rem',
                letterSpacing: '0.25em',
                color: 'rgba(192,160,96,0.4)',
                textTransform: 'uppercase',
              }}>
                Scroll
              </div>
              <div style={{
                width: 1,
                height: 60,
                background: 'linear-gradient(to bottom, rgba(192,160,96,0.4), transparent)',
                animation: 'scrollLine 2s ease-in-out infinite',
              }} />
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section style={{ padding: '80px 48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                marginBottom: 60,
              }}>
                <div style={{ width: 60, height: 1, background: 'var(--accent)', opacity: 0.6 }} />
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                }}>
                  Featured
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(192,160,96,0.15)' }} />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 40,
              }}>
                {featured.map((product, i) => (
                  <div
                    key={product._id}
                    className="reveal-card"
                    style={{
                      opacity: 0,
                      transform: 'translateY(40px)',
                      transition: `opacity 0.8s ease ${i * 0.12}s, transform 0.8s ease ${i * 0.12}s`,
                    }}
                  >
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Divider */}
        <div style={{
          margin: '0 48px',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(192,160,96,0.2), transparent)',
        }} />

        {/* All Products */}
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 48,
              flexWrap: 'wrap',
              gap: 24,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}>
                <div style={{ width: 60, height: 1, background: 'var(--accent)', opacity: 0.6 }} />
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.7rem',
                  letterSpacing: '0.3em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                }}>
                  All Pieces
                </div>
              </div>

              {/* Category filter */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    style={{
                      background: filter === cat ? 'rgba(192,160,96,0.15)' : 'transparent',
                      border: `1px solid ${filter === cat ? 'var(--accent)' : 'rgba(192,192,192,0.2)'}`,
                      color: filter === cat ? 'var(--accent)' : 'rgba(192,192,192,0.5)',
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.6rem',
                      letterSpacing: '0.15em',
                      padding: '8px 16px',
                      cursor: 'none',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  border: '1px solid rgba(192,160,96,0.3)',
                  borderTop: '1px solid var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 24px',
                }} />
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(192,160,96,0.5)',
                }}>
                  LOADING COLLECTION
                </div>
              </div>
            ) : all.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 0',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '1.2rem',
                color: 'rgba(192,192,192,0.3)',
                fontStyle: 'italic',
              }}>
                No pieces found in this category.
              </div>
            ) : (
              <div
                ref={gridRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 40,
                }}
              >
                {all.map((product, i) => (
                  <div
                    key={product._id}
                    className="reveal-card"
                    style={{
                      opacity: 0,
                      transform: 'translateY(40px)',
                      transition: `opacity 0.8s ease ${i * 0.08}s, transform 0.8s ease ${i * 0.08}s`,
                    }}
                  >
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Brand statement */}
        <section style={{
          padding: '120px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <SmokeCanvas opacity={0.2} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.65rem',
              letterSpacing: '0.4em',
              color: 'var(--accent)',
              marginBottom: 32,
              opacity: 0.7,
            }}>
              — MANIFESTO —
            </div>
            <blockquote style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontStyle: 'italic',
              color: 'rgba(192,192,192,0.7)',
              lineHeight: 1.7,
              fontWeight: 300,
            }}>
              "Fashion is the armor to survive the reality of everyday life. 
              We build armor from shadow and silence."
            </blockquote>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scrollLine {
          0%, 100% { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
