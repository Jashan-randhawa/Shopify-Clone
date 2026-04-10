import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], total: 0 }); return; }
    try {
      const res = await api.get('/api/cart');
      if (res.data.success) setCart(res.data.cart);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return false; }
    setLoading(true);
    try {
      const res = await api.post('/api/cart', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart);
        toast.success('Added to cart!');
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally { setLoading(false); }
    return false;
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const res = await api.put(`/api/cart/${productId}`, { quantity });
      if (res.data.success) setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    } finally { setLoading(false); }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/cart/${productId}`);
      if (res.data.success) { setCart(res.data.cart); toast.success('Item removed'); }
    } catch { toast.error('Failed to remove item'); }
    finally { setLoading(false); }
  };

  const clearCart = () => setCart({ items: [], total: 0 });

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
