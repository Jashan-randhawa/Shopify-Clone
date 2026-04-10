import React, { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Typography, Button, Rating, Chip, Divider,
  TextField, Avatar, CircularProgress, IconButton, Paper, Skeleton
} from '@mui/material';
import { Add, Remove, ShoppingCart, ArrowBack, LocalShipping, Security, Replay } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../utils/dummyjson';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../component/layout/Navbar';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductById(id)
      .then(p => setProduct(p))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product._id, qty);
    setAdding(false);
  };

  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  if (loading) return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}><Skeleton variant="rectangular" height={450} sx={{ borderRadius: 3 }} /></Grid>
          <Grid item xs={12} md={6}><Skeleton height={50} /><Skeleton height={30} width="60%" /><Skeleton height={80} /></Grid>
        </Grid>
      </Container>
    </Box>
  );

  if (!product) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography>Product not found</Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3, color: '#1a237e' }}>Back</Button>

        <Grid container spacing={5}>
          {/* Images */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0', bgcolor: 'white' }}>
              <Box component="img"
                src={product.images?.[selectedImg] || 'https://via.placeholder.com/500'}
                alt={product.name}
                sx={{ width: '100%', height: 420, objectFit: 'cover' }} />
            </Paper>
            {product.images?.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <Box key={i} onClick={() => setSelectedImg(i)}
                    component="img" src={img} alt=""
                    sx={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 2, cursor: 'pointer',
                      border: selectedImg === i ? '2px solid #1a237e' : '2px solid transparent' }} />
                ))}
              </Box>
            )}
          </Grid>

          {/* Info */}
          <Grid item xs={12} md={6}>
            <Chip label={product.category} size="small"
              sx={{ mb: 2, bgcolor: '#e8eaf6', color: '#1a237e', fontWeight: 600, textTransform: 'capitalize' }} />
            <Typography variant="h4" fontWeight={800} mb={1}>{product.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.ratings} precision={0.5} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">({product.numReviews} reviews)</Typography>
              {product.brand && <Typography variant="body2" color="text.secondary">by <strong>{product.brand}</strong></Typography>}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
              <Typography variant="h4" fontWeight={800} color="#1a237e">${product.price.toFixed(2)}</Typography>
              {product.originalPrice && (
                <>
                  <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                    ${product.originalPrice.toFixed(2)}
                  </Typography>
                  {discount > 0 && <Chip label={`-${discount}%`} size="small" sx={{ bgcolor: '#e53935', color: 'white', fontWeight: 700 }} />}
                </>
              )}
            </Box>

            <Typography color="text.secondary" lineHeight={1.8} mb={3}>{product.description}</Typography>

            <Chip label={product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              sx={{ mb: 3, bgcolor: product.stock > 0 ? '#e8f5e9' : '#ffebee',
                color: product.stock > 0 ? '#2e7d32' : '#c62828', fontWeight: 700 }} />

            {/* Quantity */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography fontWeight={600}>Quantity:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden' }}>
                <IconButton onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} size="small" sx={{ borderRadius: 0 }}>
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center', fontWeight: 700 }}>{qty}</Typography>
                <IconButton onClick={() => setQty(Math.min(product.stock, qty + 1))} disabled={qty >= product.stock} size="small" sx={{ borderRadius: 0 }}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Button fullWidth variant="contained" size="large" startIcon={<ShoppingCart />}
              onClick={handleAddToCart} disabled={product.stock === 0 || adding}
              sx={{ py: 1.5, bgcolor: '#1a237e', fontWeight: 700, fontSize: '1rem', mb: 2, '&:hover': { bgcolor: '#283593' } }}>
              {adding ? <CircularProgress size={24} color="inherit" /> : 'Add to Cart'}
            </Button>

            <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
              {[
                { icon: <LocalShipping fontSize="small" />, text: 'Free shipping over $100' },
                { icon: <Security fontSize="small" />, text: 'Secure checkout' },
                { icon: <Replay fontSize="small" />, text: '30-day returns' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  {item.icon}
                  <Typography variant="caption">{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" fontWeight={800} mb={4}>Customer Reviews</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                  <Typography variant="h2" fontWeight={800} color="#1a237e">{product.ratings.toFixed(1)}</Typography>
                  <Rating value={product.ratings} precision={0.5} readOnly size="large" sx={{ mb: 1 }} />
                  <Typography color="text.secondary">{product.numReviews} total reviews</Typography>
                </Paper>
                {!user && (
                  <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
                    <Typography color="text.secondary" mb={2}>Login to write a review</Typography>
                    <Button variant="outlined" onClick={() => navigate('/login')} sx={{ borderColor: '#1a237e', color: '#1a237e' }}>
                      Login
                    </Button>
                  </Paper>
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                {product.reviews.map((review, i) => (
                  <Paper key={i} elevation={0} sx={{ p: 3, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#1a237e', width: 36, height: 36, fontSize: '0.9rem' }}>
                        {review.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} variant="body2">{review.name}</Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
                  </Paper>
                ))}
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetail;
