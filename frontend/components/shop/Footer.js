export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--obsidian)',
      borderTop: '1px solid var(--slag)',
      padding: '80px 64px 48px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 48,
          marginBottom: 64,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: '2.4rem',
              color: '#fff',
              marginBottom: 16,
              lineHeight: 1,
            }}>
              VALIO
            </div>
            <div style={{
              fontFamily: 'var(--font-label)',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: 'var(--mist)',
              textTransform: 'uppercase',
              lineHeight: 1.8,
              maxWidth: 240,
            }}>
              Industrial gothic luxury streetwear. Dark alternative fashion for those who refuse the ordinary.
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.3em',
              color: 'var(--acid)',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}>
              Navigate
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Collection', 'Lookbook', 'About', 'Contact', 'Sizing'].map(l => (
                <a key={l} href="#" style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  color: 'var(--mist)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  transition: 'color 0.25s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--chrome)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--mist)'}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.3em',
              color: 'var(--acid)',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}>
              Contact
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--mist)',
              lineHeight: 2.2,
            }}>
              <div>contact@valio.dark</div>
              <div>Mon — Sat · 10:00 — 18:00</div>
              <div style={{ marginTop: 16, color: 'var(--acid)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Worldwide Shipping
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="rule-h" style={{ marginBottom: 32 }} />

        {/* Bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.2em',
            color: 'rgba(90,90,90,0.6)',
            textTransform: 'uppercase',
          }}>
            © {year} VALIO. All rights reserved.
          </div>
          <div style={{
            fontFamily: 'var(--font-label)',
            fontStyle: 'italic',
            fontSize: '0.75rem',
            color: 'rgba(200,255,0,0.3)',
            letterSpacing: '0.1em',
          }}>
            Wear the Darkness
          </div>
        </div>
      </div>
    </footer>
  );
}
