import mongoose from 'mongoose';
import { ISupportMessage } from '../types/SupportMessage';

const supportMessageSchema = new mongoose.Schema<ISupportMessage>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional, as anonymous users might submit support requests
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
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

const SupportMessage = mongoose.model<ISupportMessage>('SupportMessage', supportMessageSchema);

export default SupportMessage; 