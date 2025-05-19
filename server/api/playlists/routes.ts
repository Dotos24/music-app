import express, { Request, Response, NextFunction } from 'express';
import Playlist from '../../models/Playlist';
import { isAuthenticated } from '../../middleware/auth';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up multer storage configuration
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
    cb(null, 'playlist-cover-' + uniqueSuffix + ext);
  }
});

// Create the multer instance
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

// Create a separate handler for file uploads with proper type annotations
const handleFileUpload = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    // Get relative path to the file
    const relativePath = path.relative(path.join(__dirname, '../../..'), req.file.path)
      .replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
    
    console.log('Uploaded file:', req.file);
    console.log('Relative path:', relativePath);
    
    // Return the file path to be stored in the playlist
    res.status(200).json({ 
      message: 'File uploaded successfully',
      coverImage: relativePath
    });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all public playlists for search
router.get('/public', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Base query to find only public playlists
    const baseQuery = { isPublic: true };
    
    // Add search criteria if query parameter is provided
    if (query && typeof query === 'string') {
      Object.assign(baseQuery, {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      });
    }
    
    const playlists = await Playlist.find(baseQuery)
      .sort({ createdAt: -1 })
      .populate('songs', 'title artist duration coverAsset coverFilePath')
      .limit(20); // Limit results for performance
    
    return res.status(200).json({ playlists });
  } catch (error) {
    console.error('Error getting public playlists:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all playlists for the current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .populate('songs', 'title artist duration coverAsset coverFilePath');
    
    return res.status(200).json({ playlists });
  } catch (error) {
    console.error('Error getting playlists:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific playlist
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs', 'title artist duration coverAsset coverFilePath audioAsset audioFilePath');
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user or is public
    if (!playlist.isPublic && playlist.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to access this playlist' });
    }
    
    return res.status(200).json({ playlist });
  } catch (error) {
    console.error('Error getting playlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create a new playlist
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, description, songs, isPublic } = req.body;
    
    console.log('Creating playlist with data:', { 
      name, 
      description, 
      userId: req.user?.userId,
      songsCount: songs?.length || 0,
      isPublic
    });
    
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }
    
    if (!req.user || !req.user.userId) {
      console.error('User not found in request:', req.user);
      return res.status(401).json({ message: 'User authentication failed' });
    }
    
    const playlist = await Playlist.create({
      name,
      description,
      userId: req.user.userId,
      songs: songs || [],
      isPublic: isPublic || false,
      coverImage: 'default-playlist-cover.jpg'
    });
    
    console.log('Playlist created successfully:', playlist._id);
    
    return res.status(201).json({
      message: 'Playlist created successfully',
      playlist
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    // Return more detailed error information
    if (error instanceof Error) {
      return res.status(500).json({ 
        message: 'Server error while creating playlist',
        error: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update a playlist
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { name, description, songs, isPublic, coverImage } = req.body;
    
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }
    
    // Update the playlist
    playlist.name = name || playlist.name;
    if (description !== undefined) playlist.description = description;
    if (songs !== undefined) playlist.songs = songs;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverImage) playlist.coverImage = coverImage;
    
    await playlist.save();
    
    return res.status(200).json({
      message: 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add a song to a playlist
router.post('/:id/songs', isAuthenticated, async (req, res) => {
  try {
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required' });
    }
    
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }
    
    // Check if the song already exists in the playlist
    if (playlist.songs.includes(new mongoose.Types.ObjectId(songId))) {
      return res.status(400).json({ message: 'Song already exists in the playlist' });
    }
    
    // Add the song to the playlist
    playlist.songs.push(new mongoose.Types.ObjectId(songId));
    await playlist.save();
    
    return res.status(200).json({
      message: 'Song added to playlist successfully',
      playlist
    });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove a song from a playlist
router.delete('/:id/songs/:songId', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }
    
    // Remove the song from the playlist
    playlist.songs = playlist.songs.filter(
      (songId) => songId.toString() !== req.params.songId
    );
    
    await playlist.save();
    
    return res.status(200).json({
      message: 'Song removed from playlist successfully',
      playlist
    });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a playlist
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if the playlist belongs to the user
    if (playlist.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }
    
    await Playlist.deleteOne({ _id: req.params.id });
    
    return res.status(200).json({
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Upload a cover image for a playlist - with type assertion to fix TS error
router.post('/upload-cover', isAuthenticated, (req: Request, res: Response) => {
  // Use type assertion to silence TypeScript errors
  (upload.single('coverImage') as any)(req, res, (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    handleFileUpload(req, res);
  });
});

export default router; 