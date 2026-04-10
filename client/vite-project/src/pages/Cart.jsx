import React from 'react';
import {
  Box, Container, Typography, Grid, Paper, Button, IconButton,
  Divider, Chip, CircularProgress
} from '@mui/material';
import { Add, Remove, DeleteOutline, ShoppingBag, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../component/layout/Navbar';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart.total || 0;
  const shipping = subtotal > 100 ? 0 : (subtotal > 0 ? 9.99 : 0);
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cart.items.length === 0) return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 14 }}>
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ShoppingBag sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} mb={1}>Your cart is empty</Typography>
          <Typography color="text.secondary" mb={4}>Looks like you haven't added anything yet.</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/products')}
            sx={{ bgcolor: '#1a237e', fontWeight: 700, px: 4 }}>
            Start Shopping
          </Button>
        </Box>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h4" fontWeight={800} mb={4}>Shopping Cart ({cart.items.length} items)</Typography>
        <Grid container spacing={4}>
          {/* Items */}
          <Grid item xs={12} md={8}>
            {cart.items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <Paper key={item._id || product._id} elevation={0}
                  sx={{ p: 3, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Box component="img"
                      src={product.images?.[0] || 'https://via.placeholder.com/100'}
                      alt={product.name}
                      sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 2, cursor: 'pointer', flexShrink: 0 }}
                      onClick={() => navigate(`/products/${product._id}`)} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap sx={{ cursor: 'pointer', '&:hover': { color: '#1a237e' } }}
                        onClick={() => navigate(`/products/${product._id}`)}>
                        {product.name}
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="#1a237e" mt={0.5}>
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden' }}>
                          <IconButton size="small" sx={{ borderRadius: 0 }} disabled={loading}
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 2, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" sx={{ borderRadius: 0 }} disabled={loading || item.quantity >= product.stock}
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        <IconButton size="small" onClick={() => removeFromCart(product._id)} disabled={loading}
                          sx={{ color: '#e53935', '&:hover': { bgcolor: '#ffebee' } }}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography fontWeight={800} sx={{ flexShrink: 0 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Grid>

          {/* Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: 'white', position: 'sticky', top: 90 }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Order Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography fontWeight={600} color={shipping === 0 ? 'success.main' : 'inherit'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography color="text.secondary">Tax (8%)</Typography>
                <Typography fontWeight={600}>${tax.toFixed(2)}</Typography>
              </Box>
              {shipping > 0 && (
                <Chip label={`Add $${(100 - subtotal).toFixed(2)} more for free shipping`}
                  size="small" sx={{ mb: 2, bgcolor: '#fff3e0', color: '#e65100', fontSize: '0.7rem' }} />
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography fontWeight={800} variant="h6">Total</Typography>
                <Typography fontWeight={800} variant="h6" color="#1a237e">${total.toFixed(2)}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" endIcon={<ArrowForward />}
                onClick={() => navigate('/checkout')}
                sx={{ bgcolor: '#1a237e', fontWeight: 700, py: 1.5, '&:hover': { bgcolor: '#283593' } }}>
                Proceed to Checkout
              </Button>
              <Button fullWidth variant="text" onClick={() => navigate('/products')} sx={{ mt: 1, color: 'text.secondary' }}>
                Continue Shopping
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;
