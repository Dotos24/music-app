const mongoose = require('mongoose');

// Отримуємо модель Album, якщо вона вже зареєстрована
let Album;
try {
  Album = mongoose.model('Album');
} catch (error) {
  // Якщо модель не зареєстрована, імпортуємо схему та створюємо модель
  const albumSchema = new mongoose.Schema({
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

  Album = mongoose.model('Album', albumSchema);
}

module.exports = Album; 