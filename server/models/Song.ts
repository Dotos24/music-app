import mongoose from 'mongoose';

export interface ISong extends mongoose.Document {
  title: string;
  artist: string;
  coverAsset?: string; 
  coverFilePath?: string; 
  coverUrl?: string; 
  album?: string;
  audioAsset?: string; 
  audioFilePath?: string; 
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
  coverAsset: {
    type: String,
    trim: true
  },
  coverFilePath: {
    type: String,
    trim: true
  },
  coverUrl: {
    type: String,
    trim: true
  },  
  album: {
    type: String,
    trim: true
  },
  audioAsset: {
    type: String,
    trim: true
  },
  audioFilePath: {
    type: String,
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
