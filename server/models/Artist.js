const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  genres: {
    type: [String],
    default: []
  },
  country: {
    type: String,
    trim: true
  },
  formedYear: {
    type: Number
  },
  imageUrl: {
    type: String,
    trim: true
  },
  socialLinks: {
    website: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    spotify: { type: String, trim: true }
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

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
