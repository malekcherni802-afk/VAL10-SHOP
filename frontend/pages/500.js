import Head from 'next/head';
import Link from 'next/link';

export default function ServerErrorPage() {
  return (
    <>
      <Head>
        <title>500 — VALIO</title>
      </Head>

      <main style={{
        background:     '#000',
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '120px 24px',
        textAlign:      'center',
      }}>
        <div>
          <p style={{
            fontFamily:    '"Bebas Neue",sans-serif',
            fontSize:      'clamp(6rem,20vw,18rem)',
            color:         '#0c0c0c',
            lineHeight:    1,
            letterSpacing: '0.05em',
            userSelect:    'none',
            pointerEvents: 'none',
          }}>
            500
          </p>
          <p style={{
            fontFamily:    '"DM Mono",monospace',
            fontSize:      '0.6rem',
            letterSpacing: '0.4em',
            color:         '#e05555',
            textTransform: 'uppercase',
            marginTop:     '-24px',
            marginBottom:  '24px',
          }}>
            Server Error
          </p>
          <p style={{ color: '#444', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px' }}>
            Something went wrong on our end. Please try again in a moment.
          </p>
          <Link href="/" style={{
            background:    '#d4a843',
            color:         '#000',
            fontFamily:    '"Bebas Neue",sans-serif',
            fontSize:      '1rem',
            letterSpacing: '0.15em',
            padding:       '16px 48px',
            textDecoration:'none',
            display:       'inline-block',
          }}>
            GO HOME
          </Link>
        </div>
      </main>
    </>
  );
}
