import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, Grid, Chip, Skeleton, Paper
} from '@mui/material';
import { ArrowForward, LocalShipping, Security, Support, CachedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../utils/dummyjson';
import ProductCard from '../component/shared/ProductCard';
import Navbar from '../component/layout/Navbar';

const CATEGORIES = [
  { name: 'smartphones', emoji: '📱' },
  { name: 'laptops', emoji: '💻' },
  { name: 'fragrances', emoji: '🌸' },
  { name: 'skincare', emoji: '✨' },
  { name: 'groceries', emoji: '🛒' },
  { name: 'furniture', emoji: '🛋️' },
];

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ sort: '-ratings', limit: 8 })
      .then(data => setFeatured(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 60%, #5c6bc0 100%)',
        color: 'white', pt: { xs: 12, md: 16 }, pb: { xs: 10, md: 14 }, position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="🔥 New Arrivals" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2, fontWeight: 600 }} />
              <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1.2, mb: 2, fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
                Shop the Latest<br />
                <Box component="span" sx={{ color: '#ffeb3b' }}>Trends & Deals</Box>
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.85, mb: 4, fontWeight: 400 }}>
                Discover thousands of products. Free shipping on orders over $100.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/products')}
                  endIcon={<ArrowForward />}
                  sx={{ bgcolor: '#ffeb3b', color: '#1a237e', fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#fdd835' } }}>
                  Shop Now
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/products')}
                  sx={{ borderColor: 'white', color: 'white', fontWeight: 600, px: 4, py: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}>
                  Featured Items
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 380 }}>
                {['📱', '👟', '⌚', '🎧'].map((emoji, i) => (
                  <Paper key={i} elevation={8} sx={{
                    p: 4, textAlign: 'center', borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transform: i % 2 === 1 ? 'translateY(20px)' : 'none'
                  }}>
                    <Typography sx={{ fontSize: '2.5rem' }}>{emoji}</Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Badges */}
      <Box sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container>
            {[
              { icon: <LocalShipping />, title: 'Free Shipping', subtitle: 'On orders over $100' },
              { icon: <Security />, title: 'Secure Payment', subtitle: '100% protected' },
              { icon: <CachedOutlined />, title: 'Easy Returns', subtitle: '30-day policy' },
              { icon: <Support />, title: '24/7 Support', subtitle: 'Always here' },
            ].map((item, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, borderRight: { md: i < 3 ? 1 : 0 }, borderColor: 'divider' }}>
                  <Box sx={{ color: '#1a237e', display: { xs: 'none', sm: 'block' } }}>{item.icon}</Box>
                  <Box>
                    <Typography fontWeight={700} variant="body2">{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.subtitle}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={800} mb={1}>Shop by Category</Typography>
        <Typography color="text.secondary" mb={4}>Find exactly what you're looking for</Typography>
        <Grid container spacing={2}>
          {CATEGORIES.map(cat => (
            <Grid item xs={6} sm={4} md={2} key={cat.name}>
              <Paper elevation={0} onClick={() => navigate(`/products?category=${cat.name}`)}
                sx={{
                  p: 3, textAlign: 'center', borderRadius: 3, cursor: 'pointer',
                  border: '2px solid', borderColor: '#e0e0e0', transition: 'all 0.2s',
                  '&:hover': { borderColor: '#1a237e', bgcolor: '#e8eaf6', transform: 'translateY(-4px)' }
                }}>
                <Typography sx={{ fontSize: '2rem', mb: 1 }}>{cat.emoji}</Typography>
                <Typography variant="body2" fontWeight={600} fontSize="0.75rem" textTransform="capitalize">{cat.name}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} mb={0.5}>Featured Products</Typography>
              <Typography color="text.secondary">Handpicked just for you</Typography>
            </Box>
            <Button endIcon={<ArrowForward />} onClick={() => navigate('/products')} sx={{ color: '#1a237e', fontWeight: 700 }}>
              View All
            </Button>
          </Box>
          <Grid container spacing={3}>
            {loading
              ? Array(8).fill(0).map((_, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
                  <Skeleton height={30} sx={{ mt: 1 }} />
                  <Skeleton height={20} width="60%" />
                </Grid>
              ))
              : featured.map(product => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))
            }
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ background: 'linear-gradient(135deg, #ff6f00, #ff8f00)', py: 8, color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={800} mb={2}>Get 20% Off Your First Order</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>Create an account and enjoy exclusive deals.</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/login')}
            sx={{ bgcolor: 'white', color: '#ff6f00', fontWeight: 700, px: 5, py: 1.5, '&:hover': { bgcolor: '#fff8e1' } }}>
            Get Started
          </Button>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#1a1a2e', color: 'rgba(255,255,255,0.7)', py: 4, textAlign: 'center' }}>
        <Typography variant="body2">© 2024 ShopHub. All rights reserved.</Typography>
      </Box>
    </Box>
  );
};

export default Home;
