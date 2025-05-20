import express from 'express';
import { isAuthenticated } from '../../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const Artist = require('../../models/Artist');
import Song from '../../models/Song';
import Album from '../../models/Album';

const router = express.Router();

// Set up multer storage configuration for artist images
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
    cb(null, 'artist-image-' + uniqueSuffix + ext);
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

// Get all artists
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find().sort({ name: 1 });
    return res.status(200).json({ artists });
  } catch (error) {
    console.error('Error getting artists:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific artist
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Find albums by this artist
    const albums = await Album.find({ artist: artist.name })
      .populate('songs', 'title artist duration coverAsset coverFilePath');
    
    // Find songs by this artist that are not in albums
    const songs = await Song.find({ 
      artist: artist.name,
      album: { $exists: false }
    });
    
    // Count total songs (both in albums and standalone)
    let totalSongs = songs.length;
    albums.forEach(album => {
      totalSongs += album.songs?.length || 0;
    });
    
    return res.status(200).json({ 
      artist,
      albums,
      songs,
      stats: {
        totalSongs,
        totalAlbums: albums.length
      }
    });
  } catch (error) {
    console.error('Error getting artist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create a new artist (admin only)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      genres, 
      country, 
      formedYear,
      socialLinks 
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Artist name is required' });
    }
    
    // Check if artist already exists
    const existingArtist = await Artist.findOne({ name });
    if (existingArtist) {
      return res.status(409).json({ message: 'Artist already exists' });
    }
    
    const artist = await Artist.create({
      name,
      bio: bio || '',
      genres: genres || [],
      country: country || '',
      formedYear: formedYear || null,
      socialLinks: socialLinks || {},
      imageUrl: 'default-artist-image.jpg'
    });
    
    return res.status(201).json({
      message: 'Artist created successfully',
      artist
    });
  } catch (error) {
    console.error('Error creating artist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update artist info (admin only)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const artistId = req.params.id;
    const { 
      name, 
      bio, 
      genres, 
      country, 
      formedYear,
      socialLinks 
    } = req.body;
    
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Update fields if provided
    if (name) artist.name = name;
    if (bio !== undefined) artist.bio = bio;
    if (genres) artist.genres = genres;
    if (country !== undefined) artist.country = country;
    if (formedYear !== undefined) artist.formedYear = formedYear;
    if (socialLinks) {
      artist.socialLinks = {
        ...artist.socialLinks,
        ...socialLinks
      };
    }
    
    await artist.save();
    
    return res.status(200).json({
      message: 'Artist updated successfully',
      artist
    });
  } catch (error) {
    console.error('Error updating artist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Upload artist image
router.post('/upload-image/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const artistId = req.params.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Update artist with new image path
    const relativePath = file.filename;
    artist.imageUrl = relativePath;
    await artist.save();
    
    return res.status(200).json({
      message: 'Artist image uploaded successfully',
      artist
    });
  } catch (error) {
    console.error('Error uploading artist image:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Generate artists from songs (admin only)
router.post('/generate', isAuthenticated, async (req, res) => {
  try {
    // Get all songs
    const songs = await Song.find();
    
    // Get unique artist names
    const artistNames = [...new Set(songs.map(song => song.artist))];
    
    // Create artists that don't exist yet
    const createdArtists = [];
    
    for (const name of artistNames) {
      // Check if artist already exists
      let artist = await Artist.findOne({ name });
      
      if (!artist && name) {
        artist = await Artist.create({
          name,
          bio: '',
          genres: [],
          country: '',
          formedYear: null,
          socialLinks: {},
          imageUrl: 'default-artist-image.jpg'
        });
        
        createdArtists.push(artist);
      }
    }
    
    return res.status(201).json({
      message: `Created ${createdArtists.length} artists`,
      artists: createdArtists
    });
  } catch (error) {
    console.error('Error generating artists:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router; 