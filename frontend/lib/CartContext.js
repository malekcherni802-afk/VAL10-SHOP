import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open,  setOpen]  = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('valio_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      sessionStorage.setItem('valio_cart', JSON.stringify(items));
    } catch {}
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
    if (qty < 1) {
      setItems(prev =>
        prev.filter(i => !(i._id === productId && i.selectedSize === size))
      );
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i._id === productId && i.selectedSize === size ? { ...i, qty } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, open, setOpen, addItem, removeItem, updateQty, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}
