import { useState } from 'react';
import { useCart } from '../../lib/CartContext';
import { placeOrder } from '../../lib/api';

export default function CartDrawer() {
  const {
    items, open, setOpen,
    removeItem, updateQty, clearCart, total,
  } = useCart();

  const [stage,    setStage]    = useState('cart');   // 'cart' | 'checkout' | 'success'
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [orderRef, setOrderRef] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', wilaya: '',
  });

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  async function handleCheckout(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        customer: form,
        items: items.map(i => ({
          product:  i._id,
          size:     i.selectedSize || '',
          quantity: i.qty,
        })),
      };
      const result = await placeOrder(payload);
      setOrderRef(result.ref || '');
      clearCart();
      setStage('success');
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setStage('cart');
      setError('');
      setForm({ name: '', email: '', phone: '', address: '', wilaya: '' });
    }, 400);
  }

  const overlayStyle = {
    position:      'fixed',
    inset:         0,
    zIndex:        99900,
    background:    'rgba(0,0,0,0.65)',
    opacity:       open ? 1 : 0,
    pointerEvents: open ? 'all' : 'none',
    transition:    'opacity 0.4s ease',
  };

  const drawerStyle = {
    position:      'fixed',
    top:           0,
    right:         0,
    bottom:        0,
    width:         '420px',
    maxWidth:      '95vw',
    background:    '#0c0c0c',
    borderLeft:    '1px solid #2a2a2a',
    zIndex:        99901,
    display:       'flex',
    flexDirection: 'column',
    transform:     open ? 'translateX(0)' : 'translateX(100%)',
    transition:    'transform 0.45s cubic-bezier(0.76,0,0.24,1)',
  };

  return (
    <>
      <div style={overlayStyle} onClick={handleClose} aria-hidden="true" />

      <aside style={drawerStyle} role="dialog" aria-label="Shopping cart">
        {/* ── Header ── */}
        <div
          style={{
            padding:        '24px 28px',
            borderBottom:   '1px solid #1e1e1e',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              fontFamily:    '"Bebas Neue", sans-serif',
              fontSize:      '1.4rem',
              color:         '#e8e8e8',
              letterSpacing: '0.1em',
            }}
          >
            {stage === 'cart'     && `CART (${items.length})`}
            {stage === 'checkout' && 'CHECKOUT'}
            {stage === 'success'  && 'ORDER PLACED'}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close cart"
            style={{ background: 'none', border: 'none', color: '#888', padding: '4px' }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* Cart stage */}
          {stage === 'cart' && (
            items.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '80px', color: '#555' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
                <p
                  style={{
                    fontFamily:    '"DM Mono", monospace',
                    fontSize:      '0.75rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  Your cart is empty
                </p>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={`${item._id}-${item.selectedSize}`}
                  style={{
                    display:       'flex',
                    gap:           '16px',
                    marginBottom:  '24px',
                    paddingBottom: '24px',
                    borderBottom:  '1px solid #1e1e1e',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width:      '72px',
                      height:     '90px',
                      flexShrink: 0,
                      background: '#161616',
                      overflow:   'hidden',
                    }}
                  >
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize:     '0.85rem',
                        color:        '#e8e8e8',
                        fontWeight:   '500',
                        marginBottom: '4px',
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </p>

                    {item.selectedSize && (
                      <p
                        style={{
                          fontSize:      '0.7rem',
                          color:         '#888',
                          fontFamily:    '"DM Mono", monospace',
                          letterSpacing: '0.1em',
                          marginBottom:  '8px',
                        }}
                      >
                        SIZE: {item.selectedSize.toUpperCase()}
                      </p>
                    )}

                    <p
                      style={{
                        color:         '#d4a843',
                        fontFamily:    '"DM Mono", monospace',
                        fontSize:      '0.85rem',
                        marginBottom:  '12px',
                      }}
                    >
                      {(item.price * item.qty).toLocaleString()} DZD
                    </p>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => updateQty(item._id, item.selectedSize, item.qty - 1)}
                        style={{
                          background: '#1e1e1e',
                          border:     'none',
                          color:      '#ccc',
                          width:      '28px',
                          height:     '28px',
                          fontSize:   '1rem',
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontFamily: '"DM Mono", monospace',
                          fontSize:   '0.8rem',
                          color:      '#ccc',
                          minWidth:   '20px',
                          textAlign:  'center',
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item._id, item.selectedSize, item.qty + 1)}
                        style={{
                          background: '#1e1e1e',
                          border:     'none',
                          color:      '#ccc',
                          width:      '28px',
                          height:     '28px',
                          fontSize:   '1rem',
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item._id, item.selectedSize)}
                        style={{
                          marginLeft:    'auto',
                          background:    'none',
                          border:        'none',
                          color:         '#555',
                          fontSize:      '0.7rem',
                          fontFamily:    '"DM Mono", monospace',
                          letterSpacing: '0.1em',
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* Checkout stage */}
          {stage === 'checkout' && (
            <form
              onSubmit={handleCheckout}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {[
                { field: 'name',    label: 'Full Name *',      type: 'text'  },
                { field: 'email',   label: 'Email *',          type: 'email' },
                { field: 'phone',   label: 'Phone',            type: 'tel'   },
                { field: 'wilaya',  label: 'Wilaya / City',    type: 'text'  },
                { field: 'address', label: 'Delivery Address', type: 'text'  },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label
                    style={{
                      display:       'block',
                      fontSize:      '0.65rem',
                      fontFamily:    '"DM Mono", monospace',
                      letterSpacing: '0.15em',
                      color:         '#888',
                      marginBottom:  '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={set(field)}
                    required={field === 'name' || field === 'email'}
                    className="admin-field"
                  />
                </div>
              ))}

              {error && (
                <p
                  style={{
                    color:      '#e05555',
                    fontSize:   '0.8rem',
                    fontFamily: '"DM Mono", monospace',
                  }}
                >
                  {error}
                </p>
              )}
            </form>
          )}

          {/* Success stage */}
          {stage === 'success' && (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🖤</div>
              <h3
                style={{
                  fontFamily:    '"Bebas Neue", sans-serif',
                  fontSize:      '1.6rem',
                  color:         '#d4a843',
                  letterSpacing: '0.1em',
                  marginBottom:  '12px',
                }}
              >
                ORDER CONFIRMED
              </h3>
              {orderRef && (
                <p
                  style={{
                    fontFamily:    '"DM Mono", monospace',
                    fontSize:      '0.75rem',
                    color:         '#888',
                    letterSpacing: '0.15em',
                    marginBottom:  '20px',
                  }}
                >
                  REF: {orderRef}
                </p>
              )}
              <p
                style={{
                  fontSize:     '0.85rem',
                  color:        '#aaa',
                  lineHeight:   '1.7',
                  marginBottom: '32px',
                }}
              >
                We'll contact you shortly to confirm your delivery details.
              </p>
              <button
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleClose}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {stage !== 'success' && items.length > 0 && (
          <div style={{ padding: '20px 28px', borderTop: '1px solid #1e1e1e' }}>
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                marginBottom:   '20px',
              }}
            >
              <span
                style={{
                  fontFamily:    '"DM Mono", monospace',
                  fontSize:      '0.7rem',
                  letterSpacing: '0.15em',
                  color:         '#888',
                  textTransform: 'uppercase',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize:   '1rem',
                  color:      '#d4a843',
                }}
              >
                {total.toLocaleString()} DZD
              </span>
            </div>

            {stage === 'cart' && (
              <button
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setError(''); setStage('checkout'); }}
              >
                PROCEED TO CHECKOUT
              </button>
            )}

            {stage === 'checkout' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setStage('cart')}
                >
                  BACK
                </button>
                <button
                  className="btn-gold"
                  style={{ flex: 2, justifyContent: 'center' }}
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'PLACING…' : 'CONFIRM ORDER'}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
