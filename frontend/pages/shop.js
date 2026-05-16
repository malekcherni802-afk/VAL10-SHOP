import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import ShopNav from '../components/shop/ShopNav';
import ProductCard from '../components/shop/ProductCard';
import Footer from '../components/shop/Footer';
import { fetchProducts } from '../lib/api';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const lenisRef = useRef(null);
  const categories = ['all', 'clothing', 'jewelry', 'accessories', 'footwear'];

  useEffect(() => {
    async function initLenis() {
      try {
        const LenisModule = await import('@studio-freight/lenis');
        const Lenis = LenisModule.default;
        const lenis = new Lenis({ duration: 1.4, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        lenisRef.current = lenis;
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
      } catch (_) {}
    }
    initLenis();
    return () => { if (lenisRef.current) lenisRef.current.destroy(); };
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { category: filter } : {};
    fetchProducts(params)
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [filter]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.js-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products, loading]);

  return (
    <>
      <Head><title>Collection — VALIO</title></Head>
      <ShopNav />
      <main style={{ background: 'var(--void)', minHeight: '100vh', paddingTop: 64 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 64px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 60 }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.3em',
              color: 'var(--acid)',
              textTransform: 'uppercase',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ width: 20, height: 1, background: 'var(--acid)', display: 'inline-block' }} />
              Full Collection
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              letterSpacing: '-0.02em',
              color: '#fff',
              textTransform: 'uppercase',
            }}>
              All Pieces
            </h1>
          </motion.div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 48, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  background: filter === cat ? 'var(--acid)' : 'var(--iron)',
                  color: filter === cat ? 'var(--void)' : 'var(--ghost)',
                  border: 'none',
                  fontFamily: 'var(--font-label)',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '11px 22px',
                  cursor: 'none',
                  transition: 'background 0.25s, color 0.25s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 32, height: 32,
                border: '1px solid var(--slag)',
                borderTop: '1px solid var(--acid)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              fontFamily: 'var(--font-label)',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              color: 'var(--mist)',
              textTransform: 'uppercase',
            }}>
              No pieces in this category.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 2,
            }}>
              {products.map((product, i) => (
                <div
                  key={product._id}
                  className="js-reveal"
                  style={{
                    opacity: 0,
                    transform: 'translateY(50px)',
                    transition: `opacity 0.7s ease ${(i % 6) * 0.07}s, transform 0.7s ease ${(i % 6) * 0.07}s`,
                  }}
                >
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
