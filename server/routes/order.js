import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders - create order from cart
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', notes = '' } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || '',
      price: item.price,
      quantity: item.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingCost = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal: Math.round(subtotal * 100) / 100,
      shippingCost: Math.round(shippingCost * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      notes,
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    await Cart.findOneAndDelete({ user: req.user._id });
    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ⚠️ STATIC routes MUST come before /:id or Express matches them as an id param

// GET /api/orders/my - get current user's orders
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/admin/stats - admin dashboard stats
router.get('/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [totalOrders, totalRevenue, pendingOrders, products] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments()
    ]);
    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        totalProducts: products
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders - admin: get all orders
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort('-createdAt')
        .skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    return res.status(200).json({ success: true, orders, total });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/:id - single order
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/orders/:id/status - admin update status
router.put('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'delivered') update.deliveredAt = new Date();
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/orders/:id/cancel - user cancel
router.put('/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    await order.save();
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
