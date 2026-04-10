import React, { useState } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Button, TextField,
  Stepper, Step, StepLabel, Divider, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, CircularProgress, Chip
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../component/layout/Navbar';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Confirm'];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [shipping, setShipping] = useState({
    address: '', city: '', state: '', zipCode: '', country: 'US'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = cart.total || 0;
  const shippingCost = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shipping.address || !shipping.city || !shipping.state || !shipping.zipCode) {
      toast.error('Please fill all shipping fields'); return;
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/orders', { shippingAddress: shipping, paymentMethod });
      if (res.data.success) {
        setOrderId(res.data.order._id);
        clearCart();
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (step === 2) return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 14 }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
          <CheckCircle sx={{ fontSize: 80, color: '#2e7d32', mb: 3 }} />
          <Typography variant="h4" fontWeight={800} mb={2}>Order Placed!</Typography>
          <Typography color="text.secondary" mb={1}>Thank you for your purchase, {user?.name}!</Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Order ID: <strong>#{orderId?.slice(-8).toUpperCase()}</strong>
          </Typography>
          <Typography color="text.secondary" mb={4}>
            You'll receive a confirmation email shortly. Your order will be processed within 1-2 business days.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/orders')} sx={{ bgcolor: '#1a237e' }}>
              View Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')} sx={{ borderColor: '#1a237e', color: '#1a237e' }}>
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h4" fontWeight={800} mb={4}>Checkout</Typography>
        <Stepper activeStep={step} sx={{ mb: 5 }}>
          {STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {step === 0 && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Shipping Address</Typography>
                <form onSubmit={handleShippingSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Street Address" required value={shipping.address}
                        onChange={e => setShipping({ ...shipping, address: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="City" required value={shipping.city}
                        onChange={e => setShipping({ ...shipping, city: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="State" required value={shipping.state}
                        onChange={e => setShipping({ ...shipping, state: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField fullWidth label="ZIP Code" required value={shipping.zipCode}
                        onChange={e => setShipping({ ...shipping, zipCode: e.target.value })} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Country" value={shipping.country}
                        onChange={e => setShipping({ ...shipping, country: e.target.value })} />
                    </Grid>
                  </Grid>
                  <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3, bgcolor: '#1a237e', py: 1.5, fontWeight: 700 }}>
                    Continue to Payment
                  </Button>
                </form>
              </Paper>
            )}
            {step === 1 && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Payment Method</Typography>
                <FormControl>
                  <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    <Paper elevation={0} sx={{ p: 2, mb: 2, border: '2px solid', borderColor: paymentMethod === 'cod' ? '#1a237e' : '#e0e0e0', borderRadius: 2, cursor: 'pointer' }}
                      onClick={() => setPaymentMethod('cod')}>
                      <FormControlLabel value="cod" control={<Radio sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }} />}
                        label={<Box><Typography fontWeight={700}>Cash on Delivery</Typography><Typography variant="body2" color="text.secondary">Pay when you receive your order</Typography></Box>} />
                    </Paper>
                    <Paper elevation={0} sx={{ p: 2, border: '2px solid', borderColor: paymentMethod === 'card' ? '#1a237e' : '#e0e0e0', borderRadius: 2, cursor: 'pointer' }}
                      onClick={() => setPaymentMethod('card')}>
                      <FormControlLabel value="card" control={<Radio sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }} />}
                        label={<Box><Typography fontWeight={700}>Credit / Debit Card</Typography><Typography variant="body2" color="text.secondary">Secure payment (demo mode)</Typography></Box>} />
                    </Paper>
                  </RadioGroup>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="outlined" onClick={() => setStep(0)} sx={{ borderColor: '#1a237e', color: '#1a237e', px: 3 }}>Back</Button>
                  <Button variant="contained" onClick={handlePlaceOrder} disabled={loading} sx={{ flex: 1, bgcolor: '#1a237e', py: 1.5, fontWeight: 700 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>

          {/* Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', position: 'sticky', top: 90 }}>
              <Typography variant="h6" fontWeight={800} mb={3}>Order Summary</Typography>
              {cart.items.map(item => item.product && (
                <Box key={item.product._id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box component="img" src={item.product.images?.[0]} alt={item.product.name}
                    sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{item.product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>${(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">Shipping</Typography>
                <Typography variant="body2" fontWeight={600} color={shippingCost === 0 ? 'success.main' : 'inherit'}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" variant="body2">Tax</Typography>
                <Typography variant="body2" fontWeight={600}>${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={800}>Total</Typography>
                <Typography fontWeight={800} color="#1a237e">${total.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;
