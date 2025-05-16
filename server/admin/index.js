const express = require('express');
const path = require('path');
// Используем нашу обертку для модели Song
const Song = require('./songModel');
const router = express.Router();

// Список треков
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.render('admin/views/songs', { songs, message: req.query.message });
  } catch (error) {
    console.error('Ошибка при получении списка треков:', error);
    res.status(500).render('admin/views/error', { error });
  }
});

// Форма добавления трека
router.get('/add', (req, res) => {
  res.render('admin/views/add_song');
});

// Обработка добавления трека
router.post('/add', async (req, res) => {
  try {
    const { title, artist, album, duration, coverAsset, audioAsset } = req.body;
    
    if (!coverAsset || !audioAsset) {
      return res.status(400).render('admin/views/add_song', { 
        error: 'Необходимо указать пути к обложке и аудиофайлу' 
      });
    }
    
    // Проверяем, что введенные пути - это только имена файлов, без путей к папкам
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
    res.redirect('/?message=Трек успешно добавлен');
  } catch (error) {
    console.error('Ошибка при добавлении трека:', error);
    res.status(500).render('admin/views/add_song', { error: error.message });
  }
});

// Удаление трека
router.get('/delete/:id', async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.redirect('/?message=Трек успешно удален');
  } catch (error) {
    console.error('Ошибка при удалении трека:', error);
    res.status(500).render('admin/error', { error });
  }
});

module.exports = router;
