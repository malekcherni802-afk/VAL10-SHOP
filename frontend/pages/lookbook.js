import Head from 'next/head';
import Link from 'next/link';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/ui/Navbar';
import CartDrawer from '../components/ui/CartDrawer';
import { fetchBackgrounds } from '../lib/api';

export async function getServerSideProps() {
  try {
    const data = await fetchBackgrounds().catch(() => ({ backgrounds: [] }));
    return { props: { backgrounds: data.backgrounds || [] } };
  } catch {
    return { props: { backgrounds: [] } };
  }
}

export default function LookbookPage({ backgrounds }) {
  return (
    <>
      <Head>
        <title>Lookbook — VALIO</title>
        <meta name="description" content="VALIO Lookbook — editorial photography of the collection." />
      </Head>

      <CustomCursor />
      <Navbar transparent={backgrounds.length > 0} />
      <CartDrawer />

      <main style={{ background: '#000', minHeight: '100vh', paddingTop: backgrounds.length > 0 ? '0' : '68px' }}>

        {/* ── Full-bleed hero (first background image) ── */}
        {backgrounds.length > 0 && (
          <section style={{ position: 'relative', height: '100svh', overflow: 'hidden' }}>
            <img
              src={backgrounds[0].url}
              alt="VALIO Lookbook"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                display: 'block',
                filter: 'brightness(0.55)',
              }}
            />
            <div style={{
              position:       'absolute', inset: 0,
              background:     'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.95) 100%)',
              display:        'flex',
              flexDirection:  'column',
              justifyContent: 'flex-end',
              padding:        'clamp(40px,6vw,80px)',
            }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>
                Editorial
              </p>
              <h1 style={{
                fontFamily:    '"Bebas Neue",sans-serif',
                fontSize:      'clamp(3.5rem,10vw,10rem)',
                letterSpacing: '0.04em',
                color:         '#e8e8e8',
                lineHeight:    0.88,
                marginBottom:  '28px',
              }}>
                THE LOOKBOOK
              </h1>
              <p style={{ color: '#666', fontFamily: '"Playfair Display",serif', fontStyle: 'italic', fontSize: 'clamp(0.9rem,2vw,1.2rem)', marginBottom: '40px', maxWidth: '480px', lineHeight: 1.7 }}>
                A visual language for those who speak through what they wear.
              </p>
              <div>
                <a href="#gallery" className="btn-outline" style={{ textDecoration: 'none' }}>
                  VIEW GALLERY
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── Header (no backgrounds) ── */}
        {backgrounds.length === 0 && (
          <div style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,100px)', borderBottom: '1px solid #111', background: '#0c0c0c' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>Editorial</p>
              <h1 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(3rem,8vw,8rem)', letterSpacing: '0.04em', color: '#e8e8e8', lineHeight: 0.9 }}>
                THE LOOKBOOK
              </h1>
            </div>
          </div>
        )}

        {/* ── Gallery grid ── */}
        <section id="gallery" style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

            {backgrounds.length > 1 ? (
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap:                 '4px',
              }}>
                {backgrounds.slice(1).map((bg, i) => (
                  <div key={bg._id || i} style={{
                    overflow:   'hidden',
                    background: '#0c0c0c',
                    aspectRatio: i % 5 === 0 ? '4/5' : '3/4',
                    position:   'relative',
                    cursor:     'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { e.currentTarget.querySelector('img').style.transform = 'scale(1)'; }}
                  >
                    <img
                      src={bg.url}
                      alt={bg.label || `Lookbook ${i + 2}`}
                      style={{
                        width:      '100%', height: '100%',
                        objectFit:  'cover',
                        display:    'block',
                        transition: 'transform 0.8s cubic-bezier(0.76,0,0.24,1)',
                      }}
                    />
                    {bg.label && (
                      <div style={{
                        position:    'absolute', bottom: 0, left: 0, right: 0,
                        padding:     '20px 16px',
                        background:  'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                        opacity:     0, transition: 'opacity 0.35s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>
                          {bg.label}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.75rem', letterSpacing: '0.25em', color: '#333', textTransform: 'uppercase', marginBottom: '32px' }}>
                  Lookbook imagery coming soon
                </p>
                <Link href="/shop" className="btn-outline" style={{ textDecoration: 'none' }}>
                  BROWSE THE COLLECTION
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Shop CTA ── */}
        <section style={{
          borderTop:  '1px solid #111',
          padding:    'clamp(60px,8vw,100px) clamp(24px,6vw,100px)',
          textAlign:  'center',
          background: '#060606',
        }}>
          <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#555', textTransform: 'uppercase', marginBottom: '16px' }}>
            Own the look
          </p>
          <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(2rem,5vw,4.5rem)', letterSpacing: '0.05em', color: '#e8e8e8', marginBottom: '36px' }}>
            SHOP THE COLLECTION
          </h2>
          <Link href="/shop" className="btn-gold" style={{ textDecoration: 'none' }}>
            EXPLORE NOW
          </Link>
        </section>

      </main>
    </>
  );
}
