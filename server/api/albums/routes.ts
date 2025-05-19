import express from 'express';
import Album from '../../models/Album';
import Song from '../../models/Song';
import { isAuthenticated } from '../../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up multer storage configuration for album covers
const uploadDir = path.join(__dirname, '../../../assets');
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'album-cover-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Get all albums
router.get('/', async (req, res) => {
  try {
    const albums = await Album.find()
      .sort({ artist: 1, title: 1 })
      .populate('songs', 'title artist duration coverAsset coverFilePath');
    
    return res.status(200).json({ albums });
  } catch (error) {
    console.error('Error getting albums:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific album
router.get('/:id', async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('songs', 'title artist duration coverAsset coverFilePath audioAsset audioFilePath');
    
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    return res.status(200).json({ album });
  } catch (error) {
    console.error('Error getting album:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Generate albums from songs (admin only)
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    // Get all songs
    const songs = await Song.find({ album: { $exists: true, $ne: '' } });
    
    // Group songs by album and artist
    const albumsMap = new Map();
    
    for (const song of songs) {
      if (!song.album) continue;
      
      const key = `${song.artist}|${song.album}`;
      
      if (!albumsMap.has(key)) {
        albumsMap.set(key, []);
      }
      
      albumsMap.get(key).push(song);
    }
    
    // Create albums for groups with multiple songs
    const createdAlbums = [];
    
    for (const [key, groupSongs] of albumsMap.entries()) {
      // Only create albums for groups with at least 2 songs
      if (groupSongs.length < 2) continue;
      
      const [artist, title] = key.split('|');
      
      // Check if album already exists
      let album = await Album.findOne({ title, artist });
      
      if (!album) {
        const coverImage = groupSongs[0].coverFilePath || groupSongs[0].coverAsset || 'default-album-cover.jpg';
        
        album = await Album.create({
          title,
          artist,
          coverImage,
          songs: groupSongs.map((song: any) => song._id)
        });
        
        createdAlbums.push(album);
      }
    }
    
    return res.status(201).json({
      message: `Created ${createdAlbums.length} albums`,
      albums: createdAlbums
    });
  } catch (error) {
    console.error('Error generating albums:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create a new album
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, artist, year, songs } = req.body;
    
    if (!title || !artist) {
      return res.status(400).json({ message: 'Album title and artist are required' });
    }
    
    // Check if album already exists
    const existingAlbum = await Album.findOne({ title, artist });
    if (existingAlbum) {
      return res.status(409).json({ message: 'Album already exists' });
    }
    
    const album = await Album.create({
      title,
      artist,
      year: year || undefined,
      songs: songs || [],
      coverImage: 'default-album-cover.jpg'
    });
    
    return res.status(201).json({
      message: 'Album created successfully',
      album
    });
  } catch (error) {
    console.error('Error creating album:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Upload album cover image
router.post('/upload-cover/:albumId', isAuthenticated, (req, res) => {
  const { albumId } = req.params;
  
  if (!albumId) {
    return res.status(400).json({ message: 'Album ID is required' });
  }
  
  // Use type assertion to silence TypeScript errors
  (upload.single('coverImage') as any)(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get relative path to the file
      const relativePath = path.relative(path.join(__dirname, '../../..'), req.file.path)
        .replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
      
      // Update album with new cover image
      const album = await Album.findById(albumId);
      
      if (!album) {
        return res.status(404).json({ message: 'Album not found' });
      }
      
      album.coverImage = relativePath;
      await album.save();
      
      return res.status(200).json({
        message: 'Album cover updated successfully',
        album
      });
    } catch (error) {
      console.error('Error updating album cover:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
});

// Add songs to an album
router.post('/:id/songs', isAuthenticated, async (req, res) => {
  try {
    const { songIds } = req.body;
    
    if (!songIds || !Array.isArray(songIds) || songIds.length === 0) {
      return res.status(400).json({ message: 'Song IDs are required' });
    }
    
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    // Add songs to the album with proper type annotations
    for (const songId of songIds) {
      if (!album.songs.some((id: any) => id.toString() === songId)) {
        album.songs.push(songId);
      }
    }
    
    await album.save();
    
    // Populate and return the updated album
    const populatedAlbum = await Album.findById(album._id)
      .populate('songs', 'title artist duration coverAsset coverFilePath audioAsset audioFilePath');
    
    return res.status(200).json({
      message: 'Songs added to album successfully',
      album: populatedAlbum
    });
  } catch (error) {
    console.error('Error adding songs to album:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove a song from an album
router.delete('/:id/songs/:songId', isAuthenticated, async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }
    
    // Remove the song from the album with explicit type
    album.songs = album.songs.filter(
      (songId: any) => songId.toString() !== req.params.songId
    );
    
    await album.save();
    
    return res.status(200).json({
      message: 'Song removed from album successfully',
      album
    });
  } catch (error) {
    console.error('Error removing song from album:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router; 