import express from 'express';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { isAuthenticated } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// multer setup
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ⚠️ Static routes BEFORE dynamic /:param routes

// PUT /api/messages/read/:chatId - mark messages as read
router.put('/read/:chatId', isAuthenticated, async (req, res) => {
  try {
    await Message.updateMany(
      { chat: req.params.chatId, readBy: { $ne: req.user._id } },
      { $push: { readBy: req.user._id } }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/messages/with-attachment - send message with file
router.post('/with-attachment', isAuthenticated, upload.array('attachments', 5), async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat' });
    }

    const attachments = (req.files || []).map(file => ({
      public_id: file.filename,
      url: `/uploads/${file.filename}`,
    }));

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content || '',
      attachments,
      readBy: [req.user._id],
    });

    await message.populate('sender', 'name avatar');
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Send attachment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/messages - send a text message
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { chatId, content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Message content required' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.members.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content,
      readBy: [req.user._id],
    });

    await message.populate('sender', 'name avatar');
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id, updatedAt: new Date() });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/messages/:chatId - get messages for a chat
router.get('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    if (!chat.members.map(String).includes(String(req.user._id))) {
      return res.status(403).json({ success: false, message: 'Not a member of this chat' });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar')
      .sort('createdAt');

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/messages/:messageId
router.delete('/:messageId', isAuthenticated, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await message.deleteOne();
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
