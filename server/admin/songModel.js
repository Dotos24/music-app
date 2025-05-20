const mongoose = require('mongoose');

// Отримуємо модель Song, якщо вона вже зареєстрована
let Song;
try {
  Song = mongoose.model('Song');
} catch (error) {
  // Якщо модель не зареєстрована, імпортуємо схему та створюємо модель
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
