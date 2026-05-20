import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/ui/Navbar';
import CartDrawer from '../components/ui/CartDrawer';
import ProductCard from '../components/ui/ProductCard';
import { fetchBackgrounds, fetchProducts, fetchSettings } from '../lib/api';

/* ── Server-side data fetch ─────────────────────────────────── */
export async function getServerSideProps() {
  try {
    const [bgData, productData, settings] = await Promise.all([
      fetchBackgrounds().catch(() => ({ backgrounds: [] })),
      fetchProducts({ featured: true, limit: 8 }).catch(() => ({ products: [] })),
      fetchSettings().catch(() => ({})),
    ]);

    return {
      props: {
        backgrounds:       bgData.backgrounds       || [],
        featuredProducts:  productData.products     || [],
        settings:          settings                 || {},
      },
    };
  } catch {
    return { props: { backgrounds: [], featuredProducts: [], settings: {} } };
  }
}

/* ── Hero Background Slider ─────────────────────────────────── */
function HeroSlider({ backgrounds }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (backgrounds.length <= 1) return;
    timer.current = setInterval(() => {
      setCurrent(i => (i + 1) % backgrounds.length);
    }, 6000);
    return () => clearInterval(timer.current);
  }, [backgrounds.length]);

  if (backgrounds.length === 0) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0c0c0c 0%, #000 100%)',
      }} />
    );
  }

  return (
    <>
      {backgrounds.map((bg, i) => (
        <div key={bg._id || i} style={{
          position:   'absolute', inset: 0,
          opacity:    i === current ? 1 : 0,
          transition: 'opacity 2s ease',
          zIndex:     i === current ? 1 : 0,
        }}>
          <img
            src={bg.url}
            alt=""
            aria-hidden="true"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              display: 'block',
            }}
          />
        </div>
      ))}
      {/* Gradient vignette */}
      <div style={{
        position:   'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,1) 100%)',
      }} />
      {/* Slide dots */}
      {backgrounds.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%',
          transform: 'translateX(-50%)', zIndex: 3,
          display: 'flex', gap: '10px',
        }}>
          {backgrounds.map((_, i) => (
            <button key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width:      i === current ? '28px' : '6px',
                height:     '6px',
                borderRadius:'3px',
                background: i === current ? '#d4a843' : 'rgba(255,255,255,0.25)',
                border:     'none',
                transition: 'width 0.4s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Marquee text ────────────────────────────────────────────── */
function Marquee({ text, count = 6 }) {
  const repeated = Array(count * 2).fill(text).join(' — ');
  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div style={{
        display:    'inline-block',
        whiteSpace: 'nowrap',
        animation:  'marquee 28s linear infinite',
        fontFamily: '"Bebas Neue",sans-serif',
        fontSize:   'clamp(0.75rem, 1vw, 0.9rem)',
        letterSpacing:'0.3em',
        color:      '#555',
      }}>
        {repeated}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {repeated}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function HomePage({ backgrounds, featuredProducts, settings }) {
  const tagline = settings.tagline || 'Made for Legacy';

  return (
    <>
      <Head>
        <title>VALIO — {tagline}</title>
        <meta name="description" content="VALIO — Luxury Algerian streetwear. Crafted for those who are built different." />
      </Head>

      <CustomCursor />
      <Navbar transparent />
      <CartDrawer />

      {/* ─── HERO ─── */}
      <section style={{ position: 'relative', height: '100svh', overflow: 'hidden', background: '#000' }}>
        <HeroSlider backgrounds={backgrounds} />

        {/* Hero content */}
        <div style={{
          position:        'absolute', inset: 0, zIndex: 3,
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          textAlign:       'center',
          padding:         '0 24px',
        }}>
          <p style={{
            fontFamily:    '"DM Mono",monospace',
            fontSize:      '0.6rem',
            letterSpacing: '0.45em',
            color:         '#d4a843',
            textTransform: 'uppercase',
            marginBottom:  '24px',
            animation:     'fadeIn 1.5s ease 0.3s both',
          }}>
            Algeria · Est. 2024
          </p>

          <h1 className="font-gothic gold-glow" style={{
            fontSize:      'clamp(5rem, 18vw, 18rem)',
            lineHeight:    0.85,
            letterSpacing: '0.02em',
            color:         '#d4a843',
            marginBottom:  '28px',
            animation:     'fadeIn 1.2s ease 0.1s both',
          }}>
            VALIO
          </h1>

          <p style={{
            fontFamily:    '"Playfair Display",serif',
            fontStyle:     'italic',
            fontSize:      'clamp(0.9rem, 2vw, 1.25rem)',
            color:         'rgba(232,232,232,0.7)',
            letterSpacing: '0.15em',
            marginBottom:  '52px',
            animation:     'fadeIn 1.5s ease 0.6s both',
          }}>
            {tagline}
          </p>

          <div style={{
            display:   'flex',
            gap:       '16px',
            flexWrap:  'wrap',
            justifyContent:'center',
            animation: 'slideUp 1s ease 0.9s both',
          }}>
            <Link href="/shop" className="btn-gold" style={{ textDecoration: 'none' }}>
              EXPLORE COLLECTION
            </Link>
            <Link href="/lookbook" className="btn-outline" style={{ textDecoration: 'none' }}>
              LOOKBOOK
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position:   'absolute', bottom: '32px', right: '40px',
          zIndex:     3,
          animation:  'fadeIn 2s ease 1.5s both',
          display:    'flex',
          flexDirection:'column',
          alignItems: 'center',
          gap:        '8px',
        }}>
          <div style={{
            width:       '1px',
            height:      '60px',
            background:  'linear-gradient(to bottom, rgba(212,168,67,0) 0%, rgba(212,168,67,0.6) 100%)',
            animation:   'spin 3s ease infinite', // reuse spin as a subtle pulse fallback
          }} />
          <span style={{
            fontFamily:    '"DM Mono",monospace',
            fontSize:      '0.55rem',
            letterSpacing: '0.3em',
            color:         '#555',
            textTransform: 'uppercase',
            writingMode:   'vertical-rl',
          }}>
            Scroll
          </span>
        </div>
      </section>

      {/* ─── MARQUEE STRIP ─── */}
      <div style={{ background: '#0c0c0c', borderTop: '1px solid #1e1e1e', borderBottom: '1px solid #1e1e1e', padding: '16px 0', overflow: 'hidden' }}>
        <Marquee text="VALIO — MADE FOR LEGACY — LUXURY STREETWEAR — ALGERIA" />
      </div>

      {/* ─── FEATURED PRODUCTS ─── */}
      {featuredProducts.length > 0 && (
        <section style={{ background: '#000', padding: 'clamp(60px,8vw,120px) clamp(20px,5vw,80px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Section header */}
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{
                fontFamily:    '"DM Mono",monospace', fontSize: '0.6rem',
                letterSpacing: '0.4em', color: '#d4a843', textTransform: 'uppercase',
                marginBottom:  '16px',
              }}>
                Latest Drops
              </p>
              <h2 style={{
                fontFamily:    '"Bebas Neue",sans-serif',
                fontSize:      'clamp(2.5rem,6vw,5rem)',
                letterSpacing: '0.06em', color: '#e8e8e8', lineHeight: 0.9,
              }}>
                FEATURED PIECES
              </h2>
              <div className="rule-gold" style={{ marginTop: '28px', maxWidth: '200px', margin: '28px auto 0' }} />
            </div>

            {/* Grid */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap:                 '2px',
            }}>
              {featuredProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} priority={i < 4} />
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <Link href="/shop" className="btn-outline" style={{ textDecoration: 'none' }}>
                VIEW ALL PRODUCTS
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── ETHOS SECTION ─── */}
      <section style={{
        background:     '#0a0a0a',
        borderTop:      '1px solid #1a1a1a',
        borderBottom:   '1px solid #1a1a1a',
        padding:        'clamp(80px,10vw,160px) clamp(24px,6vw,100px)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: '"Playfair Display",serif',
            fontStyle:  'italic',
            fontSize:   'clamp(1.4rem,3.5vw,2.5rem)',
            color:      '#aaa',
            lineHeight: 1.55,
            marginBottom:'48px',
          }}>
            "We don't make clothes. We forge identities for those who were
            never meant to blend in."
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '1px', background: 'rgba(212,168,67,0.4)' }} />
            <span style={{
              fontFamily:    '"DM Mono",monospace', fontSize: '0.65rem',
              letterSpacing: '0.3em', color: '#d4a843', textTransform: 'uppercase',
            }}>
              VALIO Studio
            </span>
            <div style={{ width: '40px', height: '1px', background: 'rgba(212,168,67,0.4)' }} />
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section style={{ background: '#000', padding: 'clamp(60px,8vw,120px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontFamily: '"Bebas Neue",sans-serif',
              fontSize:   'clamp(2rem,5vw,4rem)',
              letterSpacing:'0.06em', color: '#e8e8e8',
            }}>
              SHOP BY CATEGORY
            </h2>
          </div>
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap:                 '2px',
          }}>
            {[
              { label: 'HOODIES',     slug: 'hoodies',     emoji: '🖤' },
              { label: 'T-SHIRTS',    slug: 't-shirts',    emoji: '⬛' },
              { label: 'COMPRESSION', slug: 'compression', emoji: '💪' },
              { label: 'OUTERWEAR',   slug: 'outerwear',   emoji: '🌑' },
              { label: 'ACCESSORIES', slug: 'accessories', emoji: '⛓️' },
            ].map(cat => (
              <Link key={cat.slug} href={`/shop?category=${cat.slug}`}
                style={{ textDecoration: 'none' }}>
                <div style={{
                  background:  '#0c0c0c',
                  border:      '1px solid #1a1a1a',
                  padding:     '40px 24px',
                  textAlign:   'center',
                  transition:  'background 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background    = '#111';
                  e.currentTarget.style.borderColor   = 'rgba(212,168,67,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background    = '#0c0c0c';
                  e.currentTarget.style.borderColor   = '#1a1a1a';
                }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{cat.emoji}</div>
                  <p style={{
                    fontFamily:    '"Bebas Neue",sans-serif',
                    fontSize:      '1.1rem',
                    letterSpacing: '0.15em',
                    color:         '#888',
                    textTransform: 'uppercase',
                  }}>
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        background:  '#000',
        borderTop:   '1px solid #111',
        padding:     '60px clamp(20px,5vw,80px) 40px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '60px' }}>
            {/* Brand */}
            <div>
              <h3 className="font-gothic" style={{ fontSize: '1.8rem', color: '#d4a843', marginBottom: '12px' }}>VALIO</h3>
              <p style={{ color: '#555', fontSize: '0.8rem', fontFamily: '"DM Mono",monospace', letterSpacing: '0.1em', maxWidth: '240px' }}>
                Luxury Algerian streetwear.<br />Crafted for those who are built different.
              </p>
            </div>
            {/* Links */}
            <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>Shop</p>
                {['hoodies','t-shirts','compression','outerwear','accessories'].map(c => (
                  <Link key={c} href={`/shop?category=${c}`}
                    style={{ display: 'block', color: '#555', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '8px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#ccc'}
                    onMouseLeave={e => e.target.style.color = '#555'}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                ))}
              </div>
              <div>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>Info</p>
                {[['About', '/about'], ['Lookbook', '/lookbook'], ['Contact', '/contact']].map(([label, href]) => (
                  <Link key={href} href={href}
                    style={{ display: 'block', color: '#555', fontSize: '0.8rem', textDecoration: 'none', marginBottom: '8px', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#ccc'}
                    onMouseLeave={e => e.target.style.color = '#555'}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #111', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#2a2a2a' }}>
              © {new Date().getFullYear()} VALIO. ALL RIGHTS RESERVED.
            </p>
            <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: '#2a2a2a' }}>
              ALGERIA
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
