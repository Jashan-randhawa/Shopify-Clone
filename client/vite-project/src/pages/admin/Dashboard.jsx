import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Select, MenuItem, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, IconButton, Tabs, Tab
} from '@mui/material';
import { Add, Edit, Delete, Inventory, ShoppingCart, AttachMoney, PendingActions } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../component/layout/Navbar';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: '#ff9800', processing: '#2196f3', shipped: '#9c27b0',
  delivered: '#4caf50', cancelled: '#f44336'
};

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  brand: '', images: '', stock: '', featured: false
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/api/orders/admin/stats'),
        api.get('/api/products?limit=100'),
        api.get('/api/orders?limit=50'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (productsRes.data.success) setProducts(productsRes.data.products);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch {} finally { setLoading(false); }
  };

  const handleSeedProducts = async () => {
    try {
      const res = await api.post('/api/products/seed/run');
      if (res.data.success) { toast.success(res.data.message); loadData(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Seed failed'); }
  };

  const openProductDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name, description: product.description, price: product.price,
        originalPrice: product.originalPrice || '', category: product.category,
        brand: product.brand || '', images: product.images?.join(', ') || '',
        stock: product.stock, featured: product.featured
      });
    } else {
      setEditingProduct(null);
      setProductForm(EMPTY_PRODUCT);
    }
    setProductDialog(true);
  };

  const handleSaveProduct = async () => {
    setSaving(true);
    try {
      const data = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stock: Number(productForm.stock),
        images: productForm.images.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = editingProduct
        ? await api.put(`/api/products/${editingProduct._id}`, data)
        : await api.post('/api/products', data);
      if (res.data.success) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setProductDialog(false);
        loadData();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save product'); }
    finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const res = await api.delete(`/api/products/${id}`);
      if (res.data.success) { toast.success('Product deleted'); loadData(); }
    } catch { toast.error('Failed to delete'); }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/orders/${id}/status`, { status });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === id ? res.data.order : o));
        toast.success('Order status updated');
      }
    } catch { toast.error('Failed to update status'); }
  };

  const STAT_CARDS = [
    { icon: <AttachMoney />, label: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, color: '#1a237e' },
    { icon: <ShoppingCart />, label: 'Total Orders', value: stats.totalOrders || 0, color: '#2e7d32' },
    { icon: <PendingActions />, label: 'Pending Orders', value: stats.pendingOrders || 0, color: '#e65100' },
    { icon: <Inventory />, label: 'Total Products', value: stats.totalProducts || 0, color: '#6a1b9a' },
  ];

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ pt: 12, pb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
            <Typography color="text.secondary">Manage your store</Typography>
          </Box>
          <Button variant="outlined" onClick={handleSeedProducts} sx={{ borderColor: '#1a237e', color: '#1a237e' }}>
            Seed Sample Products
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} mb={4}>
          {STAT_CARDS.map((card, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ bgcolor: card.color + '15', color: card.color, p: 1.5, borderRadius: 2 }}>{card.icon}</Box>
                </Box>
                <Typography variant="h4" fontWeight={800} color={card.color}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .Mui-selected': { color: '#1a237e' }, '& .MuiTabs-indicator': { bgcolor: '#1a237e' } }}>
          <Tab label="Products" />
          <Tab label="Orders" />
        </Tabs>

        {tab === 0 && (
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #e0e0e0' }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => openProductDialog()}
                sx={{ bgcolor: '#1a237e' }}>Add Product</Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell fontWeight="bold">Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Featured</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box component="img" src={product.images?.[0]} alt={product.name}
                            sx={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 1 }} />
                          <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={product.category} size="small" /></TableCell>
                      <TableCell><Typography fontWeight={700}>${product.price}</Typography></TableCell>
                      <TableCell>
                        <Chip label={product.stock} size="small"
                          sx={{ bgcolor: product.stock > 0 ? '#e8f5e9' : '#ffebee', color: product.stock > 0 ? '#2e7d32' : '#c62828' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={product.featured ? 'Yes' : 'No'} size="small"
                          sx={{ bgcolor: product.featured ? '#fff3e0' : '#f5f5f5', color: product.featured ? '#e65100' : '#616161' }} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openProductDialog(product)} sx={{ color: '#1a237e' }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteProduct(product._id)} sx={{ color: '#e53935' }}><Delete fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {tab === 1 && (
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order._id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>#{order._id.slice(-8).toUpperCase()}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                      </TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell><Typography fontWeight={700}>${order.total.toFixed(2)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{new Date(order.createdAt).toLocaleDateString()}</Typography></TableCell>
                      <TableCell>
                        <Select value={order.status} size="small" onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}
                          sx={{ fontSize: '0.8rem', color: STATUS_COLORS[order.status], fontWeight: 700 }}>
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Product Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Price ($)" type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Original Price ($) (optional)" type="number" value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Category" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Brand" value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Image URLs (comma separated)" value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })} helperText="Paste one or more image URLs separated by commas" /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Stock" type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} /></Grid>
            <Grid item xs={6}>
              <Select fullWidth value={productForm.featured} onChange={e => setProductForm({ ...productForm, featured: e.target.value })}>
                <MenuItem value={false}>Not Featured</MenuItem>
                <MenuItem value={true}>Featured</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct} disabled={saving} sx={{ bgcolor: '#1a237e' }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (editingProduct ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
