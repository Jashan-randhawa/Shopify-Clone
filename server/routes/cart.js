import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// GET /api/cart
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price stock');
    if (!cart) return res.status(200).json({ success: true, cart: { items: [], total: 0 } });
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return res.status(200).json({ success: true, cart: { ...cart.toObject(), total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/cart - add item
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(i => i.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    const populated = await cart.populate('items.product', 'name images price stock');
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return res.status(200).json({ success: true, cart: { ...populated.toObject(), total } });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/cart/:productId - update quantity
router.put('/:productId', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await cart.populate('items.product', 'name images price stock');
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return res.status(200).json({ success: true, cart: { ...populated.toObject(), total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/cart/:productId - remove item
router.delete('/:productId', isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await cart.populate('items.product', 'name images price stock');
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return res.status(200).json({ success: true, cart: { ...populated.toObject(), total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/cart - clear cart
router.delete('/', isAuthenticated, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    return res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
