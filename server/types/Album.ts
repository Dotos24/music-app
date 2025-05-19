import { Document, Types } from 'mongoose';

export interface IAlbum extends Document {
  title: string;
  artist: string;
  coverImage: string;
  songs: Types.ObjectId[];
  year?: number;
  createdAt: Date;
  updatedAt: Date;
} 