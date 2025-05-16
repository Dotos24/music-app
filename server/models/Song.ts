import mongoose from 'mongoose';

export interface ISong extends mongoose.Document {
  title: string;
  artist: string;
  coverAsset?: string; // Имя файла в папке assets (новый формат)
  coverFilePath?: string; // Старый формат для пути к обложке
  coverUrl?: string; // Старый формат для URL обложки
  album?: string;
  audioAsset?: string; // Имя файла в папке assets (новый формат)
  audioFilePath?: string; // Старый формат для пути к аудио
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
