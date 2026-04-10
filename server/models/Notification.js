import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['friend_request', 'message', 'group_invite'],
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 