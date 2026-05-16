import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function PageTransition() {
  const overlayRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Hide on mount
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';

    const handleStart = () => {
      overlay.style.pointerEvents = 'all';
      overlay.style.opacity = '1';
      overlay.style.transition = 'opacity 0.4s ease';
    };

    const handleDone = () => {
      overlay.style.transition = 'opacity 0.6s ease 0.2s';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.pointerEvents = 'none';
      }, 800);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleDone);
    router.events.on('routeChangeError', handleDone);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleDone);
      router.events.off('routeChangeError', handleDone);
    };
  }, [router]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9995,
        pointerEvents: 'none',
        opacity: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '2rem',
        letterSpacing: '0.4em',
        color: 'var(--accent)',
        opacity: 0.8,
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        V A L I O
      </div>
    </div>
  );
}
