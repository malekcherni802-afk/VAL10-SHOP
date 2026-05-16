export default function Footer() {
  return (
    <footer style={{
      background: '#000',
      borderTop: '1px solid rgba(192,160,96,0.15)',
      padding: '60px 48px 40px',
      marginTop: '120px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 60,
        marginBottom: 60,
      }}>
        {/* Brand */}
        <div>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 900,
            fontSize: '1.8rem',
            letterSpacing: '0.5em',
            color: '#fff',
            marginBottom: 16,
          }}>
            VALIO
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '0.95rem',
            color: 'rgba(192,192,192,0.5)',
            lineHeight: 1.8,
            maxWidth: 280,
          }}>
            Gothic luxury fashion for those who embrace the darkness. Every piece tells a story of shadow and elegance.
          </div>
        </div>

        {/* Links */}
        <div>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            marginBottom: 24,
            textTransform: 'uppercase',
          }}>
            Navigate
          </div>
          {['Collection', 'About', 'Lookbook', 'Contact', 'Sizing Guide'].map(link => (
            <div key={link} style={{ marginBottom: 12 }}>
              <a href="#" style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '0.95rem',
                color: 'rgba(192,192,192,0.5)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(192,192,192,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,192,192,0.5)'}
              >
                {link}
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--accent)',
            marginBottom: 24,
            textTransform: 'uppercase',
          }}>
            Contact
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '0.95rem',
            color: 'rgba(192,192,192,0.5)',
            lineHeight: 2,
          }}>
            <div>contact@valio.dark</div>
            <div>+1 (000) 000-0000</div>
            <div style={{ marginTop: 16 }}>Mon — Sat</div>
            <div>10:00 — 18:00</div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '0.6rem',
          letterSpacing: '0.15em',
          color: 'rgba(192,192,192,0.3)',
        }}>
          © {new Date().getFullYear()} VALIO. ALL RIGHTS RESERVED.
        </div>

        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '0.8rem',
          color: 'rgba(192,160,96,0.4)',
          fontStyle: 'italic',
        }}>
          Wear the Darkness
        </div>
      </div>
    </footer>
  );
}
