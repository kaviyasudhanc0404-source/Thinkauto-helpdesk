import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userMessage: {
    type: String,
    required: true,
    trim: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  usage: {
    prompt_tokens: Number,
    completion_tokens: Number,
    total_tokens: Number
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

export default ChatLog;
