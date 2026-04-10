import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

// Create a socket instance
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false, // Don't connect automatically
  withCredentials: true, // Important for authentication
  reconnection: true, // Enable reconnection
  reconnectionAttempts: 5, // Try to reconnect 5 times
  reconnectionDelay: 1000, // Start with 1 second delay
  reconnectionDelayMax: 5000, // Maximum delay of 5 seconds
  timeout: 10000, // Connection timeout in ms
});

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Socket event listeners
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  toast.success('Connected to chat server');
  reconnectAttempts = 0; // Reset reconnect attempts on successful connection
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    // the disconnection was initiated by the server, reconnect manually
    toast.error('Disconnected from server. Trying to reconnect...');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      socket.connect();
    }
  } else if (reason === 'transport close') {
    // Connection lost, will automatically try to reconnect
    toast.error('Connection lost. Reconnecting...');
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  toast.error('Connection error: ' + error.message);
  
  // If we've reached max reconnect attempts, stop trying
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    toast.error('Could not connect to server. Please refresh the page.');
    socket.disconnect();
  }
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  toast.error(error.message || 'An error occurred');
});

// Export the socket instance
export default socket;

// Helper functions for socket events
export const connectSocket = (userId, token) => {
  if (!userId) {
    console.error('Cannot connect socket: No user ID provided');
    return;
  }
  
  // Set auth data before connecting
  socket.auth = {
    userId,
    token // Optional: Use token if available
  };
  
  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// Send a message to a chat
export const sendMessage = (chatId, messageData) => {
  if (!socket.connected) {
    toast.error('Not connected to chat server');
    return;
  }
  
  // Create a temporary message ID
  const tempId = Date.now().toString();
  
  // Create a promise that resolves when the message is acknowledged
  const messagePromise = new Promise((resolve, reject) => {
    // Set a timeout for message acknowledgment
    const timeout = setTimeout(() => {
      socket.off(`message_sent_${tempId}`);
      reject(new Error('Message sending timeout'));
    }, 10000); // 10 seconds timeout
    
    // Listen for message acknowledgment
    socket.once(`message_sent_${tempId}`, (data) => {
      clearTimeout(timeout);
      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data);
      }
    });
  });
  
  // Emit the message
  socket.emit('send_message', {
    chatId,
    content: messageData.content,
    attachments: messageData.attachments || [],
    tempId
  });
  
  // Optimistically add message to UI
  if (messageData.onSent) {
    const tempMessage = {
      _id: tempId,
      sender: { _id: socket.auth.userId },
      content: messageData.content,
      chat: chatId,
      createdAt: new Date().toISOString(),
      attachments: messageData.attachments || [],
      readBy: [socket.auth.userId],
      pending: true
    };
    messageData.onSent(tempMessage);
  }
  
  // Handle message acknowledgment
  messagePromise
    .then((data) => {
      if (messageData.onAck) {
        messageData.onAck(data);
      }
    })
    .catch((error) => {
      console.error('Message sending error:', error);
      if (messageData.onAck) {
        messageData.onAck({ error: error.message, tempId });
      }
      // Show error toast
      toast.error(error.message || 'Failed to send message');
    });
  
  return messagePromise; // Return promise for additional handling if needed
};

// Join a chat room
export const joinChat = (chatId) => {
  if (!socket.connected) {
    console.error('Cannot join chat: Not connected');
    return;
  }
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off('error');
      reject(new Error('Join chat timeout'));
    }, 5000);
    
    // Listen for errors
    const errorHandler = (error) => {
      clearTimeout(timeout);
      socket.off('error', errorHandler);
      reject(error);
    };
    
    socket.once('error', errorHandler);
    socket.emit('join_chat', chatId);
    resolve();
  });
};

// Leave a chat room
export const leaveChat = (chatId) => {
  if (!socket.connected) return;
  socket.emit('leave_chat', chatId);
};

// Send typing indicator
export const sendTyping = (chatId) => {
  if (!socket.connected) return;
  socket.emit('typing', { chatId });
};

// Send stop typing indicator
export const sendStopTyping = (chatId) => {
  if (!socket.connected) return;
  socket.emit('stop_typing', { chatId });
};

// Mark messages as read
export const markMessagesAsRead = (chatId) => {
  if (!socket.connected) return;
  socket.emit('read_messages', { chatId });
};

// Listen for new messages
export const onNewMessage = (callback) => {
  socket.on('receive_message', callback);
};

// Listen for typing indicators
export const onTyping = (callback) => {
  socket.on('typing', callback);
};

// Listen for stop typing indicators
export const onStopTyping = (callback) => {
  socket.on('stop_typing', callback);
};

// Listen for messages read
export const onMessagesRead = (callback) => {
  socket.on('messages_read', callback);
};

// Listen for message status updates
export const onMessageStatus = (callback) => {
  socket.on('message_status', callback);
};

// Listen for friend status changes
export const onFriendStatus = (callback) => {
  socket.on('friend_status', callback);
};

// Clean up listeners when component unmounts
export const removeListeners = () => {
  socket.off('receive_message');
  socket.off('typing');
  socket.off('stop_typing');
  socket.off('messages_read');
  socket.off('message_status');
  socket.off('friend_status');
}; 