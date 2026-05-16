import { getImageUrl } from '../../lib/api';

export default function AdminProductList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 0',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.1rem',
        color: 'rgba(192,192,192,0.3)',
        fontStyle: 'italic',
      }}>
        No products yet. Add your first piece.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {products.map(product => (
        <div
          key={product._id}
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr auto',
            gap: 24,
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(192,160,96,0.1)',
            padding: '16px 20px',
            transition: 'border-color 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,160,96,0.25)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(192,160,96,0.1)'}
        >
          {/* Thumbnail */}
          <div style={{
            width: 80,
            height: 80,
            background: '#111',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {product.images?.[0] ? (
              <img
                src={getImageUrl(product.images[0])}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Cinzel, serif',
                fontSize: '1.5rem',
                color: 'rgba(192,160,96,0.2)',
              }}>
                V
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              color: '#fff',
              marginBottom: 4,
            }}>
              {product.name}
            </div>
            <div style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '0.95rem',
                color: 'var(--accent)',
              }}>
                ${product.price?.toLocaleString()}
              </span>
              <span style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '0.55rem',
                letterSpacing: '0.1em',
                color: 'rgba(192,192,192,0.4)',
                textTransform: 'uppercase',
              }}>
                {product.category}
              </span>
              {product.soldOut && (
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(180,50,50,0.7)',
                  border: '1px solid rgba(180,50,50,0.3)',
                  padding: '2px 8px',
                }}>
                  SOLD OUT
                </span>
              )}
              {product.featured && (
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(192,160,96,0.7)',
                  border: '1px solid rgba(192,160,96,0.3)',
                  padding: '2px 8px',
                }}>
                  FEATURED
                </span>
              )}
              {product.model3D && (
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(100,150,255,0.7)',
                  border: '1px solid rgba(100,150,255,0.2)',
                  padding: '2px 8px',
                }}>
                  3D
                </span>
              )}
            </div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '0.8rem',
              color: 'rgba(192,192,192,0.35)',
              marginTop: 4,
              maxWidth: 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {product.description}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => onEdit(product)}
              className="admin-btn"
              style={{ fontSize: '0.6rem', padding: '8px 16px' }}
            >
              EDIT
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="admin-btn admin-btn-danger"
              style={{ fontSize: '0.6rem', padding: '8px 16px' }}
            >
              DELETE
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
