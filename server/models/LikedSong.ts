import mongoose, { Schema } from 'mongoose';

export interface ILikedSong extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  song: mongoose.Types.ObjectId;
  likedAt: Date;
}

const likedSongSchema = new mongoose.Schema<ILikedSong>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index for user and song to ensure uniqueness
likedSongSchema.index({ user: 1, song: 1 }, { unique: true });

const LikedSong = mongoose.model<ILikedSong>('LikedSong', likedSongSchema);

export default LikedSong;
