import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all songs
router.get('/', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        artist: true,
        album: true
      }
    });
    
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get song by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const song = await prisma.song.findUnique({
      where: { id: Number(id) },
      include: {
        artist: true,
        album: true
      }
    });
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    res.status(200).json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search songs
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const songs = await prisma.song.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { artist: { name: { contains: query, mode: 'insensitive' } } },
          { album: { title: { contains: query, mode: 'insensitive' } } }
        ]
      },
      include: {
        artist: true,
        album: true
      }
    });
    
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
