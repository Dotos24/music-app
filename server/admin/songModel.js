const mongoose = require('mongoose');

// Получаем модель Song, если она уже зарегистрирована
let Song;
try {
  Song = mongoose.model('Song');
} catch (error) {
  // Если модель не зарегистрирована, импортируем схему и создаем модель
  const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    coverAsset: { type: String, required: true },
    album: { type: String },
    audioAsset: { type: String, required: true },
    duration: { type: Number, required: true },
  }, { timestamps: true });

  Song = mongoose.model('Song', songSchema);
}

module.exports = Song;
