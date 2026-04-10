/**
 * Product API adapter — talks to our own backend (/api/products).
 * Uses regex-based search so it works even before MongoDB text index is built.
 */

import api from './api';

// ─── Fetch paginated / filtered products ─────────────────────────────────────
export const fetchProducts = async ({
  search = '',
  category = 'all',
  sort = '-createdAt',
  page = 1,
  limit = 12,
  minPrice = 0,
  maxPrice = Infinity,
} = {}) => {
  const params = { sort, page, limit };

  if (search.trim())                  params.search   = search.trim();
  if (category && category !== 'all') params.category = category;
  if (minPrice > 0)                   params.minPrice = minPrice;
  if (maxPrice < Infinity)            params.maxPrice = maxPrice;

  const res = await api.get('/api/products', { params });
  const { products, total, pages } = res.data;

  return { products: products ?? [], total: total ?? 0, page, pages: pages ?? 1 };
};

// ─── Fetch distinct categories ────────────────────────────────────────────────
export const fetchCategories = async () => {
  const res = await api.get('/api/products/categories');
  return res.data.categories ?? [];
};

// ─── Fetch single product by MongoDB _id ─────────────────────────────────────
export const fetchProductById = async (id) => {
  const res = await api.get(`/api/products/${id}`);
  return res.data.product;
};
