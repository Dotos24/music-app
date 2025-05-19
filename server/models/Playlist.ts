import mongoose, { Schema } from 'mongoose';

export interface IPlaylist extends mongoose.Document {
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[];
  isPublic: boolean;
  coverImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new mongoose.Schema<IPlaylist>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: Schema.Types.ObjectId,
    ref: 'Song'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: 'default-playlist-cover.jpg'
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

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);

export default Playlist;
