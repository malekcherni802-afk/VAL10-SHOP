import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0, rafId;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    };

    const onEnter = () => ring.setAttribute('data-hover', '');
    const onLeave = () => ring.removeAttribute('data-hover');

    const tick = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener('mousemove', onMove);

    const attach = () => {
      document.querySelectorAll('a,button,[role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    attach();

    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    tick();
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      mo.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        #vc-dot {
          position: fixed; width: 6px; height: 6px;
          background: var(--gold); border-radius: 50%;
          pointer-events: none; z-index: 99999;
          transform: translate(-50%,-50%);
          mix-blend-mode: difference;
          transition: width .2s, height .2s;
        }
        #vc-ring {
          position: fixed; width: 40px; height: 40px;
          pointer-events: none; z-index: 99998;
          transform: translate(-50%,-50%);
          transition: width .3s ease, height .3s ease;
        }
        #vc-ring::before, #vc-ring::after {
          content: ''; position: absolute;
          background: rgba(212,168,67,0.55);
        }
        #vc-ring::before {
          left: 50%; top: 0; bottom: 0; width: 1px;
          transform: translateX(-50%);
        }
        #vc-ring::after {
          top: 50%; left: 0; right: 0; height: 1px;
          transform: translateY(-50%);
        }
        #vc-ring[data-hover] { width: 64px; height: 64px; }
        #vc-ring[data-hover]::before,
        #vc-ring[data-hover]::after { background: var(--gold); }
        @media (max-width: 768px) { #vc-dot, #vc-ring { display:none; } }
      `}</style>
      <div id="vc-dot"  ref={dotRef}  />
      <div id="vc-ring" ref={ringRef} />
    </>
  );
}
