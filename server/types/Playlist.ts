import { Document, Types } from 'mongoose';

export interface IPlaylist extends Document {
  name: string;
  userId: Types.ObjectId;
  coverImage: string;
  songs: Types.ObjectId[];
  isPublic: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
} 