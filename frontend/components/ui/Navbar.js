import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/CartContext';

export default function Navbar({ transparent = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible,  setVisible]  = useState(true);
  const { count, setOpen: setCartOpen } = useCart();
  const lastScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y > lastScroll.current + 8 && y > 120) {
        setVisible(false);
      } else if (y < lastScroll.current - 8) {
        setVisible(true);
      }
      lastScroll.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bg = scrolled || !transparent ? 'rgba(0,0,0,0.92)' : 'transparent';

  const navStyle = {
    position:       'fixed',
    top:            0,
    left:           0,
    right:          0,
    zIndex:         9990,
    background:     bg,
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom:   scrolled
      ? '1px solid rgba(212,168,67,0.12)'
      : '1px solid transparent',
    transition:
      'background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease, transform 0.35s ease',
    transform: visible ? 'translateY(0)' : 'translateY(-100%)',
  };

  return (
    <>
      <nav style={navStyle}>
        <div
          style={{
            maxWidth:       '1400px',
            margin:         '0 auto',
            padding:        '0 32px',
            height:         '68px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily:    '"Uncial Antiqua", serif',
                fontSize:      '1.45rem',
                color:         '#d4a843',
                letterSpacing: '0.06em',
                textShadow:    '0 0 30px rgba(212,168,67,0.35)',
              }}
            >
              VALIO
            </span>
          </Link>

          {/* Desktop links */}
          <div
            style={{ display: 'flex', gap: '36px', alignItems: 'center' }}
            className="hidden-mobile"
          >
            <Link href="/shop"     className="nav-link">Shop</Link>
            <Link href="/about"    className="nav-link">About</Link>
            <Link href="/lookbook" className="nav-link">Lookbook</Link>
            <Link href="/contact"  className="nav-link">Contact</Link>
          </div>

          {/* Right icons */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              style={{
                background: 'none',
                border:     'none',
                color:      '#ccc',
                position:   'relative',
                padding:    '4px',
              }}
            >
              <svg
                width="22" height="22"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {count > 0 && (
                <span
                  style={{
                    position:       'absolute',
                    top:            '-4px',
                    right:          '-4px',
                    background:     '#d4a843',
                    color:          '#000',
                    fontSize:       '0.55rem',
                    fontFamily:     '"DM Mono", monospace',
                    fontWeight:     '500',
                    width:          '16px',
                    height:         '16px',
                    borderRadius:   '50%',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                  }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              className="show-mobile"
              style={{ background: 'none', border: 'none', color: '#ccc', padding: '4px' }}
            >
              <svg
                width="22" height="22"
                fill="none" stroke="currentColor" strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              background:    'rgba(0,0,0,0.97)',
              borderTop:     '1px solid rgba(212,168,67,0.1)',
              padding:       '32px',
              display:       'flex',
              flexDirection: 'column',
              gap:           '28px',
            }}
          >
            {['shop', 'about', 'lookbook', 'contact'].map(p => (
              <Link
                key={p}
                href={`/${p}`}
                className="nav-link"
                style={{ fontSize: '1.2rem', letterSpacing: '0.2em' }}
                onClick={() => setMenuOpen(false)}
              >
                {p.toUpperCase()}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style jsx global>{`
        @media (max-width: 768px)  { .hidden-mobile { display: none !important; } }
        @media (min-width: 769px)  { .show-mobile   { display: none !important; } }
      `}</style>
    </>
  );
}
