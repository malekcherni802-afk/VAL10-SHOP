import { useEffect, useRef, useState } from 'react';
import SmokeCanvas from './SmokeCanvas';

export default function IntroOverlay({ onEnter }) {
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const oLetterRef = useRef(null);
  const btnRef = useRef(null);
  const taglineRef = useRef(null);
  const [showBtn, setShowBtn] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // Logo reveal sequence
    const logo = logoRef.current;
    const btn = btnRef.current;
    const tagline = taglineRef.current;

    if (logo) {
      logo.style.opacity = '0';
      logo.style.transform = 'scale(0.9) translateY(20px)';
      logo.style.filter = 'blur(8px)';

      // Reveal logo
      setTimeout(() => {
        logo.style.transition = 'opacity 2s ease, transform 2.5s ease, filter 2s ease';
        logo.style.opacity = '1';
        logo.style.transform = 'scale(1) translateY(0)';
        logo.style.filter = 'blur(0)';
      }, 600);

      // Reveal tagline
      setTimeout(() => {
        if (tagline) {
          tagline.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
          tagline.style.opacity = '1';
          tagline.style.transform = 'translateY(0)';
        }
      }, 2000);

      // Show button
      setTimeout(() => {
        setShowBtn(true);
      }, 3200);
    }
  }, []);

  const handleEnter = () => {
    if (transitioning) return;
    setTransitioning(true);

    const overlay = overlayRef.current;
    const oLetter = oLetterRef.current;

    if (!oLetter || !overlay) {
      onEnter();
      return;
    }

    // Get O letter position
    const rect = oLetter.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create portal circle
    const portal = document.createElement('div');
    portal.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      height: ${rect.height}px;
      left: ${centerX}px;
      top: ${centerY}px;
      transform: translate(-50%, -50%) scale(1);
      border-radius: 50%;
      background: #000;
      border: 2px solid rgba(192, 160, 96, 0.8);
      z-index: 9999;
      box-shadow: 0 0 60px rgba(192, 160, 96, 0.4), inset 0 0 40px rgba(0,0,0,0.8);
    `;
    document.body.appendChild(portal);

    // Fade out rest of logo
    const logo = logoRef.current;
    if (logo) {
      logo.style.transition = 'opacity 0.4s ease';
      logo.style.opacity = '0';
    }
    const tagline = taglineRef.current;
    if (tagline) {
      tagline.style.transition = 'opacity 0.3s ease';
      tagline.style.opacity = '0';
    }

    // Ripple effect
    setTimeout(() => {
      portal.style.transition = 'transform 0.8s cubic-bezier(0.25, 0, 0, 1), border-color 0.4s ease, box-shadow 0.4s ease';
      portal.style.borderColor = 'rgba(192, 160, 96, 0.2)';
      portal.style.boxShadow = '0 0 120px rgba(192, 160, 96, 0.6), inset 0 0 80px rgba(192,160,96,0.1)';
    }, 50);

    // ZOOM the O to fill screen
    setTimeout(() => {
      const maxDim = Math.max(window.innerWidth, window.innerHeight);
      const scale = (maxDim * 3) / rect.width;

      portal.style.transition = `transform 1.2s cubic-bezier(0.7, 0, 0.3, 1)`;
      portal.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }, 300);

    // Fade overlay and enter shop
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }, 1100);

    setTimeout(() => {
      portal.remove();
      onEnter();
    }, 1600);
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <SmokeCanvas />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.9) 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* Logo */}
        <div ref={logoRef} style={{ marginBottom: '24px' }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 900,
            fontSize: 'clamp(5rem, 16vw, 13rem)',
            letterSpacing: '0.5em',
            color: '#fff',
            lineHeight: 1,
            textShadow: '0 0 80px rgba(192,160,96,0.2)',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            {'V A L I'.split('').map((c, i) => (
              <span key={i}>{c}</span>
            ))}
            <span
              ref={oLetterRef}
              style={{
                display: 'inline-block',
                position: 'relative',
                color: 'var(--accent)',
                textShadow: '0 0 40px rgba(192,160,96,0.5)',
              }}
            >
              O
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          ref={taglineRef}
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1rem',
            letterSpacing: '0.4em',
            color: 'rgba(192,160,96,0.7)',
            textTransform: 'uppercase',
            opacity: 0,
            transform: 'translateY(12px)',
            marginBottom: '60px',
          }}
        >
          Wear the Darkness
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: showBtn ? 1 : 0,
            transform: showBtn ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 1s ease, transform 1s ease',
          }}
        >
          <button
            onClick={handleEnter}
            disabled={transitioning}
            style={{
              background: 'transparent',
              border: '1px solid rgba(192,160,96,0.6)',
              color: 'rgba(192,160,96,0.9)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              padding: '16px 48px',
              cursor: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(192,160,96,0.1)';
              e.currentTarget.style.borderColor = 'rgba(192,160,96,1)';
              e.currentTarget.style.color = '#c0a060';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(192,160,96,0.6)';
              e.currentTarget.style.color = 'rgba(192,160,96,0.9)';
            }}
          >
            ↓ &nbsp; GO SHOP &nbsp; ↓
          </button>
        </div>
      </div>

      {/* Corner decorations */}
      <div style={{
        position: 'absolute',
        top: 32, left: 32, zIndex: 2,
        width: 40, height: 40,
        borderTop: '1px solid rgba(192,160,96,0.3)',
        borderLeft: '1px solid rgba(192,160,96,0.3)',
      }} />
      <div style={{
        position: 'absolute',
        top: 32, right: 32, zIndex: 2,
        width: 40, height: 40,
        borderTop: '1px solid rgba(192,160,96,0.3)',
        borderRight: '1px solid rgba(192,160,96,0.3)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 32, left: 32, zIndex: 2,
        width: 40, height: 40,
        borderBottom: '1px solid rgba(192,160,96,0.3)',
        borderLeft: '1px solid rgba(192,160,96,0.3)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 32, right: 32, zIndex: 2,
        width: 40, height: 40,
        borderBottom: '1px solid rgba(192,160,96,0.3)',
        borderRight: '1px solid rgba(192,160,96,0.3)',
      }} />
    </div>
  );
}
