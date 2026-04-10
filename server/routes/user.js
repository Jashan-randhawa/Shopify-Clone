import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Search users
router.get('/search', isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    // Search users by name or email, excluding current user
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        { 
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('name email avatar isOnline lastSeen');
    
    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Send friend request
router.post('/friend-request/send/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const receiverUser = await User.findById(userId);
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user is trying to add themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send friend request to yourself' });
    }
    
    // Check if already friends
    if (req.user.friends.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already friends with this user' });
    }
    
    // Check if friend request already sent
    if (receiverUser.friendRequests.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }
    
    // Add to friend requests
    receiverUser.friendRequests.push(req.user._id);
    await receiverUser.save();
    
    // Create notification
    await Notification.create({
      sender: req.user._id,
      receiver: userId,
      type: 'friend_request'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Accept friend request
router.post('/friend-request/accept/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const senderUser = await User.findById(userId);
    if (!senderUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if friend request exists
    if (!req.user.friendRequests.includes(userId)) {
      return res.status(400).json({ success: false, message: 'No friend request from this user' });
    }
    
    // Add to friends for both users
    req.user.friends.push(userId);
    senderUser.friends.push(req.user._id);
    
    // Remove from friend requests
    req.user.friendRequests = req.user.friendRequests.filter(
      id => id.toString() !== userId
    );
    
    // Save both users
    await req.user.save();
    await senderUser.save();
    
    // Delete notification
    await Notification.deleteOne({
      sender: userId,
      receiver: req.user._id,
      type: 'friend_request'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject friend request
router.post('/friend-request/reject/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if friend request exists
    if (!req.user.friendRequests.includes(userId)) {
      return res.status(400).json({ success: false, message: 'No friend request from this user' });
    }
    
    // Remove from friend requests
    req.user.friendRequests = req.user.friendRequests.filter(
      id => id.toString() !== userId
    );
    
    // Save user
    await req.user.save();
    
    // Delete notification
    await Notification.deleteOne({
      sender: userId,
      receiver: req.user._id,
      type: 'friend_request'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Friend request rejected'
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove friend
router.post('/friend/remove/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const friendUser = await User.findById(userId);
    if (!friendUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if they are friends
    if (!req.user.friends.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Not friends with this user' });
    }
    
    // Remove from friends for both users
    req.user.friends = req.user.friends.filter(
      id => id.toString() !== userId
    );
    
    friendUser.friends = friendUser.friends.filter(
      id => id.toString() !== req.user._id.toString()
    );
    
    // Save both users
    await req.user.save();
    await friendUser.save();
    
    return res.status(200).json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all friends
router.get('/friends', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar isOnline lastSeen');
    
    return res.status(200).json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    console.error('Get friends error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get friend requests
router.get('/friend-requests', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests', 'name email avatar');
    
    return res.status(200).json({
      success: true,
      friendRequests: user.friendRequests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 