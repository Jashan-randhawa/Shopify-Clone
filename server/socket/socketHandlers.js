import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { socketAuth } from '../middleware/auth.js';

// Map to store active users: { userId: socketId }
const activeUsers = new Map();

export const setupSocketHandlers = (io) => {
  // Use authentication middleware
  io.use(socketAuth);
  
  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Add user to active users
    activeUsers.set(socket.userId, socket.id);
    
    // Update user status to online
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: Date.now()
    });
    
    // Emit user online status to friends
    const user = await User.findById(socket.userId);
    if (user && user.friends.length > 0) {
      for (const friendId of user.friends) {
        const friendSocketId = activeUsers.get(friendId.toString());
        if (friendSocketId) {
          io.to(friendSocketId).emit('friend_status', {
            userId: socket.userId,
            status: 'online'
          });
        }
      }
    }
    
    // Join user to their chat rooms
    const userChats = await Chat.find({
      members: { $elemMatch: { $eq: socket.userId } }
    });
    
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });
    
    // Handle joining a chat room
    socket.on('join_chat', async (chatId) => {
      try {
        // Verify chat exists and user is a member
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.includes(socket.userId)) {
          socket.emit('error', { message: 'Cannot join chat: Access denied' });
          return;
        }
        
        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat: ${chatId}`);
      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });
    
    // Handle leaving a chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat: ${chatId}`);
    });
    
    // Handle sending a message
    socket.on('send_message', async (messageData) => {
      try {
        const { content, chatId, attachments = [], tempId } = messageData;
        
        // Verify chat exists and user is a member
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.includes(socket.userId)) {
          socket.emit(`message_sent_${tempId}`, { 
            error: 'Cannot send message: Access denied',
            tempId 
          });
          return;
        }
        
        // Create message in database
        const newMessage = await Message.create({
          sender: socket.userId,
          content: content || '',
          chat: chatId,
          attachment: attachments,
          readBy: [socket.userId] // Mark as read by sender
        });
        
        // Populate sender
        await newMessage.populate('sender', 'name avatar');
        
        // Update latest message in chat
        await Chat.findByIdAndUpdate(chatId, {
          latestMessage: newMessage._id
        });
        
        // Emit message to all users in the chat
        io.to(chatId).emit('receive_message', newMessage);
        
        // Acknowledge message receipt to sender
        socket.emit(`message_sent_${tempId}`, {
          success: true,
          tempId,
          messageId: newMessage._id
        });
        
        // Send notifications to offline users
        for (const memberId of chat.members) {
          // Skip sender
          if (memberId.toString() === socket.userId) continue;
          
          // Check if user is online
          const memberSocketId = activeUsers.get(memberId.toString());
          if (!memberSocketId) {
            // User is offline, create notification
            // This would typically be stored in a notifications collection
            console.log(`Sending notification to offline user: ${memberId}`);
          } else {
            // Emit new message notification to online user
            io.to(memberSocketId).emit('new_message_notification', {
              chatId,
              message: newMessage
            });
          }
        }
      } catch (error) {
        console.error('Socket send message error:', error);
        if (tempId) {
          socket.emit(`message_sent_${tempId}`, { 
            error: 'Failed to send message',
            tempId 
          });
        }
      }
    });
    
    // Handle typing status
    socket.on('typing', (data) => {
      const { chatId } = data;
      
      // Broadcast to all users in the chat except sender
      socket.to(chatId).emit('typing', {
        chatId,
        userId: socket.userId
      });
    });
    
    // Handle stop typing status
    socket.on('stop_typing', (data) => {
      const { chatId } = data;
      
      socket.to(chatId).emit('stop_typing', {
        chatId,
        userId: socket.userId
      });
    });
    
    // Handle read messages
    socket.on('read_messages', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify chat exists and user is a member
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.members.includes(socket.userId)) {
          socket.emit('error', { message: 'Cannot mark messages as read: Access denied' });
          return;
        }
        
        // Mark messages as read in database
        const result = await Message.updateMany(
          { 
            chat: chatId,
            readBy: { $ne: socket.userId },
            sender: { $ne: socket.userId }
          },
          { $addToSet: { readBy: socket.userId } }
        );
        
        if (result.modifiedCount > 0) {
          // Notify other users that messages have been read
          socket.to(chatId).emit('messages_read', {
            chatId,
            userId: socket.userId
          });
        }
      } catch (error) {
        console.error('Socket read messages error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove user from active users
      activeUsers.delete(socket.userId);
      
      // Update user status to offline
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: Date.now()
      });
      
      // Emit user offline status to friends
      const user = await User.findById(socket.userId);
      if (user && user.friends.length > 0) {
        for (const friendId of user.friends) {
          const friendSocketId = activeUsers.get(friendId.toString());
          if (friendSocketId) {
            io.to(friendSocketId).emit('friend_status', {
              userId: socket.userId,
              status: 'offline',
              lastSeen: Date.now()
            });
          }
        }
      }
    });
  });
}; 