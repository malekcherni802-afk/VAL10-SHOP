import { useRef, useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '../../lib/api';

export default function ProductCard({ product, index = 0 }) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    }
    setHovered(false);
  };

  const imageSrc = product.images?.[0]
    ? getImageUrl(product.images[0])
    : null;

  return (
    <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="product-card"
        style={{
          perspective: '800px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {/* Image container */}
        <div style={{
          position: 'relative',
          aspectRatio: '3/4',
          background: '#111',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          {imageSrc ? (
            <img
              ref={imgRef}
              src={imageSrc}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                filter: 'brightness(0.85)',
              }}
            />
          ) : (
            /* Placeholder with gothic pattern */
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #111 0%, #1a1a1a 50%, #111 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '3rem',
                color: 'rgba(192,160,96,0.2)',
                letterSpacing: '0.3em',
              }}>
                V
              </div>
              {/* Gothic grid overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(192,160,96,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(192,160,96,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }} />
            </div>
          )}

          {/* Hover overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'var(--accent)',
              border: '1px solid rgba(192,160,96,0.6)',
              padding: '10px 24px',
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'transform 0.3s ease',
            }}>
              VIEW
            </span>
          </div>

          {/* Sold Out badge */}
          {product.soldOut && (
            <div style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(180,50,50,0.6)',
              color: 'rgba(180,50,50,0.9)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              padding: '4px 10px',
            }}>
              SOLD OUT
            </div>
          )}

          {/* Featured badge */}
          {product.featured && !product.soldOut && (
            <div style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'rgba(0,0,0,0.85)',
              border: '1px solid rgba(192,160,96,0.4)',
              color: 'var(--accent)',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              padding: '4px 10px',
            }}>
              FEATURED
            </div>
          )}

          {/* 3D indicator */}
          {product.model3D && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(192,160,96,0.3)',
              color: 'rgba(192,160,96,0.8)',
              fontFamily: 'Courier Prime, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              padding: '3px 8px',
            }}>
              3D
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ padding: '0 4px' }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            color: '#fff',
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}>
            {product.name}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1rem',
              color: 'var(--accent)',
            }}>
              ${product.price?.toLocaleString()}
            </div>

            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              color: 'rgba(192,192,192,0.4)',
              textTransform: 'uppercase',
            }}>
              {product.category}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
