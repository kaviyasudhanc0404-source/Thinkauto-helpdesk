import mongoose from 'mongoose';
import { TICKET_STATUSES, normalizeTicketStatus } from '../utils/ticketStatus.js';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Network', 'Hardware', 'Software', 'Access', 'Security', 'Gmail', 'Others']
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: TICKET_STATUSES,
    set: normalizeTicketStatus,
    default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  sla: {
    responseDeadline: Date,
    resolutionDeadline: Date,
    breached: {
      type: Boolean,
      default: false
    }
  },
  aiSuggestions: {
    suggestedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confidence: Number,
    category: String
  },
  resolution: {
    text: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  verification: {
    otp: String,
    otpExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate SLA deadlines
ticketSchema.pre('save', function(next) {
  if (this.isNew) {
    const now = new Date();
    this.sla.responseDeadline = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    this.sla.resolutionDeadline = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
