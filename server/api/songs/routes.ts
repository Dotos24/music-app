import express from 'express';
import Song from '../../models/Song';

const router = express.Router();

// Get all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
});

// Get song by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const song = await Song.findById(id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.status(200).json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
});

// Search songs
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { album: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
});

// Add a new song
router.post('/', async (req, res) => {
  try {
    const { title, artist, coverUrl, album, audioUrl, duration } = req.body;
    
    if (!title || !artist || !coverUrl || !audioUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newSong = await Song.create({
      title,
      artist,
      coverUrl,
      album,
      audioUrl,
      duration: duration || 0
    });
    
    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
});

// Delete a song
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const song = await Song.findByIdAndDelete(id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'Server error' });
    return;
  }
});

export default router;
