import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Chip, Grid, Button,
  Accordion, AccordionSummary, AccordionDetails, Skeleton, Divider
} from '@mui/material';
import { ExpandMore, ShoppingBag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../component/layout/Navbar';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: '#ff9800', processing: '#2196f3', shipped: '#9c27b0',
  delivered: '#4caf50', cancelled: '#f44336'
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/my')
      .then(res => { if (res.data.success) setOrders(res.data.orders); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    try {
      const res = await api.put(`/api/orders/${id}/cancel`);
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === id ? res.data.order : o));
        toast.success('Order cancelled');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Typography variant="h4" fontWeight={800} mb={4}>My Orders</Typography>

        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} height={100} sx={{ borderRadius: 2, mb: 2 }} />)
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <ShoppingBag sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} mb={1}>No orders yet</Typography>
            <Typography color="text.secondary" mb={4}>Start shopping to see your orders here.</Typography>
            <Button variant="contained" onClick={() => navigate('/products')} sx={{ bgcolor: '#1a237e' }}>Shop Now</Button>
          </Box>
        ) : (
          orders.map(order => (
            <Accordion key={order._id} elevation={0}
              sx={{ mb: 2, borderRadius: '12px !important', border: '1px solid #e0e0e0', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="body2" color="text.secondary">Order ID</Typography>
                    <Typography fontWeight={700} variant="body2">#{order._id.slice(-8).toUpperCase()}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography fontWeight={600} variant="body2">{new Date(order.createdAt).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body2" color="text.secondary">Items</Typography>
                    <Typography fontWeight={600} variant="body2">{order.items.length}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography fontWeight={700} variant="body2" color="#1a237e">${order.total.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      size="small"
                      sx={{ bgcolor: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], fontWeight: 700 }} />
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                {order.items.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Box component="img" src={item.image || 'https://via.placeholder.com/60'}
                      alt={item.name} sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={600}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </Typography>
                    </Box>
                    <Typography fontWeight={700}>${(item.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Ship to: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                    </Typography>
                  </Box>
                  {['pending', 'processing'].includes(order.status) && (
                    <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(order._id)}>
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Container>
    </Box>
  );
};

export default Orders;
