import { useEffect, useRef } from 'react';

const ITEMS = [
  'GOTHIC LUXURY', '✦', 'WEAR THE DARKNESS', '✦',
  'LIMITED EDITION', '✦', 'HANDCRAFTED', '✦',
  'VALIO', '✦', 'GOTHIC LUXURY', '✦',
  'WEAR THE DARKNESS', '✦', 'LIMITED EDITION', '✦',
];

export default function MarqueeBanner({ reverse = false }) {
  const innerRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const speed = reverse ? 0.5 : -0.5;

    const tick = () => {
      posRef.current += speed;
      const halfW = inner.scrollWidth / 2;
      if (!reverse && posRef.current <= -halfW) posRef.current = 0;
      if (reverse && posRef.current >= 0) posRef.current = -halfW;
      inner.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [reverse]);

  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div style={{
      overflow: 'hidden',
      borderTop: '1px solid rgba(192,160,96,0.12)',
      borderBottom: '1px solid rgba(192,160,96,0.12)',
      padding: '12px 0',
      background: '#000',
    }}>
      <div
        ref={innerRef}
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          willChange: 'transform',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: item === '✦' ? 'serif' : 'Cinzel, serif',
              fontSize: item === '✦' ? '0.6rem' : '0.6rem',
              letterSpacing: item === '✦' ? '0.1em' : '0.3em',
              color: item === '✦' ? 'var(--accent)' : 'rgba(192,192,192,0.4)',
              padding: '0 24px',
              textTransform: 'uppercase',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
