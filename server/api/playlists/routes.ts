import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all playlists for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const playlists = await prisma.playlist.findMany({
      where: { userId: Number(userId) },
      include: {
        songs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true
              }
            }
          }
        }
      }
    });
    
    // Transform the data to a more client-friendly format
    const formattedPlaylists = playlists.map(playlist => ({
      id: playlist.id,
      name: playlist.name,
      userId: playlist.userId,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      songs: playlist.songs.map(item => item.song)
    }));
    
    res.status(200).json(formattedPlaylists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new playlist
router.post('/', async (req, res) => {
  try {
    const { name, userId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ message: 'Name and userId are required' });
    }
    
    const playlist = await prisma.playlist.create({
      data: {
        name,
        userId: Number(userId)
      }
    });
    
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a song to a playlist
router.post('/:playlistId/songs', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { songId } = req.body;
    
    if (!songId) {
      return res.status(400).json({ message: 'SongId is required' });
    }
    
    // Check if playlist exists
    const playlist = await prisma.playlist.findUnique({
      where: { id: Number(playlistId) }
    });
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Check if song exists
    const song = await prisma.song.findUnique({
      where: { id: Number(songId) }
    });
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Add song to playlist
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: Number(playlistId),
        songId: Number(songId)
      }
    });
    
    res.status(201).json(playlistSong);
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a song from a playlist
router.delete('/:playlistId/songs/:songId', async (req, res) => {
  try {
    const { playlistId, songId } = req.params;
    
    // Delete the playlist-song relationship
    await prisma.playlistSong.deleteMany({
      where: {
        playlistId: Number(playlistId),
        songId: Number(songId)
      }
    });
    
    res.status(200).json({ message: 'Song removed from playlist' });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
