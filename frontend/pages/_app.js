import { useEffect, createContext, useContext, useState, useCallback } from 'react';
import Head from 'next/head';
import '../styles/globals.css';

/* ─── Cart Context ───────────────────────────────────────────── */
const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open,  setOpen]  = useState(false);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('valio_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try { sessionStorage.setItem('valio_cart', JSON.stringify(items)); } catch {}
  }, [items]);

  const addItem = useCallback((product, size = '') => {
    setItems(prev => {
      const key = `${product._id}-${size}`;
      const idx = prev.findIndex(i => `${i._id}-${i.selectedSize}` === key);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...product, selectedSize: size, qty: 1 }];
    });
    setOpen(true);
  }, []);

  const removeItem = useCallback((productId, size = '') => {
    setItems(prev =>
      prev.filter(i => !(i._id === productId && i.selectedSize === size))
    );
  }, []);

  const updateQty = useCallback((productId, size, qty) => {
    if (qty < 1) { removeItem(productId, size); return; }
    setItems(prev =>
      prev.map(i =>
        i._id === productId && i.selectedSize === size ? { ...i, qty } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

/* ─── Lenis ──────────────────────────────────────────────────── */
let lenisInstance = null;
if (typeof window !== 'undefined') {
  import('@studio-freight/lenis').then(({ default: Lenis }) => {
    lenisInstance = new Lenis({
      duration:  1.35,
      easing:    t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth:    true,
      smoothTouch: false,
    });
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }).catch(() => {});
}

/* ─── App ────────────────────────────────────────────────────── */
export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VALIO — Made for Legacy</title>
        <meta name="description" content="VALIO — Luxury Algerian streetwear. Crafted for those who are built different." />
      </Head>

      {/* Film grain overlay */}
      <div className="grain" aria-hidden="true" />

      <Component {...pageProps} />
    </CartProvider>
  );
}
