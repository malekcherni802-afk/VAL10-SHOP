import { useState } from 'react';
import { getImageUrl } from '../../lib/api';

export default function ImageGallery({ images = [], productName }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '4rem',
          color: 'rgba(192,160,96,0.15)',
          letterSpacing: '0.3em',
        }}>
          V
        </div>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(192,160,96,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,160,96,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div style={{
        aspectRatio: '3/4',
        overflow: 'hidden',
        marginBottom: 16,
        background: '#111',
        position: 'relative',
      }}>
        <img
          src={getImageUrl(images[active])}
          alt={`${productName} - ${active + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.4s ease',
          }}
        />
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            fontFamily: 'Cinzel, serif',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(0,0,0,0.6)',
            padding: '4px 10px',
          }}>
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
        }}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 72,
                height: 72,
                overflow: 'hidden',
                cursor: 'none',
                border: i === active
                  ? '1px solid var(--accent)'
                  : '1px solid rgba(255,255,255,0.1)',
                transition: 'border-color 0.3s ease',
                opacity: i === active ? 1 : 0.6,
              }}
            >
              <img
                src={getImageUrl(img)}
                alt={`${productName} view ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
