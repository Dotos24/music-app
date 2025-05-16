import mongoose, { Schema } from 'mongoose';

export interface IPlaylist extends mongoose.Document {
  name: string;
  description?: string;
  user: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[];
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: Schema.Types.ObjectId,
    ref: 'Song'
  }],
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
