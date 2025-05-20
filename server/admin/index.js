const express = require('express');
const path = require('path');
// Використовуємо наші обгортки для моделей
const Song = require('./songModel');
const Artist = require('../models/Artist');
const Album = require('./albumModel');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Налаштування multer для завантаження файлів
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../assets');
    // Переконатися, що папка існує
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Створити унікальне ім'я файлу з датою
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'artist-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимальний розмір
  },
  fileFilter: function(req, file, cb) {
    // Перевірити тип файлу
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Дозволені лише зображення!'), false);
    }
    cb(null, true);
  }
});

// Головна сторінка адмінки
router.get('/', async (req, res) => {
  try {
    res.render('admin/views/dashboard', { message: req.query.message });
  } catch (error) {
    console.error('Помилка при завантаженні адмінки:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

// Список треків
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.render('admin/views/songs', { songs, message: req.query.message });
  } catch (error) {
    console.error('Помилка при отриманні списку треків:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

// Форма додавання треку
router.get('/songs/add', (req, res) => {
  res.render('admin/views/add_song');
});

// Обробка додавання треку
router.post('/songs/add', async (req, res) => {
  try {
    const { title, artist, album, duration, coverAsset, audioAsset } = req.body;
    
    if (!coverAsset || !audioAsset) {
      return res.status(400).render('admin/views/add_song', { 
        error: 'Необхідно вказати шляхи до обкладинки та аудіофайлу' 
      });
    }
    
    // Перевіряємо, що введені шляхи - це лише імена файлів, без шляхів до папок
    const coverFileName = path.basename(coverAsset);
    const audioFileName = path.basename(audioAsset);
    
    const newSong = new Song({
      title,
      artist,
      album,
      duration: parseInt(duration, 10),
      coverAsset: coverFileName,
      audioAsset: audioFileName
    });
    
    await newSong.save();
    res.redirect('/admin/songs?message=Трек успішно додано');
  } catch (error) {
    console.error('Помилка при додаванні треку:', error);
    res.status(500).render('admin/views/add_song', { error: error.message });
  }
});

// Видалення треку
router.get('/songs/delete/:id', async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.redirect('/admin/songs?message=Трек успішно видалено');
  } catch (error) {
    console.error('Помилка при видаленні треку:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

// ========== АРТИСТИ ==========

// Список артистів
router.get('/artists', async (req, res) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    res.render('admin/views/artists', { artists, message: req.query.message });
  } catch (error) {
    console.error('Помилка при отриманні списку артистів:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

// Форма додавання артиста
router.get('/artists/add', (req, res) => {
  res.render('admin/views/add_artist');
});

// Форма редагування артиста
router.get('/artists/edit/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).render('admin/views/error', { error: 'Артист не знайдений' });
    }
    
    // Знайти альбоми та пісні артиста
    const albums = await Album.find({ artist: artist.name });
    const songs = await Song.find({ artist: artist.name });
    
    res.render('admin/views/edit_artist', { artist, albums, songs });
  } catch (error) {
    console.error('Помилка при отриманні даних артиста:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

// Обробка додавання артиста
router.post('/artists/add', async (req, res) => {
  try {
    const { name, bio, country, formedYear, genres } = req.body;
    
    if (!name) {
      return res.status(400).render('admin/views/add_artist', { 
        error: "Ім'я артиста обов'язкове" 
      });
    }
    
    // Перевірити, чи існує артист
    const existingArtist = await Artist.findOne({ name });
    if (existingArtist) {
      return res.status(400).render('admin/views/add_artist', { 
        error: 'Артист з таким іменем вже існує' 
      });
    }
    
    // Підготувати масив жанрів
    const genresArray = genres ? genres.split(',').map(g => g.trim()) : [];
    
    const newArtist = new Artist({
      name,
      bio: bio || '',
      country: country || '',
      formedYear: formedYear ? parseInt(formedYear, 10) : null,
      genres: genresArray,
      imageUrl: 'default-artist-image.jpg'
    });
    
    await newArtist.save();
    res.redirect('/admin/artists?message=Артист успішно доданий');
  } catch (error) {
    console.error('Помилка при додаванні артиста:', error);
    res.status(500).render('admin/views/add_artist', { error: error.message });
  }
});

// Обробка редагування артиста
router.post('/artists/edit/:id', async (req, res) => {
  try {
    const { name, bio, country, formedYear, genres } = req.body;
    
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).render('admin/views/error', { error: 'Артист не знайдений' });
    }
    
    // Перевірити, чи існує інший артист з таким іменем
    if (name !== artist.name) {
      const existingArtist = await Artist.findOne({ name });
      if (existingArtist) {
        return res.status(400).render('admin/views/edit_artist', { 
          error: 'Артист з таким іменем вже існує',
          artist
        });
      }
    }
    
    // Підготувати масив жанрів
    const genresArray = genres ? genres.split(',').map(g => g.trim()) : [];
    
    // Оновити дані
    artist.name = name;
    artist.bio = bio || '';
    artist.country = country || '';
    artist.formedYear = formedYear ? parseInt(formedYear, 10) : null;
    artist.genres = genresArray;
    
    await artist.save();
    res.redirect('/admin/artists?message=Артист успішно оновлений');
  } catch (error) {
    console.error('Помилка при оновленні артиста:', error);
    res.status(500).render('admin/views/error', { error: error.message });
  }
});

// Обробка завантаження зображення артиста
router.post('/artists/upload-image/:id', upload.single('image'), async (req, res) => {
  try {
    const artistId = req.params.id;
    const file = req.file;
    
    if (!file) {
      const artist = await Artist.findById(artistId);
      if (!artist) {
        return res.status(404).render('admin/views/error', { error: 'Артист не знайдений' });
      }
      
      // Знайти альбоми та пісні артиста для відображення на сторінці
      const albums = await Album.find({ artist: artist.name });
      const songs = await Song.find({ artist: artist.name });
      
      return res.status(400).render('admin/views/edit_artist', { 
        error: 'Файл зображення не завантажено',
        artist,
        albums,
        songs
      });
    }
    
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).render('admin/views/error', { error: 'Артист не знайдений' });
    }
    
    // Оновити шлях до зображення артиста
    artist.imageUrl = file.filename;
    await artist.save();
    
    // Знайти альбоми та пісні артиста для відображення на сторінці
    const albums = await Album.find({ artist: artist.name });
    const songs = await Song.find({ artist: artist.name });
    
    return res.render('admin/views/edit_artist', { 
      artist, 
      albums, 
      songs,
      message: 'Фото артиста успішно оновлено' 
    });
  } catch (error) {
    console.error('Помилка при завантаженні зображення артиста:', error);
    res.status(500).render('admin/views/error', { error: error.message });
  }
});

// Видалення артиста
router.get('/artists/delete/:id', async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.redirect('/admin/artists?message=Артист успішно видалений');
  } catch (error) {
    console.error('Помилка при видаленні артиста:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

module.exports = router;
