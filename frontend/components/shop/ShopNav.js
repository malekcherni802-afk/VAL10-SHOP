import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function ShopNav() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
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
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: 64,
        background: scrolled
          ? 'rgba(0,0,0,0.95)'
          : 'transparent',
        borderBottom: scrolled
          ? '1px solid var(--slag)'
          : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease',
      }}
    >
      {/* Left links */}
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        <Link href="/shop" className="nav-link">Collection</Link>
        <a href="#" className="nav-link">Lookbook</a>
      </div>

      {/* Logo center */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{
          fontFamily: 'var(--font-gothic)',
          fontSize: '1.6rem',
          color: '#fff',
          letterSpacing: '0.05em',
          lineHeight: 1,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--acid)'}
        onMouseLeave={e => e.currentTarget.style.color = '#fff'}
        >
          VALIO
        </div>
      </Link>

      {/* Right links */}
      <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
        <a href="#" className="nav-link">About</a>
        <Link href="/admin" className="nav-link" style={{ color: 'var(--mist)' }}>
          Admin
        </Link>
      </div>
    </nav>
  );
}
