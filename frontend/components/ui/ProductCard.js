import Link from 'next/link';
import { useCart } from '../../pages/_app';

export default function ProductCard({ product, priority = false }) {
  const { addItem } = useCart();
  const img = product.images?.[0];

  return (
    <div className="product-card" style={{ borderRadius: 0 }}>
      <Link href={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: '#111' }}>
          {img ? (
            <img
              src={img}
              alt={product.name}
              className="card-image"
              loading={priority ? 'eager' : 'lazy'}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2a2a2a', fontFamily: '"DM Mono",monospace', fontSize: '0.7rem',
              letterSpacing: '0.15em',
            }}>
              NO IMAGE
            </div>
          )}

          {/* Overlays */}
          {product.soldOut && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'rgba(0,0,0,0.9)', color: '#e05555',
              fontFamily: '"DM Mono",monospace', fontSize: '0.6rem',
              letterSpacing: '0.2em', padding: '5px 10px', textTransform: 'uppercase',
              border: '1px solid rgba(224,85,85,0.3)',
            }}>
              SOLD OUT
            </div>
          )}
          {product.featured && !product.soldOut && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'rgba(212,168,67,0.15)', color: '#d4a843',
              fontFamily: '"DM Mono",monospace', fontSize: '0.6rem',
              letterSpacing: '0.2em', padding: '5px 10px', textTransform: 'uppercase',
              border: '1px solid rgba(212,168,67,0.3)',
            }}>
              FEATURED
            </div>
          )}

          {/* Hover CTA */}
          <div className="card-reveal">
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                if (!product.soldOut) addItem(product);
              }}
              disabled={product.soldOut}
              style={{
                background:    product.soldOut ? 'rgba(0,0,0,0.7)' : 'rgba(212,168,67,0.95)',
                color:         product.soldOut ? '#555' : '#000',
                border:        'none',
                fontFamily:    '"Bebas Neue",sans-serif',
                fontSize:      '0.9rem',
                letterSpacing: '0.15em',
                padding:       '12px 32px',
                transition:    'background 0.25s ease',
              }}
            >
              {product.soldOut ? 'SOLD OUT' : 'ADD TO CART'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{
          padding:       '16px',
          borderTop:     '1px solid #1e1e1e',
          background:    '#0c0c0c',
        }}>
          <p style={{
            fontFamily:    '"DM Sans",sans-serif',
            fontWeight:    '400',
            fontSize:      '0.9rem',
            color:         '#ccc',
            letterSpacing: '0.05em',
            marginBottom:  '6px',
            whiteSpace:    'nowrap',
            overflow:      'hidden',
            textOverflow:  'ellipsis',
          }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontFamily: '"DM Mono",monospace',
              fontSize:   '0.85rem',
              color:      '#d4a843',
            }}>
              {product.price.toLocaleString()} DZD
            </span>
            {product.category && (
              <span style={{
                fontFamily:    '"DM Mono",monospace',
                fontSize:      '0.6rem',
                color:         '#555',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}>
                {product.category}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
