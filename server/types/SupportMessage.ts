import { Document, Types } from 'mongoose';

export interface ISupportMessage extends Document {
  email: string;
  subject: string;
  message: string;
  userId?: Types.ObjectId;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
} 