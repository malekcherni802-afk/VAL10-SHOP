import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from './api';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, total, loading, error, reload: load };
}

export function useFeaturedProducts() {
  return useProducts({ featured: 'true', limit: 6 });
}
