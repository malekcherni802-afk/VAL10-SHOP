import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts, getImageUrl, fetchBackgrounds, fetchSettings } from '../lib/api';

/* ── STAGE ─────────────────────────────────────────────────── */
const S = { INTRO: 'intro', PORTAL: 'portal', SHOP: 'shop' };

/* ── REAL BRAND PHOTOS ──────────────────────────────────────── */
const SLIDES = [
  '/lookbook-8.jpg', // sunset field – cinematic wide
  '/lookbook-7.jpg', // two hoodies from behind, rocky hillside
  '/lookbook-1.jpg', // Made for Legacy street
  '/lookbook-5.jpg', // gym long-sleeve black
  '/lookbook-6.jpg', // logo close-up
  '/lookbook-4.jpg', // group gym shot
  '/lookbook-2.jpg', // duo gym pose
  '/lookbook-3.jpg', // two guys crossed arms
];

/* ════════════════════════════════════════════════════════════ */
/*  BOUTIQUE BACKGROUND                                        */
/* ════════════════════════════════════════════════════════════ */
function BoutiqueScene({ opacity = 0.6, imgWidth = '100%', imgHeight = '100%' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Dimly lit boutique — real photo as backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/lookbook-7.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        filter: `brightness(${opacity * 0.3}) saturate(0.6)`,
        width: imgWidth,
        height: imgHeight,
        transform: 'scale(1.05)',
      }} />

      {/* Atmospheric deep gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 70% 80% at 50% 60%,
            rgba(12,8,4,0.55) 0%,
            rgba(0,0,0,0.92) 100%
          )
        `,
      }} />

      {/* Gold light shafts */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 30% 60% at 50% 0%,
            rgba(212,168,67,0.07) 0%,
            transparent 70%
          )
        `,
      }} />

      {/* SVG clothing rack silhouettes */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          opacity: 0.22,
        }}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#1a1208" />
            <stop offset="20%"  stopColor="#4a3a20" />
            <stop offset="50%"  stopColor="#8a6a38" />
            <stop offset="80%"  stopColor="#4a3a20" />
            <stop offset="100%" stopColor="#1a1208" />
          </linearGradient>
          <linearGradient id="garGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2a2218" />
            <stop offset="100%" stopColor="#0a0806" />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Left rack */}
        <rect x="60" y="120" width="500" height="8" rx="4" fill="url(#barGrad)" filter="url(#glow2)" />
        <rect x="60"  y="125" width="5" height="640" fill="#2a1e10" />
        <rect x="560" y="125" width="5" height="640" fill="#2a1e10" />

        {/* Left rack garments */}
        {[105, 175, 248, 320, 395, 470].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="125" x2={x} y2="148" stroke="#6a5030" strokeWidth="1.5"/>
            <path d={`M${x-12},148 Q${x},132 ${x+12},148`} fill="none" stroke="#7a6040" strokeWidth="1.8"/>
            <path
              d={`M${x-24},148 L${x-28},200 L${x-22},750 L${x+22},750 L${x+28},200 L${x+24},148 Z`}
              fill="url(#garGrad)" opacity="0.9"
            />
            <path
              d={`M${x-28},148 L${x-38},200 L${x-32},750 L${x-22},750 L${x-22},200 Z`}
              fill="#08060404" opacity="0.7"
            />
          </g>
        ))}

        {/* Right rack */}
        <rect x="880" y="140" width="500" height="8" rx="4" fill="url(#barGrad)" filter="url(#glow2)" />
        <rect x="880"  y="145" width="5" height="640" fill="#2a1e10" />
        <rect x="1380" y="145" width="5" height="640" fill="#2a1e10" />

        {/* Right rack garments */}
        {[920, 995, 1070, 1145, 1220, 1300].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="145" x2={x} y2="168" stroke="#6a5030" strokeWidth="1.5"/>
            <path d={`M${x-12},168 Q${x},152 ${x+12},168`} fill="none" stroke="#7a6040" strokeWidth="1.8"/>
            <path
              d={`M${x-22},168 L${x-26},215 L${x-20},750 L${x+20},750 L${x+26},215 L${x+22},168 Z`}
              fill="url(#garGrad)" opacity="0.85"
            />
          </g>
        ))}

        {/* Floor shadow */}
        <ellipse cx="720" cy="800" rx="680" ry="35" fill="rgba(0,0,0,0.6)" />

        {/* Atmospheric floor reflection */}
        <rect x="0" y="760" width="1440" height="140" fill="url(#garGrad)" opacity="0.3" />
      </svg>

      {/* Fine grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(212,168,67,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,67,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* Bottom vignette */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.98), transparent)',
      }} />
      {/* Side vignettes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)',
      }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  INTRO SCREEN                                               */
/* ════════════════════════════════════════════════════════════ */
function IntroScreen({ onShop, introOpacity, introImgWidth, introImgHeight, introEnabled }) {
  const [ready, setReady] = useState(false);
  const [oHover, setOHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const ease = [0.76, 0, 0.24, 1];
  const letters = ['V', 'A', 'L', 'I'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {introEnabled !== false && (
        <BoutiqueScene opacity={introOpacity} imgWidth={introImgWidth} imgHeight={introImgHeight} />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>

        {/* Season label */}
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.8em' }}
          animate={ready ? { opacity: 1, letterSpacing: '0.4em' } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease }}
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.58rem',
            letterSpacing: '0.4em',
            color: 'rgba(212,168,67,0.65)',
            textTransform: 'uppercase',
            marginBottom: 36,
          }}
        >
          Dark Season 2025 · Limited Edition
        </motion.div>

        {/* LOGO */}
        <div style={{
          display: 'flex', alignItems: 'baseline',
          justifyContent: 'center', lineHeight: 1,
          userSelect: 'none',
        }}>
          {letters.map((l, i) => (
            <motion.span
              key={l}
              initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
              animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.9, delay: 0.6 + i * 0.1, ease }}
              style={{
                fontFamily: '"Uncial Antiqua", serif',
                fontSize: 'clamp(5.5rem, 15vw, 13rem)',
                color: '#fff',
                textShadow: '0 4px 60px rgba(0,0,0,0.8)',
                display: 'inline-block',
              }}
            >
              {l}
            </motion.span>
          ))}

          {/* The portal O */}
          <motion.span
            id="portal-o"
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.9, delay: 1.0, ease }}
            onClick={onShop}
            onMouseEnter={() => setOHover(true)}
            onMouseLeave={() => setOHover(false)}
            style={{
              fontFamily: '"Uncial Antiqua", serif',
              fontSize: 'clamp(5.5rem, 15vw, 13rem)',
              color: oHover ? 'var(--gold)' : '#fff',
              textShadow: oHover
                ? '0 0 50px rgba(212,168,67,0.9), 0 0 120px rgba(212,168,67,0.3)'
                : '0 4px 60px rgba(0,0,0,0.8)',
              display: 'inline-block',
              cursor: 'none',
              transform: oHover ? 'scale(1.08)' : 'scale(1)',
              transition: 'color .35s ease, text-shadow .35s ease, transform .35s ease',
              position: 'relative',
            }}
          >
            O
            {/* Pulsing inner ring hint */}
            {oHover && (
              <motion.span
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 3.5, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                  position: 'absolute', inset: '15% 20%',
                  border: '1px solid rgba(212,168,67,0.7)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.span>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.3, ease }}
          style={{
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
            color: 'rgba(212,168,67,0.55)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginTop: 20,
            marginBottom: 64,
          }}
        >
          Made for Legacy
        </motion.p>

        {/* GO SHOP button */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.6, ease }}
        >
          <button className="btn-gold" onClick={onShop} style={{ fontSize: '1.1rem', padding: '18px 64px' }}>
            GO SHOP
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9H14.5M10 4.5L14.5 9L10 13.5"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Corner marks */}
      {['tl','tr','bl','br'].map((p, i) => (
        <motion.div
          key={p}
          initial={{ opacity: 0, scale: 0 }}
          animate={ready ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 2 + i * 0.08 }}
          style={{
            position: 'absolute', zIndex: 3,
            width: 20, height: 20,
            ...(p === 'tl' && { top: 32, left: 32, borderTop: '1px solid rgba(212,168,67,0.4)', borderLeft: '1px solid rgba(212,168,67,0.4)' }),
            ...(p === 'tr' && { top: 32, right: 32, borderTop: '1px solid rgba(212,168,67,0.4)', borderRight: '1px solid rgba(212,168,67,0.4)' }),
            ...(p === 'bl' && { bottom: 32, left: 32, borderBottom: '1px solid rgba(212,168,67,0.4)', borderLeft: '1px solid rgba(212,168,67,0.4)' }),
            ...(p === 'br' && { bottom: 32, right: 32, borderBottom: '1px solid rgba(212,168,67,0.4)', borderRight: '1px solid rgba(212,168,67,0.4)' }),
          }}
        />
      ))}

      {/* Bottom meta */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 2.2 }}
        style={{
          position: 'absolute', bottom: 32, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: 48, zIndex: 2,
        }}
      >
        {['Handcrafted', 'Limited Runs', 'Premium Fabric'].map(t => (
          <span key={t} style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '0.5rem', letterSpacing: '0.25em',
            color: 'rgba(232,232,232,0.18)', textTransform: 'uppercase',
          }}>
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PORTAL TRANSITION                                          */
/* ════════════════════════════════════════════════════════════ */
function PortalTransition({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 1 }}
    >
      {/* The O letter expanding into portal */}
      <motion.div
        initial={{ scale: 1, borderRadius: '50%' }}
        animate={{ scale: [1, 1.4, 6, 60], borderRadius: ['50%', '50%', '50%', '0%'] }}
        transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], times: [0, 0.15, 0.65, 1] }}
        style={{
          width: 'clamp(70px, 11vw, 130px)',
          height: 'clamp(70px, 11vw, 130px)',
          background: '#000',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 60px rgba(212,168,67,0.8), 0 0 120px rgba(212,168,67,0.3), inset 0 0 40px rgba(212,168,67,0.1)',
          position: 'absolute',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Expanding ring */}
        <motion.div
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute', inset: 0,
            border: '1px solid var(--gold)',
            borderRadius: '50%',
          }}
        />
        {/* Inner letter */}
        <motion.span
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: '"Uncial Antiqua", serif',
            fontSize: '2rem',
            color: 'var(--gold)',
          }}
        >
          O
        </motion.span>
      </motion.div>

      {/* Gold flash at peak */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.08, 0] }}
        transition={{ duration: 0.5, delay: 0.9 }}
        style={{
          position: 'absolute', inset: 0,
          background: 'var(--gold)',
        }}
      />

      {/* Final black cover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        style={{ position: 'absolute', inset: 0, background: '#000' }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SHOP NAVBAR                                                */
/* ════════════════════════════════════════════════════════════ */
function ShopNav({ onReenter }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 68,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 52px',
      background: scrolled ? 'rgba(0,0,0,0.96)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(56,56,56,0.6)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'background .4s ease, border-color .4s ease',
    }}>
      <div style={{ display: 'flex', gap: 40 }}>
        <a href="#collection" className="nav-link">Collection</a>
        <a href="#lookbook" className="nav-link">Lookbook</a>
      </div>

      {/* Logo — click to go back to intro */}
      <button
        onClick={onReenter}
        style={{
          background: 'none', border: 'none', cursor: 'none',
          fontFamily: '"Uncial Antiqua", serif',
          fontSize: '1.7rem', color: '#fff', lineHeight: 1,
          transition: 'color .2s',
          textShadow: '0 0 30px rgba(212,168,67,0.2)',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
        onMouseLeave={e => e.currentTarget.style.color = '#fff'}
      >
        VALIO
      </button>

      <div style={{ display: 'flex', gap: 40 }}>
        <a href="#about" className="nav-link">About</a>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  CINEMATIC BACKGROUND SLIDER                                */
/* ════════════════════════════════════════════════════════════ */
function BackgroundSlider({ images }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <AnimatePresence>
        <motion.div
          key={idx}
          className="bg-slide"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
        >
          <img
            src={images[idx]}
            alt=""
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 20%',
              filter: 'brightness(0.22) saturate(0.7) contrast(1.1)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Layered overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 30%, rgba(20,14,6,0.4) 0%, rgba(0,0,0,0.7) 100%)
        `,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Slide dots */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 2,
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 24 : 6,
              height: 2,
              background: i === idx ? 'var(--gold)' : 'rgba(255,255,255,0.25)',
              border: 'none', padding: 0,
              transition: 'width .4s ease, background .3s ease',
              cursor: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PRODUCT CARD                                               */
/* ════════════════════════════════════════════════════════════ */
function ProductCard({ product, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 7;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -7;
    card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
  };
  const onLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
    setHovered(false);
  };

  const imgSrc = product.images?.[0] ? getImageUrl(product.images[0]) : null;
  const price  = product.price ? `${Number(product.price).toLocaleString()} DZD` : '';

  return (
    <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        ref={cardRef}
        className="product-card"
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onLeave}
        style={{
          transition: 'transform .45s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow .45s ease',
        }}
      >
        {/* Image */}
        <div style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="card-image"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <PlaceholderImg name={product.name} />
          )}

          {/* Dark gradient over image */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
          }} />

          {/* Hover CTA */}
          <div className="card-reveal">
            <span style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: '0.95rem',
              letterSpacing: '0.2em',
              color: '#000',
              background: 'var(--gold)',
              padding: '10px 28px',
            }}>
              VIEW PIECE
            </span>
          </div>

          {/* Gold hover border */}
          <div style={{
            position: 'absolute', inset: 0,
            border: hovered ? '1px solid rgba(212,168,67,0.55)' : '1px solid transparent',
            transition: 'border-color .35s ease',
            pointerEvents: 'none',
          }} />

          {/* Badges */}
          {product.soldOut && (
            <div style={{
              position: 'absolute', top: 14, left: 14,
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(200,60,40,0.5)',
              color: 'rgba(220,80,60,0.9)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.55rem', letterSpacing: '0.15em',
              padding: '3px 10px', textTransform: 'uppercase',
            }}>
              SOLD OUT
            </div>
          )}
          {product.featured && !product.soldOut && (
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(212,168,67,0.4)',
              color: 'var(--gold)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '0.55rem', letterSpacing: '0.15em',
              padding: '3px 10px', textTransform: 'uppercase',
            }}>
              FEATURED
            </div>
          )}
        </div>

        {/* Info bar */}
        <div style={{
          padding: '16px 18px 20px',
          borderTop: hovered ? '1px solid rgba(212,168,67,0.4)' : '1px solid var(--iron)',
          transition: 'border-color .35s ease',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: 12,
          }}>
            <div>
              <div style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1rem', letterSpacing: '0.08em',
                color: '#fff', textTransform: 'uppercase',
                marginBottom: 3,
              }}>
                {product.name}
              </div>
              <div style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.55rem', letterSpacing: '0.12em',
                color: 'var(--ghost)', textTransform: 'uppercase',
              }}>
                {product.category || 'Apparel'}
              </div>
            </div>
            <div style={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 500, fontSize: '0.95rem',
              color: hovered ? 'var(--gold)' : 'var(--mist)',
              transition: 'color .3s ease', flexShrink: 0,
            }}>
              {price}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PlaceholderImg({ name }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, var(--forge) 0%, var(--iron) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(212,168,67,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,67,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />
      <span style={{
        fontFamily: '"Uncial Antiqua", serif',
        fontSize: '4rem', color: 'rgba(212,168,67,0.12)',
      }}>
        {name ? name[0].toUpperCase() : 'V'}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  SHOP INTERFACE                                             */
/* ════════════════════════════════════════════════════════════ */
const APPAREL_CATS = ['all', 'hoodies', 't-shirts', 'compression', 'outerwear'];

function ShopInterface({ onReenter }) {
  const [products, setProducts]     = useState([]);
  const [filter, setFilter]         = useState('all');
  const [loading, setLoading]       = useState(true);
  const [slideImages, setSlideImages] = useState(SLIDES);
  const lenisRef = useRef(null);

  // Fetch dynamic backgrounds from DB (fallback to hardcoded SLIDES)
  useEffect(() => {
    fetchBackgrounds()
      .then(d => {
        const bgs = (d.backgrounds || []).filter(b => b.active).map(b => b.url);
        if (bgs.length > 0) setSlideImages(bgs);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { default: Lenis } = await import('@studio-freight/lenis');
        const l = new Lenis({ duration: 1.5, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        lenisRef.current = l;
        const raf = (time) => { l.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      } catch (_) {}
    })();
    return () => { lenisRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    setLoading(true);
    // Only fetch apparel — exclude jewelry/accessories categories
    const params = filter !== 'all'
      ? { category: filter }
      : {};
    fetchProducts(params)
      .then(d => { setProducts((d.products || []).filter(isApparel)); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [filter]);

  // Scroll reveal
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [products, loading]);

  const featured = products.filter(p => p.featured && !p.soldOut).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <ShopNav onReenter={onReenter} />

      <main style={{ background: 'var(--void)', minHeight: '100vh' }}>

        {/* ── HERO WITH BACKGROUND SLIDER ── */}
        <section style={{
          height: '100vh', position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <BackgroundSlider images={slideImages} />

          <div style={{
            position: 'relative', zIndex: 2,
            padding: '0 64px 80px', maxWidth: 720,
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.58rem', letterSpacing: '0.3em',
                color: 'var(--gold)', textTransform: 'uppercase',
                marginBottom: 18,
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ width: 24, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
              The Collection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                letterSpacing: '0.05em',
                color: '#fff',
                lineHeight: 0.92,
                textTransform: 'uppercase',
                marginBottom: 28,
              }}
            >
              Wear<br />
              <span style={{ color: 'var(--gold)' }}>The</span><br />
              Darkness
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'rgba(212,168,67,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              Industrial silhouettes. Gothic construction. Made for legacy.
            </motion.p>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div style={{
          borderTop: '1px solid var(--steel)', borderBottom: '1px solid var(--steel)',
          background: 'var(--ink)', padding: '14px 0', overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', gap: 80, whiteSpace: 'nowrap',
            animation: 'marquee 20s linear infinite',
          }}>
            {Array(8).fill(['VALIO COLLECTION 2025', '·', 'MADE FOR LEGACY', '·', 'PREMIUM STREETWEAR', '·', 'LIMITED EDITION', '·']).flat().map((t, i) => (
              <span key={i} style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '0.65rem', letterSpacing: '0.2em',
                color: i % 2 === 1 ? 'var(--gold)' : 'rgba(232,232,232,0.2)',
                textTransform: 'uppercase',
              }}>
                {t}
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
        </div>

        {/* ── FEATURED ── */}
        {featured.length > 0 && (
          <section id="collection" style={{ padding: '100px 64px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              <SectionLabel eyebrow="Featured" title="Selected Pieces" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 3,
              }}>
                {featured.map((p, i) => (
                  <div key={p._id} className="reveal" style={{
                    opacity: 0, transform: 'translateY(48px)',
                    transition: `opacity .8s ease ${i * .12}s, transform .8s ease ${i * .12}s`,
                  }}>
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── LOOKBOOK BANNER ── */}
        <section id="lookbook" style={{
          height: 480, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src="/lookbook-1.jpg"
            alt="VALIO Lookbook"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 40%',
              filter: 'brightness(0.3) contrast(1.1) saturate(0.8)',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.58rem',
              letterSpacing: '0.4em', color: 'var(--gold)',
              textTransform: 'uppercase', marginBottom: 20,
            }}>
              — Manifesto —
            </div>
            <blockquote style={{
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              color: 'rgba(232,232,232,0.75)',
              lineHeight: 1.7, fontWeight: 400,
              maxWidth: 640, margin: '0 auto',
              letterSpacing: '0.02em',
            }}>
              "We don't follow trends. We leave legacies."
            </blockquote>
          </div>
        </section>

        {/* ── ALL PRODUCTS ── */}
        <section style={{ padding: '100px 64px 140px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header + filters */}
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              justifyContent: 'space-between', marginBottom: 52,
              flexWrap: 'wrap', gap: 24,
            }}>
              <SectionLabel eyebrow="Full Range" title="All Pieces" noMargin />
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {APPAREL_CATS.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    style={{
                      background: filter === cat ? 'var(--gold)' : 'var(--forge)',
                      color: filter === cat ? '#000' : 'var(--ghost)',
                      border: 'none',
                      fontFamily: '"Bebas Neue", sans-serif',
                      fontSize: '0.85rem', letterSpacing: '0.12em',
                      padding: '10px 22px',
                      cursor: 'none',
                      transition: 'background .25s, color .25s',
                    }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <Spinner />
            ) : products.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 0',
                fontFamily: '"Playfair Display", serif', fontStyle: 'italic',
                fontSize: '1.1rem', color: 'var(--ash)',
              }}>
                No pieces found in this category.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 3,
              }}>
                {products.map((p, i) => (
                  <div key={p._id} className="reveal" style={{
                    opacity: 0, transform: 'translateY(48px)',
                    transition: `opacity .75s ease ${(i % 6) * .08}s, transform .75s ease ${(i % 6) * .08}s`,
                  }}>
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── ABOUT STRIP ── */}
        <section id="about" style={{
          borderTop: '1px solid var(--steel)',
          padding: '80px 64px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 48, maxWidth: 1200, margin: '0 auto 80px',
        }}>
          {[
            { n: '001', l: 'Material',   v: 'Premium Performance Fabric' },
            { n: '002', l: 'Production', v: 'Limited Runs — Handmade' },
            { n: '003', l: 'Identity',   v: 'Made for Legacy' },
          ].map(item => (
            <div key={item.n}>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
                color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: 10,
              }}>
                [{item.n}]
              </div>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.6rem',
                letterSpacing: '0.2em', color: 'var(--ash)',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                {item.l}
              </div>
              <div style={{
                fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.1rem',
                letterSpacing: '0.05em', color: '#fff',
              }}>
                {item.v}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'var(--ink)',
        borderTop: '1px solid var(--steel)',
        padding: '80px 64px 48px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 48, marginBottom: 60,
          }}>
            <div>
              <div style={{
                fontFamily: '"Uncial Antiqua", serif',
                fontSize: '2.2rem', color: '#fff', marginBottom: 14, lineHeight: 1,
              }}>
                VALIO
              </div>
              <div style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.85rem', color: 'var(--ash)', lineHeight: 1.8, maxWidth: 220,
              }}>
                Luxury streetwear built for those who move with purpose. Made for legacy.
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
                letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 22,
              }}>
                Navigate
              </div>
              {['Collection', 'Lookbook', 'About', 'Sizing Guide'].map(l => (
                <div key={l} style={{ marginBottom: 12 }}>
                  <a href="#" style={{
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem',
                    color: 'var(--ash)', textDecoration: 'none',
                    transition: 'color .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ash)'}
                  >
                    {l}
                  </a>
                </div>
              ))}
            </div>
            <div>
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
                letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 22,
              }}>
                Contact
              </div>
              <div style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem',
                color: 'var(--ash)', lineHeight: 2.2,
              }}>
                <div>contact@valio.dz</div>
                <div style={{ marginTop: 16, color: 'var(--gold)', fontSize: '0.75rem' }}>
                  Worldwide Shipping
                </div>
              </div>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid var(--steel)', paddingTop: 28,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: '"DM Mono", monospace', fontSize: '0.52rem',
              letterSpacing: '0.15em', color: 'rgba(85,85,85,0.6)',
            }}>
              © {new Date().getFullYear()} VALIO. ALL RIGHTS RESERVED.
            </span>
            <span style={{
              fontFamily: '"Playfair Display", serif', fontStyle: 'italic',
              fontSize: '0.8rem', color: 'rgba(212,168,67,0.3)',
            }}>
              Made for Legacy
            </span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */
function isApparel(p) {
  const excluded = ['jewelry', 'watches', 'accessories'];
  return !excluded.includes((p.category || '').toLowerCase());
}

function SectionLabel({ eyebrow, title, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 52 }}>
      <div style={{
        fontFamily: '"DM Mono", monospace', fontSize: '0.55rem',
        letterSpacing: '0.3em', color: 'var(--gold)',
        textTransform: 'uppercase', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'inline-block' }} />
        {eyebrow}
      </div>
      <h2 style={{
        fontFamily: '"Bebas Neue", sans-serif', fontWeight: 400,
        fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
        letterSpacing: '0.05em', color: '#fff', textTransform: 'uppercase',
      }}>
        {title}
      </h2>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '80px 0', gap: 18,
    }}>
      <div style={{
        width: 32, height: 32,
        border: '1px solid var(--steel)', borderTop: '1px solid var(--gold)',
        borderRadius: '50%', animation: 'spin .8s linear infinite',
      }} />
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*  PAGE ROOT                                                  */
/* ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [stage, setStage]   = useState(S.INTRO);
  const [introSettings, setIntroSettings] = useState({
    introOpacity:   0.6,
    introImgWidth:  '100%',
    introImgHeight: '100%',
    introEnabled:   true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('valio_entered')) setStage(S.SHOP);
    // Fetch intro settings from DB
    fetchSettings().then(s => {
      if (s && Object.keys(s).length) {
        setIntroSettings(prev => ({
          introOpacity:   s.introOpacity   != null ? s.introOpacity   : prev.introOpacity,
          introImgWidth:  s.introImgWidth  != null ? s.introImgWidth  : prev.introImgWidth,
          introImgHeight: s.introImgHeight != null ? s.introImgHeight : prev.introImgHeight,
          introEnabled:   s.introEnabled   != null ? s.introEnabled   : prev.introEnabled,
        }));
      }
    }).catch(() => {});
  }, []);

  const enterShop = useCallback(() => setStage(S.PORTAL), []);
  const afterPortal = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem('valio_entered', '1');
    setStage(S.SHOP);
  }, []);
  const reenter = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('valio_entered');
    setStage(S.INTRO);
  }, []);

  return (
    <>
      <Head>
        <title>VALIO — Luxury Streetwear · Made for Legacy</title>
      </Head>

      <AnimatePresence mode="wait">
        {stage === S.INTRO && (
          <motion.div key="intro"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <IntroScreen
              onShop={enterShop}
              introOpacity={introSettings.introOpacity}
              introImgWidth={introSettings.introImgWidth}
              introImgHeight={introSettings.introImgHeight}
              introEnabled={introSettings.introEnabled}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === S.PORTAL && (
          <PortalTransition onDone={afterPortal} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === S.SHOP && (
          <motion.div key="shop">
            <ShopInterface onReenter={reenter} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
