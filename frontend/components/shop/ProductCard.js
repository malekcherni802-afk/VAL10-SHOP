import { useRef, useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '../../lib/api';

export default function ProductCard({ product, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
    const rotX = (y - 0.5) * -6;
    const rotY = (x - 0.5) * 6;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
    setHovered(false);
  };

  const imageSrc = product.images?.[0] ? getImageUrl(product.images[0]) : null;

  return (
    <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        ref={cardRef}
        className="product-card-v2"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
        }}
      >
        {/* Image */}
        <div style={{
          position: 'relative',
          aspectRatio: '3/4',
          overflow: 'hidden',
          background: 'var(--iron)',
        }}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="card-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <PlaceholderImage name={product.name} />
          )}

          {/* Overlay gradient */}
          <div className="card-overlay" />

          {/* Glitch lines on hover */}
          {hovered && (
            <>
              <div style={{
                position: 'absolute',
                top: `${20 + mousePos.y * 30}%`,
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(200,255,0,0.4)',
                pointerEvents: 'none',
                animation: 'glitch 0.15s steps(2) 3',
              }} />
              <div style={{
                position: 'absolute',
                top: `${55 + mousePos.y * 20}%`,
                left: 0,
                right: 0,
                height: '1px',
                background: 'rgba(200,255,0,0.2)',
                pointerEvents: 'none',
              }} />
            </>
          )}

          {/* Badges */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {product.soldOut && (
              <Badge label="SOLD OUT" color="var(--rust)" />
            )}
            {product.featured && !product.soldOut && (
              <Badge label="FEATURED" color="var(--acid)" textColor="var(--void)" />
            )}
            {product.model3D && (
              <Badge label="3D" color="rgba(100,180,255,0.9)" textColor="var(--void)" />
            )}
          </div>

          {/* View CTA */}
          <div
            className="card-cta"
            style={{
              position: 'absolute',
              bottom: 20,
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: 0,
              transform: 'translateY(8px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            <span style={{
              display: 'inline-block',
              fontFamily: 'var(--font-label)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--void)',
              background: 'var(--acid)',
              padding: '8px 22px',
            }}>
              View Piece
            </span>
          </div>

          {/* Acid border on hover */}
          <div style={{
            position: 'absolute',
            inset: 0,
            border: hovered ? '1px solid rgba(200,255,0,0.5)' : '1px solid transparent',
            transition: 'border-color 0.3s ease',
            pointerEvents: 'none',
          }} />

          {/* Corner marks on hover */}
          {hovered && ['tl', 'tr', 'bl', 'br'].map(pos => (
            <div key={pos} className={`corner-mark ${pos}`} style={{ position: 'absolute' }} />
          ))}
        </div>

        {/* Info */}
        <div style={{
          padding: '18px 20px 20px',
          background: 'var(--forge)',
          borderTop: `1px solid ${hovered ? 'rgba(200,255,0,0.3)' : 'var(--slag)'}`,
          transition: 'border-color 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '-0.01em',
                color: '#fff',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {product.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-label)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: 'var(--mist)',
                textTransform: 'uppercase',
              }}>
                {product.category}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: hovered ? 'var(--acid)' : 'var(--chrome)',
              transition: 'color 0.3s ease',
              flexShrink: 0,
            }}>
              ${product.price?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Badge({ label, color, textColor = '#fff' }) {
  return (
    <span style={{
      display: 'inline-block',
      background: color,
      color: textColor,
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: '0.5rem',
      letterSpacing: '0.12em',
      padding: '3px 8px',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  );
}

function PlaceholderImage({ name }) {
  const initial = name ? name[0].toUpperCase() : 'V';
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--iron) 0%, var(--slag) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(200,255,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,255,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />
      <span style={{
        fontFamily: 'var(--font-gothic)',
        fontSize: '5rem',
        color: 'rgba(200,255,0,0.12)',
        position: 'relative',
        zIndex: 1,
      }}>
        {initial}
      </span>
    </div>
  );
}
