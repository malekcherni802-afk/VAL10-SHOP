import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { fetchProducts } from '../lib/api';
import ShopNav from '../components/shop/ShopNav';
import ProductCard from '../components/shop/ProductCard';
import Footer from '../components/shop/Footer';

/* ─── STAGE ENUM ──────────────────────────────────────────── */
const STAGE = {
  INTRO:      'intro',
  PORTAL:     'portal',
  SHOP:       'shop',
};

/* ─── WARDROBE SVG BACKGROUND ─────────────────────────────── */
function WardrobeBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Deep industrial gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 30%, #1a1209 0%, #0a0a0a 50%, #000 100%)
        `,
      }} />

      {/* Clothing rack SVG — rendered inline, no external deps */}
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}
      >
        <defs>
          <linearGradient id="rackGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3028" />
            <stop offset="100%" stopColor="#1a1208" />
          </linearGradient>
          <linearGradient id="metalBar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#111" />
            <stop offset="15%" stopColor="#3a3a3a" />
            <stop offset="50%" stopColor="#888" />
            <stop offset="85%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#111" />
          </linearGradient>
          <linearGradient id="coat1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="coat2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#252015" />
            <stop offset="100%" stopColor="#0d0a05" />
          </linearGradient>
          <radialGradient id="floorGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="rgba(200,160,40,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.9" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="garmentClip">
            <rect x="0" y="200" width="1200" height="900" />
          </clipPath>
        </defs>

        {/* Floor glow */}
        <rect x="0" y="0" width="1200" height="900" fill="url(#floorGlow)" />

        {/* Rack vertical supports */}
        <rect x="118" y="100" width="6" height="700" fill="url(#rackGrad)" />
        <rect x="1076" y="100" width="6" height="700" fill="url(#rackGrad)" />

        {/* Main horizontal bar */}
        <rect x="100" y="100" width="1000" height="10" rx="5" fill="url(#metalBar)" filter="url(#glow)" />

        {/* Rack feet */}
        <rect x="80"  y="795" width="80" height="8" rx="4" fill="#2a2a2a" />
        <rect x="1040" y="795" width="80" height="8" rx="4" fill="#2a2a2a" />

        {/* GARMENTS — heavy coats, draped fabric */}
        {/* Coat 1 — far left */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M155,110 L148,130 Q140,170 145,220 L140,760 L195,760 L195,220 Q200,170 195,130 Z"
            fill="url(#coat1)" opacity="0.95" />
          <path d="M145,120 Q120,160 115,200 L110,760 L145,760 L145,200 Q148,155 155,120 Z"
            fill="#0d0d0d" opacity="0.8" />
          {/* Lapel shadow */}
          <path d="M155,110 L148,140 L165,180 L155,110Z" fill="#000" opacity="0.6" />
        </g>

        {/* Coat 2 */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M290,110 L283,132 Q275,172 280,230 L275,760 L340,760 L340,230 Q345,172 340,132 L333,110 Z"
            fill="url(#coat2)" opacity="0.9" />
          <path d="M283,112 Q262,155 260,195 L257,760 L283,760 L283,195 Q286,158 290,112 Z"
            fill="#161208" opacity="0.7" />
        </g>

        {/* Coat 3 — bulky hoodie center-left */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M420,108 L410,135 Q400,175 408,240 L402,760 L475,760 L475,240 Q483,175 473,135 L463,108 Z"
            fill="#141414" opacity="1" />
          <path d="M408,108 Q385,150 380,190 L375,760 L408,760 L408,190 Q410,155 420,108 Z"
            fill="#0a0a0a" opacity="0.85" />
          {/* Hood fold */}
          <ellipse cx="441" cy="125" rx="30" ry="18" fill="#1e1e1e" opacity="0.7" />
        </g>

        {/* Long coat center */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M560,108 L548,138 Q535,180 542,250 L536,800 L630,800 L630,250 Q637,180 624,138 L612,108 Z"
            fill="#181818" opacity="1" />
          <path d="M548,110 Q520,160 516,205 L510,800 L548,800 L548,205 Q552,162 560,110 Z"
            fill="#0d0d0d" opacity="0.9" />
          <path d="M612,108 Q635,145 640,195 L646,800 L612,800 L612,195 Q610,150 600,110 Z"
            fill="#0d0d0d" opacity="0.6" />
          {/* Belt */}
          <rect x="520" y="440" width="120" height="14" rx="2" fill="#2a2010" opacity="0.8" />
        </g>

        {/* Coat 5 — center right */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M720,110 L710,138 Q700,178 708,240 L702,760 L775,760 L775,240 Q783,178 773,138 L763,110 Z"
            fill="#101010" opacity="0.95" />
          <path d="M710,112 Q688,158 684,200 L680,760 L710,760 L710,200 Q714,160 720,112 Z"
            fill="#080808" opacity="0.9" />
        </g>

        {/* Coat 6 — right */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M850,110 L840,135 Q830,172 838,232 L832,760 L900,760 L900,232 Q908,172 900,135 L890,110 Z"
            fill="url(#coat2)" opacity="0.85" />
          <path d="M840,112 Q815,155 812,195 L808,760 L840,760 L840,195 Q843,158 850,112 Z"
            fill="#14100a" opacity="0.75" />
        </g>

        {/* Coat 7 — far right */}
        <g clipPath="url(#garmentClip)" filter="url(#shadow)">
          <path d="M980,110 L972,132 Q964,170 970,225 L965,760 L1025,760 L1025,225 Q1031,170 1025,132 L1017,110 Z"
            fill="#0e0e0e" opacity="0.9" />
          <path d="M972,112 Q950,155 947,196 L944,760 L972,760 L972,196 Q975,158 980,112 Z"
            fill="#080808" opacity="0.8" />
        </g>

        {/* Hangers */}
        {[175, 310, 441, 586, 738, 855, 993].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="105" x2={x} y2="125" stroke="#666" strokeWidth="1.5" />
            <path d={`M${x-14},125 Q${x},112 ${x+14},125`} fill="none" stroke="#777" strokeWidth="2" />
            <circle cx={x} cy="105" r="3" fill="#888" />
          </g>
        ))}

        {/* Floor shadow */}
        <ellipse cx="600" cy="800" rx="550" ry="40" fill="rgba(0,0,0,0.7)" />

        {/* Vertical light shaft */}
        <rect x="570" y="0" width="60" height="900"
          fill="url(#metalBar)"
          opacity="0.04"
        />
      </svg>

      {/* Atmospheric overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(to bottom,
            rgba(0,0,0,0.3) 0%,
            rgba(0,0,0,0) 30%,
            rgba(0,0,0,0) 60%,
            rgba(0,0,0,0.85) 100%
          )
        `,
      }} />

      {/* Side vignettes */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(to right,
            rgba(0,0,0,0.7) 0%,
            transparent 25%,
            transparent 75%,
            rgba(0,0,0,0.7) 100%
          )
        `,
      }} />
    </div>
  );
}

/* ─── INTRO SCREEN ────────────────────────────────────────── */
function IntroScreen({ onShop }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <WardrobeBackground />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>

        {/* SEASON TAG */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.35em',
            color: 'var(--acid)',
            textTransform: 'uppercase',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          <span style={{ width: 32, height: 1, background: 'var(--acid)', display: 'inline-block' }} />
          Collection 2025 · Dark Season
          <span style={{ width: 32, height: 1, background: 'var(--acid)', display: 'inline-block' }} />
        </motion.div>

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, filter: 'blur(16px)' }}
          animate={ready ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <LogoWithPortalO onPortalClick={onShop} />
        </motion.div>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-label)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
            letterSpacing: '0.25em',
            color: 'rgba(232,232,232,0.45)',
            textTransform: 'uppercase',
            marginTop: 28,
            marginBottom: 64,
          }}
        >
          Wear the Darkness
        </motion.p>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="btn-primary" onClick={onShop}>
            <span>Go Shop</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Bottom metadata strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 2 }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: 0,
          right: 0,
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 48px',
        }}
      >
        {['Handcrafted', 'Limited Edition', 'Industrial Grade'].map((t, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            letterSpacing: '0.25em',
            color: 'rgba(232,232,232,0.2)',
            textTransform: 'uppercase',
          }}>
            {t}
          </span>
        ))}
      </motion.div>

      {/* Corner decorations */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <motion.div
          key={pos}
          className={`corner-mark ${pos}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={ready ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.8 + (['tl','tr','bl','br'].indexOf(pos) * 0.1) }}
          style={{ position: 'absolute', zIndex: 3 }}
        />
      ))}
    </div>
  );
}

/* ─── LOGO WITH PORTAL O ──────────────────────────────────── */
function LogoWithPortalO({ onPortalClick }) {
  const [oHovered, setOHovered] = useState(false);

  const letters = ['V', 'A', 'L', 'I', 'O'];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {letters.map((letter, i) => {
        const isO = letter === 'O';
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.7 + i * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={isO ? onPortalClick : undefined}
            onMouseEnter={isO ? () => setOHovered(true) : undefined}
            onMouseLeave={isO ? () => setOHovered(false) : undefined}
            style={{
              fontFamily: 'var(--font-gothic)',
              fontSize: 'clamp(5rem, 14vw, 12rem)',
              fontWeight: 400,
              color: isO ? 'var(--acid)' : '#fff',
              letterSpacing: '0.05em',
              position: 'relative',
              display: 'inline-block',
              cursor: isO ? 'none' : 'default',
              textShadow: isO
                ? oHovered
                  ? '0 0 40px rgba(200,255,0,0.9), 0 0 80px rgba(200,255,0,0.4)'
                  : '0 0 20px rgba(200,255,0,0.5), 0 0 60px rgba(200,255,0,0.15)'
                : '0 2px 40px rgba(0,0,0,0.8)',
              transition: 'text-shadow 0.4s ease, transform 0.3s ease',
              transform: isO && oHovered ? 'scale(1.12)' : 'scale(1)',
            }}
          >
            {letter}
            {/* O inner ring hint */}
            {isO && (
              <motion.span
                animate={oHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '35%',
                  height: '35%',
                  border: '1px solid var(--acid)',
                  borderRadius: '50%',
                  boxShadow: '0 0 12px rgba(200,255,0,0.6)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.span>
        );
      })}
    </div>
  );
}

/* ─── PORTAL TRANSITION ───────────────────────────────────── */
function PortalTransition({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        pointerEvents: 'none',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {/* The O expanding as portal */}
      <motion.div
        initial={{ scale: 1, borderRadius: '50%', opacity: 1 }}
        animate={{
          scale: [1, 1.5, 8, 40],
          borderRadius: ['50%', '50%', '50%', '0%'],
          opacity: [1, 1, 1, 1],
        }}
        transition={{
          duration: 1.2,
          ease: [0.7, 0, 0.3, 1],
          times: [0, 0.2, 0.7, 1],
        }}
        style={{
          width: 'clamp(80px, 12vw, 140px)',
          height: 'clamp(80px, 12vw, 140px)',
          background: '#000',
          border: '3px solid var(--acid)',
          boxShadow: '0 0 60px rgba(200,255,0,0.8), inset 0 0 40px rgba(200,255,0,0.15)',
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Acid ring pulse */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid var(--acid)',
            borderRadius: '50%',
          }}
        />
      </motion.div>

      {/* Screen flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.06, 0] }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--acid)',
        }}
      />

      {/* Fade out entire portal overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000',
        }}
      />
    </motion.div>
  );
}

/* ─── SHOP INTERFACE ──────────────────────────────────────── */
function ShopInterface() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const lenisRef = useRef(null);

  const categories = ['all', 'clothing', 'jewelry', 'accessories', 'footwear'];

  useEffect(() => {
    async function initLenis() {
      try {
        const LenisModule = await import('@studio-freight/lenis');
        const Lenis = LenisModule.default;
        const lenis = new Lenis({
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        lenisRef.current = lenis;
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (_) {}
    }
    initLenis();
    return () => { if (lenisRef.current) lenisRef.current.destroy(); };
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { category: filter } : {};
    fetchProducts(params)
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [filter]);

  // Scroll reveal
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.js-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [products, loading]);

  const featured = products.filter((p) => p.featured);
  const grid = products;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <ShopNav />

      <main style={{ background: 'var(--void)', minHeight: '100vh' }}>

        {/* ── SHOP HERO ── */}
        <section
          style={{
            height: '100vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            overflow: 'hidden',
          }}
        >
          {/* Industrial ambient bg */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 70% 50% at 30% 40%, #161006 0%, #000 70%)
            `,
          }} />
          {/* Grid pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(200,255,0,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,255,0,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }} />
          {/* Vignette */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 100% 80% at center, transparent 20%, rgba(0,0,0,0.9) 100%)',
          }} />

          {/* Hero content */}
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: '0 64px 80px',
            maxWidth: 800,
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.3em',
                color: 'var(--acid)',
                textTransform: 'uppercase',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ width: 24, height: 1, background: 'var(--acid)', display: 'inline-block' }} />
              The Collection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                letterSpacing: '-0.02em',
                color: '#fff',
                lineHeight: 0.9,
                textTransform: 'uppercase',
                marginBottom: 32,
              }}
            >
              Wear<br />
              <span style={{ color: 'var(--acid)' }}>The</span><br />
              Darkness
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '0.9rem',
                letterSpacing: '0.15em',
                color: 'rgba(232,232,232,0.4)',
                textTransform: 'uppercase',
                maxWidth: 400,
              }}
            >
              Industrial silhouettes. Gothic construction. Uncompromising darkness.
            </motion.p>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'absolute',
              bottom: 40,
              right: 64,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5rem',
              letterSpacing: '0.3em',
              color: 'rgba(232,232,232,0.25)',
              textTransform: 'uppercase',
              writingMode: 'vertical-rl',
            }}>
              Scroll
            </span>
            <div style={{
              width: 1,
              height: 60,
              background: 'linear-gradient(to bottom, rgba(200,255,0,0.6), transparent)',
            }} />
          </motion.div>
        </section>

        {/* ── MARQUEE STRIP ── */}
        <div style={{
          borderTop: '1px solid var(--slag)',
          borderBottom: '1px solid var(--slag)',
          background: 'var(--iron)',
          padding: '14px 0',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            gap: 64,
            whiteSpace: 'nowrap',
            animation: 'marquee 18s linear infinite',
          }}>
            {Array(6).fill(['DARK SEASON 2025', '—', 'HANDCRAFTED', '—', 'LIMITED EDITION', '—', 'INDUSTRIAL GOTHIC', '—']).flat().map((t, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-label)',
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: i % 2 === 1 ? 'var(--acid)' : 'rgba(232,232,232,0.25)',
                textTransform: 'uppercase',
              }}>
                {t}
              </span>
            ))}
          </div>
          <style>{`
            @keyframes marquee {
              from { transform: translateX(0); }
              to   { transform: translateX(-50%); }
            }
          `}</style>
        </div>

        {/* ── FEATURED ── */}
        {featured.length > 0 && (
          <section style={{ padding: '100px 64px' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto' }}>
              <SectionHeader label="Featured" title="Selected Pieces" />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 2,
              }}>
                {featured.map((product, i) => (
                  <div
                    key={product._id}
                    className="js-reveal"
                    style={{
                      opacity: 0,
                      transform: 'translateY(50px)',
                      transition: `opacity 0.8s ease ${i * 0.1}s, transform 0.8s ease ${i * 0.1}s`,
                    }}
                  >
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── ALL PRODUCTS ── */}
        <section style={{ padding: '80px 64px 120px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header + filters */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 48,
              gap: 24,
              flexWrap: 'wrap',
            }}>
              <SectionHeader label="All Pieces" title="Full Collection" noMargin />

              <div style={{ display: 'flex', gap: 2 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    style={{
                      background: filter === cat ? 'var(--acid)' : 'var(--iron)',
                      color: filter === cat ? 'var(--void)' : 'var(--ghost)',
                      border: 'none',
                      fontFamily: 'var(--font-label)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '10px 20px',
                      cursor: 'none',
                      transition: 'background 0.25s ease, color 0.25s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <LoadingSpinner />
            ) : grid.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '80px 0',
                fontFamily: 'var(--font-label)',
                fontSize: '0.8rem',
                letterSpacing: '0.2em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
              }}>
                No pieces in this category.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 2,
              }}>
                {grid.map((product, i) => (
                  <div
                    key={product._id}
                    className="js-reveal"
                    style={{
                      opacity: 0,
                      transform: 'translateY(50px)',
                      transition: `opacity 0.7s ease ${(i % 6) * 0.07}s, transform 0.7s ease ${(i % 6) * 0.07}s`,
                    }}
                  >
                    <ProductCard product={product} index={i} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── MANIFESTO STRIP ── */}
        <div style={{
          borderTop: '1px solid var(--slag)',
          borderBottom: '1px solid var(--slag)',
          padding: '80px 64px',
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
          gap: 48,
          maxWidth: 1200,
          margin: '0 auto 80px',
        }}>
          {[
            { num: '001', label: 'Material', val: 'Military-Grade Fabrics' },
            { num: '002', label: 'Production', val: 'Limited Runs Only' },
            { num: '003', label: 'Identity', val: 'Anti-Mass-Market' },
          ].map((item, i) => (
            <div key={i} style={{ gridColumn: i * 2 + 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                color: 'var(--acid)',
                letterSpacing: '0.2em',
                marginBottom: 12,
              }}>
                [{item.num}]
              </div>
              <div style={{
                fontFamily: 'var(--font-label)',
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '-0.01em',
                color: 'var(--chrome)',
              }}>
                {item.val}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}

/* ─── HELPER COMPONENTS ───────────────────────────────────── */
function SectionHeader({ label, title, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 48 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        letterSpacing: '0.3em',
        color: 'var(--acid)',
        textTransform: 'uppercase',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ width: 20, height: 1, background: 'var(--acid)', display: 'inline-block' }} />
        {label}
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
        letterSpacing: '-0.02em',
        color: '#fff',
        textTransform: 'uppercase',
      }}>
        {title}
      </h2>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 0',
      gap: 20,
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: '1px solid var(--slag)',
        borderTop: '1px solid var(--acid)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.55rem',
        letterSpacing: '0.3em',
        color: 'var(--mist)',
        textTransform: 'uppercase',
      }}>
        Loading
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── PAGE ORCHESTRATOR ───────────────────────────────────── */
export default function HomePage() {
  const [stage, setStage] = useState(STAGE.INTRO);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const entered = sessionStorage.getItem('valio_v2_entered');
    if (entered) setStage(STAGE.SHOP);
  }, []);

  const handleShopClick = () => {
    setStage(STAGE.PORTAL);
  };

  const handlePortalComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('valio_v2_entered', '1');
    }
    setStage(STAGE.SHOP);
  };

  return (
    <>
      <Head>
        <title>VALIO — Dark Alternative Luxury Streetwear</title>
      </Head>

      <AnimatePresence mode="wait">
        {stage === STAGE.INTRO && (
          <motion.div
            key="intro"
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <IntroScreen onShop={handleShopClick} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === STAGE.PORTAL && (
          <PortalTransition onComplete={handlePortalComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === STAGE.SHOP && (
          <motion.div key="shop">
            <ShopInterface />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
