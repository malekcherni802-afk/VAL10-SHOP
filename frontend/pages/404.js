import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <>
      <Head><title>404 — VALIO</title></Head>
      <div style={{
        minHeight: '100vh',
        background: 'var(--void)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 40,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(200,255,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,255,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            color: 'var(--acid)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            opacity: 0.15,
            marginBottom: -20,
          }}>
            404
          </div>

          <div style={{
            fontFamily: 'var(--font-gothic)',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            color: '#fff',
            marginBottom: 24,
          }}>
            Lost in the Dark
          </div>

          <p style={{
            fontFamily: 'var(--font-label)',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            color: 'var(--mist)',
            textTransform: 'uppercase',
            marginBottom: 48,
            maxWidth: 400,
          }}>
            This shadow does not exist. Return to the collection.
          </p>

          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
            Return to VALIO
          </Link>
        </motion.div>
      </div>
    </>
  );
}
