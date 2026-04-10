import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      return this.isGroupChat;
    },
    trim: true
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isGroupChat;
    }
  },
  avatar: {
    type: [String],
    default: function() {
      return this.isGroupChat ? 
        ['https://th.bing.com/th/id/OIP.q5VVZrmosekjgrs7TgwaqwHaIN?w=178&h=197&c=7&r=0&o=5&dpr=1.3&pid=1.7'] : 
        [];
    }
  },
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 