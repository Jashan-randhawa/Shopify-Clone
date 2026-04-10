import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  addresses: user.addresses,
  wishlist: user.wishlist,
  createdAt: user.createdAt
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    setCookie(res, token);
    return res.status(201).json({ success: true, message: 'Account created successfully', user: sanitizeUser(user), token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    setCookie(res, token);
    return res.status(200).json({ success: true, message: 'Login successful', user: sanitizeUser(user), token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/logout', isAuthenticated, async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, addresses },
      { new: true }
    ).select('-password');
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
