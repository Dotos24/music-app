import mongoose from 'mongoose';
import { IAlbum } from '../types/Album';

const albumSchema = new mongoose.Schema<IAlbum>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  coverImage: {
    type: String,
    default: 'default-album-cover.jpg'
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  year: {
    type: Number
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

const Album = mongoose.model<IAlbum>('Album', albumSchema);

export default Album; 