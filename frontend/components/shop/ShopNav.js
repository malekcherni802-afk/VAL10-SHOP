import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ShopNav() {
  const navRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 80) {
        nav.style.background = 'rgba(0,0,0,0.95)';
        nav.style.borderBottom = '1px solid rgba(192,160,96,0.2)';
        nav.style.backdropFilter = 'blur(12px)';
      } else {
        nav.style.background = 'transparent';
        nav.style.borderBottom = '1px solid transparent';
        nav.style.backdropFilter = 'none';
      }

      if (y > lastY + 5 && y > 200) {
        nav.style.transform = 'translateY(-100%)';
      } else if (y < lastY - 5) {
        nav.style.transform = 'translateY(0)';
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 48px',
        transition: 'background 0.4s ease, border-color 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Left nav */}
      <div style={{ display: 'flex', gap: '40px' }}>
        {['Collection', 'Lookbook'].map(item => (
          <Link
            key={item}
            href={item === 'Collection' ? '/shop' : '#'}
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              color: 'rgba(192,192,192,0.7)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,192,192,0.7)'}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Logo center */}
      <Link href="/shop" style={{ textDecoration: 'none' }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontWeight: 900,
          fontSize: '1.4rem',
          letterSpacing: '0.5em',
          color: '#fff',
          textShadow: '0 0 30px rgba(192,160,96,0.2)',
        }}>
          VALIO
        </div>
      </Link>

      {/* Right nav */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {['About', 'Contact'].map(item => (
          <a
            key={item}
            href="#"
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              color: 'rgba(192,192,192,0.7)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(192,192,192,0.7)'}
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
