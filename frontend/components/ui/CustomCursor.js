import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let animId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    };

    const onEnterLink = () => {
      ring.classList.add('cursor-hover');
    };

    const onLeaveLink = () => {
      ring.classList.remove('cursor-hover');
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      animId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);

    const links = document.querySelectorAll('a, button, [role="button"], .clickable');
    links.forEach(el => {
      el.addEventListener('mouseenter', onEnterLink);
      el.addEventListener('mouseleave', onLeaveLink);
    });

    animate();

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <style>{`
        #cursor-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition: width 0.2s, height 0.2s;
        }
        #cursor-ring {
          position: fixed;
          width: 32px;
          height: 32px;
          border: 1px solid rgba(192,160,96,0.6);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s, border-color 0.3s;
        }
        #cursor-ring.cursor-hover {
          width: 56px;
          height: 56px;
          border-color: var(--accent);
          background: rgba(192,160,96,0.08);
        }
        @media (max-width: 768px) {
          #cursor-dot, #cursor-ring { display: none; }
          * { cursor: auto !important; }
        }
      `}</style>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}
