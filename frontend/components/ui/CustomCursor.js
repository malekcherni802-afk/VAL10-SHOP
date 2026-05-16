import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let rx = 0, ry = 0;
    let animId;
    let hovering = false;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    };

    const onEnter = () => {
      hovering = true;
      ring.setAttribute('data-hover', '');
    };
    const onLeave = () => {
      hovering = false;
      ring.removeAttribute('data-hover');
    };

    const animate = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      animId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);

    const addListeners = () => {
      document.querySelectorAll('a, button, [role="button"], .clickable').forEach(el => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    addListeners();
    const obs = new MutationObserver(addListeners);
    obs.observe(document.body, { childList: true, subtree: true });

    animate();

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        #v-cursor-dot {
          position: fixed;
          width: 5px;
          height: 5px;
          background: var(--acid);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
        }
        #v-cursor-ring {
          position: fixed;
          width: 36px;
          height: 36px;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          transition: width 0.25s ease, height 0.25s ease;
        }
        #v-cursor-ring::before,
        #v-cursor-ring::after {
          content: '';
          position: absolute;
          background: var(--acid);
          opacity: 0.6;
          transition: opacity 0.25s;
        }
        /* crosshair lines */
        #v-cursor-ring::before {
          left: 50%; top: 0; bottom: 0;
          width: 1px;
          transform: translateX(-50%);
        }
        #v-cursor-ring::after {
          top: 50%; left: 0; right: 0;
          height: 1px;
          transform: translateY(-50%);
        }
        #v-cursor-ring[data-hover] {
          width: 60px;
          height: 60px;
        }
        #v-cursor-ring[data-hover]::before,
        #v-cursor-ring[data-hover]::after {
          opacity: 1;
        }
        @media (max-width: 768px) {
          #v-cursor-dot, #v-cursor-ring { display: none; }
        }
      `}</style>
      <div id="v-cursor-dot" ref={dotRef} />
      <div id="v-cursor-ring" ref={ringRef} />
    </>
  );
}
