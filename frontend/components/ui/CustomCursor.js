import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pos      = useRef({ x: -100, y: -100 });
  const ring     = useRef({ x: -100, y: -100 });
  const [hover,  setHover]  = useState(false);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);
  const raf      = useRef(null);

  useEffect(() => {
    const onMove = e => {
      pos.current = { x: e.clientX, y: e.clientY };
      setHidden(false);
    };
    const onLeave  = () => setHidden(true);
    const onEnter  = () => setHidden(false);
    const onDown   = () => setActive(true);
    const onUp     = () => setActive(false);

    const onHoverStart = () => setHover(true);
    const onHoverEnd   = () => setHover(false);

    window.addEventListener('mousemove',   onMove,  { passive: true });
    window.addEventListener('mouseleave',  onLeave);
    window.addEventListener('mouseenter',  onEnter);
    window.addEventListener('mousedown',   onDown);
    window.addEventListener('mouseup',     onUp);

    // Attach hover listeners to interactive elements
    function attach() {
      document
        .querySelectorAll('a, button, [role="button"], input, select, textarea, label, .product-card')
        .forEach(el => {
          el.addEventListener('mouseenter', onHoverStart);
          el.addEventListener('mouseleave', onHoverEnd);
        });
    }
    attach();

    // Re-attach when DOM changes (e.g. dynamically rendered cards)
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    // Animate ring with lerp
    function animate() {
      const lerpFactor = 0.12;
      ring.current.x += (pos.current.x - ring.current.x) * lerpFactor;
      ring.current.y += (pos.current.y - ring.current.y) * lerpFactor;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(animate);
    }
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
      observer.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
    return null;
  }

  return (
    <>
      {/* Dot — snaps instantly */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          zIndex:          99999,
          pointerEvents:   'none',
          width:           active ? '6px' : hover ? '10px' : '8px',
          height:          active ? '6px' : hover ? '10px' : '8px',
          borderRadius:    '50%',
          background:      hover ? '#d4a843' : '#fff',
          opacity:         hidden ? 0 : 1,
          transition:      'width 0.15s ease, height 0.15s ease, background 0.2s ease, opacity 0.3s ease',
          willChange:      'transform',
        }}
      />

      {/* Ring — lags behind */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:        'fixed',
          top:             0,
          left:            0,
          zIndex:          99998,
          pointerEvents:   'none',
          width:           active ? '28px' : hover ? '48px' : '36px',
          height:          active ? '28px' : hover ? '48px' : '36px',
          borderRadius:    '50%',
          border:          `1px solid ${hover ? 'rgba(212,168,67,0.8)' : 'rgba(255,255,255,0.5)'}`,
          opacity:         hidden ? 0 : 1,
          transition:      'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
          willChange:      'transform',
        }}
      />
    </>
  );
}
