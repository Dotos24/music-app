import mongoose from 'mongoose';

export interface ISong extends mongoose.Document {
  title: string;
  artist: string;
  coverUrl: string;
  album?: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const songSchema = new mongoose.Schema<ISong>({
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
  coverUrl: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  audioUrl: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    default: 0
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

const Song = mongoose.model<ISong>('Song', songSchema);

export default Song;
