import Head from 'next/head';
import Link from 'next/link';
import SmokeCanvas from '../components/intro/SmokeCanvas';

export default function NotFound() {
  return (
    <>
      <Head><title>404 — VALIO</title></Head>
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <SmokeCanvas opacity={0.3} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 900,
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            color: 'rgba(192,160,96,0.08)',
            lineHeight: 1,
            letterSpacing: '0.1em',
            userSelect: 'none',
          }}>
            404
          </div>

          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.7rem',
            letterSpacing: '0.4em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Lost in the Dark
          </div>

          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.1rem',
            color: 'rgba(192,192,192,0.4)',
            fontStyle: 'italic',
            marginBottom: 48,
          }}>
            This page has vanished into the void.
          </div>

          <Link href="/shop">
            <button style={{
              background: 'transparent',
              border: '1px solid rgba(192,160,96,0.5)',
              color: 'var(--accent)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              padding: '14px 40px',
              cursor: 'none',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,160,96,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Return to Collection
            </button>
          </Link>
        </div>

        {/* Corner decorations */}
        {[
          { top: 32, left: 32, borderTop: true, borderLeft: true },
          { top: 32, right: 32, borderTop: true, borderRight: true },
          { bottom: 32, left: 32, borderBottom: true, borderLeft: true },
          { bottom: 32, right: 32, borderBottom: true, borderRight: true },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...c,
            width: 40,
            height: 40,
            borderTop: c.borderTop ? '1px solid rgba(192,160,96,0.25)' : undefined,
            borderBottom: c.borderBottom ? '1px solid rgba(192,160,96,0.25)' : undefined,
            borderLeft: c.borderLeft ? '1px solid rgba(192,160,96,0.25)' : undefined,
            borderRight: c.borderRight ? '1px solid rgba(192,160,96,0.25)' : undefined,
          }} />
        ))}
      </div>
    </>
  );
}
