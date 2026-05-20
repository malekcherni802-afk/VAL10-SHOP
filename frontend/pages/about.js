import Head from 'next/head';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/ui/Navbar';
import CartDrawer from '../components/ui/CartDrawer';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About — VALIO</title>
        <meta name="description" content="The story behind VALIO — Algeria's luxury streetwear brand built for those who are different." />
      </Head>

      <CustomCursor />
      <Navbar />
      <CartDrawer />

      <main style={{ background: '#000', minHeight: '100vh', paddingTop: '68px' }}>

        {/* ── Hero ── */}
        <section style={{
          padding:    'clamp(80px,12vw,160px) clamp(24px,6vw,100px)',
          borderBottom: '1px solid #111',
          background: 'linear-gradient(to bottom, #0c0c0c 0%, #000 100%)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <p style={{
              fontFamily:    '"DM Mono",monospace',
              fontSize:      '0.6rem',
              letterSpacing: '0.4em',
              color:         '#d4a843',
              textTransform: 'uppercase',
              marginBottom:  '20px',
            }}>
              Our Story
            </p>
            <h1 style={{
              fontFamily:    '"Bebas Neue",sans-serif',
              fontSize:      'clamp(3.5rem,10vw,9rem)',
              letterSpacing: '0.03em',
              color:         '#e8e8e8',
              lineHeight:    0.88,
              marginBottom:  '48px',
            }}>
              BUILT FOR<br />LEGACY
            </h1>
            <p style={{
              fontFamily:  '"Playfair Display",serif',
              fontStyle:   'italic',
              fontSize:    'clamp(1rem,2.5vw,1.4rem)',
              color:       '#aaa',
              lineHeight:  1.75,
              maxWidth:    '680px',
            }}>
              VALIO was born from a simple truth: Algeria has always produced
              greatness. We just needed a brand that looked like it.
            </p>
          </div>
        </section>

        {/* ── Origin ── */}
        <section style={{ padding: 'clamp(60px,8vw,120px) clamp(24px,6vw,100px)', borderBottom: '1px solid #111' }}>
          <div style={{
            maxWidth:            '1200px',
            margin:              '0 auto',
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap:                 'clamp(48px,8vw,100px)',
            alignItems:          'center',
          }}>
            <div>
              <p style={{
                fontFamily:    '"DM Mono",monospace',
                fontSize:      '0.6rem',
                letterSpacing: '0.3em',
                color:         '#d4a843',
                textTransform: 'uppercase',
                marginBottom:  '16px',
              }}>
                The Origin
              </p>
              <h2 style={{
                fontFamily:    '"Bebas Neue",sans-serif',
                fontSize:      'clamp(2rem,5vw,4rem)',
                letterSpacing: '0.05em',
                color:         '#e8e8e8',
                lineHeight:    0.95,
                marginBottom:  '28px',
              }}>
                FROM ALGIERS<br />TO THE WORLD
              </h2>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.9', marginBottom: '20px' }}>
                We started in 2024 with one goal: create garments that carry the
                weight and intensity of Algerian identity without apologising for it.
                No diluted aesthetics, no compromise.
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.9' }}>
                Every piece in the VALIO collection is designed from the ground up —
                the fabrication, the silhouette, the finishing. This is not a brand
                that sources blanks and prints on them. This is craft.
              </p>
            </div>

            {/* Decorative number block */}
            <div style={{
              background:  '#0c0c0c',
              border:      '1px solid #1a1a1a',
              padding:     '48px',
              display:     'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:         '2px',
            }}>
              {[
                { num: '2024', label: 'Founded' },
                { num: '100%', label: 'Algerian' },
                { num: '∞',    label: 'Legacy' },
                { num: '0',    label: 'Compromises' },
              ].map(({ num, label }) => (
                <div key={label} style={{
                  padding:     '32px 24px',
                  background:  '#080808',
                  textAlign:   'center',
                }}>
                  <p style={{
                    fontFamily:    '"Bebas Neue",sans-serif',
                    fontSize:      '2.8rem',
                    color:         '#d4a843',
                    letterSpacing: '0.05em',
                    lineHeight:    1,
                    marginBottom:  '8px',
                  }}>
                    {num}
                  </p>
                  <p style={{
                    fontFamily:    '"DM Mono",monospace',
                    fontSize:      '0.55rem',
                    letterSpacing: '0.2em',
                    color:         '#444',
                    textTransform: 'uppercase',
                  }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Philosophy ── */}
        <section style={{
          padding:    'clamp(60px,8vw,120px) clamp(24px,6vw,100px)',
          background: '#060606',
          borderBottom: '1px solid #111',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <p style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.4em', color: '#d4a843', textTransform: 'uppercase', marginBottom: '16px' }}>
                Philosophy
              </p>
              <h2 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: 'clamp(2.5rem,6vw,5rem)', letterSpacing: '0.04em', color: '#e8e8e8', lineHeight: 0.9 }}>
                THE VALIO CODE
              </h2>
              <div className="rule-gold" style={{ marginTop: '28px', maxWidth: '180px', margin: '28px auto 0' }} />
            </div>

            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap:                 '2px',
            }}>
              {[
                {
                  num:   '01',
                  title: 'UNCOMPROMISING QUALITY',
                  body:  'We use premium heavyweight fabrics sourced specifically for each design. If it doesn\'t feel like an investment, it doesn\'t leave the studio.',
                },
                {
                  num:   '02',
                  title: 'INTENTIONAL DESIGN',
                  body:  'Every graphic, every silhouette, every seam placement is deliberate. Our aesthetic is dark, considered, and rooted in Algerian identity.',
                },
                {
                  num:   '03',
                  title: 'LIMITED BY DESIGN',
                  body:  'We do not mass-produce. Each drop is limited. When it\'s gone, it\'s gone. Exclusivity is not a marketing trick — it\'s how we maintain integrity.',
                },
                {
                  num:   '04',
                  title: 'BUILT TO LAST',
                  body:  'Fast fashion is the enemy of legacy. VALIO garments are made to outlast trends, seasons, and the brands that fade while we endure.',
                },
              ].map(({ num, title, body }) => (
                <div key={num} style={{
                  background:  '#0a0a0a',
                  border:      '1px solid #161616',
                  padding:     '36px 28px',
                  transition:  'border-color 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#161616'}
                >
                  <p style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '3rem', color: 'rgba(212,168,67,0.15)', lineHeight: 1, marginBottom: '16px' }}>
                    {num}
                  </p>
                  <h3 style={{ fontFamily: '"Bebas Neue",sans-serif', fontSize: '1.2rem', letterSpacing: '0.1em', color: '#d4a843', marginBottom: '14px' }}>
                    {title}
                  </h3>
                  <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: '1.8' }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing statement ── */}
        <section style={{ padding: 'clamp(80px,10vw,160px) clamp(24px,6vw,100px)' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontFamily:  '"Playfair Display",serif',
              fontStyle:   'italic',
              fontSize:    'clamp(1.3rem,3vw,2.2rem)',
              color:       '#888',
              lineHeight:  1.65,
              marginBottom:'48px',
            }}>
              "VALIO is not for everyone. It was never supposed to be.
              It is for those who carry a different weight — and wear it like armour."
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginBottom: '52px' }}>
              <div style={{ width: '32px', height: '1px', background: 'rgba(212,168,67,0.35)' }} />
              <span style={{ fontFamily: '"DM Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: '#d4a843', textTransform: 'uppercase' }}>
                The Founders
              </span>
              <div style={{ width: '32px', height: '1px', background: 'rgba(212,168,67,0.35)' }} />
            </div>
            <a href="/shop" className="btn-gold" style={{ textDecoration: 'none' }}>
              SHOP THE COLLECTION
            </a>
          </div>
        </section>

      </main>
    </>
  );
}
