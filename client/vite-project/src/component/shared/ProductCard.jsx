import React, { useState } from 'react';
import {
  Card, CardMedia, CardContent, CardActions, Typography, Button,
  Rating, Chip, Box, IconButton, Skeleton
} from '@mui/material';
import { ShoppingCart, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  return (
    <Card elevation={0} onClick={() => navigate(`/products/${product._id}`)}
      sx={{
        borderRadius: 2, border: '1px solid #e0e0e0', cursor: 'pointer', height: '100%',
        display: 'flex', flexDirection: 'column', transition: 'all 0.25s',
        '&:hover': { boxShadow: '0 8px 32px rgba(26,35,126,0.12)', transform: 'translateY(-4px)', borderColor: '#c5cae9' }
      }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia component="img" height="220" image={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          sx={{ objectFit: 'cover', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }} />
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexDirection: 'column' }}>
          {discount && (
            <Chip label={`-${discount}%`} size="small"
              sx={{ bgcolor: '#e53935', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
          {product.featured && (
            <Chip label="Featured" size="small"
              sx={{ bgcolor: '#1a237e', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
          {product.stock === 0 && (
            <Chip label="Out of Stock" size="small"
              sx={{ bgcolor: '#616161', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
          )}
        </Box>
        <IconButton size="small" onClick={e => { e.stopPropagation(); setWishlist(!wishlist); }}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}>
          {wishlist ? <Favorite fontSize="small" sx={{ color: '#e53935' }} /> : <FavoriteBorder fontSize="small" />}
        </IconButton>
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
          {product.category}
        </Typography>
        <Typography variant="body1" fontWeight={700} sx={{
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4, mt: 0.5, mb: 1
        }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating value={product.ratings} precision={0.5} readOnly size="small" />
          <Typography variant="caption" color="text.secondary">({product.numReviews})</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h6" fontWeight={800} color="#1a237e">${product.price.toFixed(2)}</Typography>
          {product.originalPrice && (
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              ${product.originalPrice.toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button fullWidth variant="contained" startIcon={<ShoppingCart />}
          onClick={handleAddToCart} disabled={product.stock === 0 || adding}
          size="small"
          sx={{
            bgcolor: '#1a237e', fontWeight: 700, borderRadius: 2,
            '&:hover': { bgcolor: '#283593' },
            '&:disabled': { bgcolor: '#e0e0e0' }
          }}>
          {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
