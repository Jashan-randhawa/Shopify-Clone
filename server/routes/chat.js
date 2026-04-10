import express from 'express';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for a user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Find all chats where the user is a member
    const chats = await Chat.find({
      members: { $elemMatch: { $eq: req.user._id } }
    })
      .populate('members', 'name email avatar isOnline lastSeen')
      .populate('admin', 'name email avatar')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });
    
    // Populate sender in latestMessage
    for (const chat of chats) {
      if (chat.latestMessage) {
        await chat.populate('latestMessage.sender', 'name avatar');
      }
    }
    
    return res.status(200).json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create or access one-on-one chat
router.post('/direct/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { members: { $elemMatch: { $eq: req.user._id } } },
        { members: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate('members', 'name email avatar isOnline lastSeen')
      .populate('latestMessage');
    
    if (existingChat) {
      if (existingChat.latestMessage) {
        await existingChat.populate('latestMessage.sender', 'name avatar');
      }
      
      return res.status(200).json({
        success: true,
        chat: existingChat
      });
    }
    
    // Create new chat
    const newChat = await Chat.create({
      name: 'Direct Chat',
      isGroupChat: false,
      members: [req.user._id, userId]
    });
    
    // Populate members
    const fullChat = await Chat.findById(newChat._id)
      .populate('members', 'name email avatar isOnline lastSeen');
    
    return res.status(201).json({
      success: true,
      chat: fullChat
    });
  } catch (error) {
    console.error('Create direct chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create group chat
router.post('/group', isAuthenticated, async (req, res) => {
  try {
    const { name, members } = req.body;
    
    if (!name || !members) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    // Parse members if it's a string
    let membersList = members;
    if (typeof members === 'string') {
      membersList = JSON.parse(members);
    }
    
    // Add current user to members
    membersList.push(req.user._id.toString());
    
    // Remove duplicates
    membersList = [...new Set(membersList)];
    
    // Create group chat
    const groupChat = await Chat.create({
      name,
      isGroupChat: true,
      members: membersList,
      admin: req.user._id
    });
    
    // Populate members and admin
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('members', 'name email avatar isOnline lastSeen')
      .populate('admin', 'name email avatar');
    
    return res.status(201).json({
      success: true,
      chat: fullGroupChat
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Rename group
router.put('/group/rename/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a name' });
    }
    
    // Find and update chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { name },
      { new: true }
    )
      .populate('members', 'name email avatar isOnline lastSeen')
      .populate('admin', 'name email avatar');
    
    if (!updatedChat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Check if user is admin
    if (updatedChat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admin can rename the group' });
    }
    
    return res.status(200).json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Rename group error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add member to group
router.put('/group/add/:chatId/:userId', isAuthenticated, async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    
    // Check if chat exists and is a group chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    if (!chat.isGroupChat) {
      return res.status(400).json({ success: false, message: 'This is not a group chat' });
    }
    
    // Check if user is admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admin can add members' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if user is already in the group
    if (chat.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already in the group' });
    }
    
    // Add user to group
    chat.members.push(userId);
    await chat.save();
    
    // Populate members and admin
    const updatedChat = await Chat.findById(chatId)
      .populate('members', 'name email avatar isOnline lastSeen')
      .populate('admin', 'name email avatar');
    
    return res.status(200).json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove member from group
router.put('/group/remove/:chatId/:userId', isAuthenticated, async (req, res) => {
  try {
    const { chatId, userId } = req.params;
    
    // Check if chat exists and is a group chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    if (!chat.isGroupChat) {
      return res.status(400).json({ success: false, message: 'This is not a group chat' });
    }
    
    // Check if user is admin
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admin can remove members' });
    }
    
    // Check if user is admin (can't remove admin)
    if (userId === chat.admin.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove admin from group' });
    }
    
    // Check if user is in the group
    if (!chat.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User not in the group' });
    }
    
    // Remove user from group
    chat.members = chat.members.filter(
      member => member.toString() !== userId
    );
    
    await chat.save();
    
    // Populate members and admin
    const updatedChat = await Chat.findById(chatId)
      .populate('members', 'name email avatar isOnline lastSeen')
      .populate('admin', 'name email avatar');
    
    return res.status(200).json({
      success: true,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Leave group
router.put('/group/leave/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Check if chat exists and is a group chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    if (!chat.isGroupChat) {
      return res.status(400).json({ success: false, message: 'This is not a group chat' });
    }
    
    // Check if user is in the group
    if (!chat.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You are not in this group' });
    }
    
    // If user is admin, assign new admin if there are other members
    if (chat.admin.toString() === req.user._id.toString()) {
      // Filter out current user
      const otherMembers = chat.members.filter(
        member => member.toString() !== req.user._id.toString()
      );
      
      if (otherMembers.length > 0) {
        // Assign first member as new admin
        chat.admin = otherMembers[0];
      } else {
        // Delete group if no other members
        await Chat.findByIdAndDelete(chatId);
        return res.status(200).json({
          success: true,
          message: 'Group deleted as you were the last member'
        });
      }
    }
    
    // Remove user from group
    chat.members = chat.members.filter(
      member => member.toString() !== req.user._id.toString()
    );
    
    await chat.save();
    
    return res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete chat (only for admin in group chats)
router.delete('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // For group chats, only admin can delete
    if (chat.isGroupChat && chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only admin can delete the group' });
    }
    
    // For direct chats, user must be a member
    if (!chat.isGroupChat && !chat.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not a member of this chat' });
    }
    
    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(chatId);
    
    return res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 