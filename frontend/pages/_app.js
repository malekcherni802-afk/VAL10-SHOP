import { useEffect } from 'react';
import Head from 'next/head';
import { CartProvider } from '../lib/CartContext';
import '../styles/globals.css';

/* ─── Lenis smooth scroll (client-only, dynamic import) ─────── */
if (typeof window !== 'undefined') {
  import('@studio-freight/lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({
      duration:    1.35,
      easing:      t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth:      true,
      smoothTouch: false,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }).catch(() => {});
}

/* ─── App ────────────────────────────────────────────────────── */
export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VALIO — Made for Legacy</title>
        <meta
          name="description"
          content="VALIO — Luxury Algerian streetwear. Crafted for those who are built different."
        />
      </Head>

      {/* Film grain overlay */}
      <div className="grain" aria-hidden="true" />

      <Component {...pageProps} />
    </CartProvider>
  );
}
