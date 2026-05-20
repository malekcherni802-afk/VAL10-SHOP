import Head from 'next/head';
import Link from 'next/link';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/ui/Navbar';
import CartDrawer from '../components/ui/CartDrawer';

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 — VALIO</title>
      </Head>

      <CustomCursor />
      <Navbar />
      <CartDrawer />

      <main style={{
        background:      '#000',
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '120px 24px',
        textAlign:       'center',
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
            marginBottom:  '0',
          }}>
            404
          </p>
          <p style={{
            fontFamily:    '"DM Mono",monospace',
            fontSize:      '0.6rem',
            letterSpacing: '0.4em',
            color:         '#d4a843',
            textTransform: 'uppercase',
            marginTop:     '-24px',
            marginBottom:  '24px',
          }}>
            Page Not Found
          </p>
          <p style={{
            color:       '#444',
            fontSize:    '0.9rem',
            lineHeight:  '1.8',
            marginBottom:'40px',
            maxWidth:    '400px',
            margin:      '0 auto 40px',
          }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn-gold" style={{ textDecoration: 'none' }}>
              GO HOME
            </Link>
            <Link href="/shop" className="btn-outline" style={{ textDecoration: 'none' }}>
              SHOP
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
