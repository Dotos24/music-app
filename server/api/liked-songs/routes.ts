import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all liked songs for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const likedSongs = await prisma.likedSong.findMany({
      where: { userId: Number(userId) },
      include: {
        song: {
          include: {
            artist: true,
            album: true
          }
        }
      }
    });
    
    // Transform the data to a more client-friendly format
    const formattedLikedSongs = likedSongs.map(item => item.song);
    
    res.status(200).json(formattedLikedSongs);
  } catch (error) {
    console.error('Error fetching liked songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a song
router.post('/', async (req, res) => {
  try {
    const { userId, songId } = req.body;
    
    if (!userId || !songId) {
      return res.status(400).json({ message: 'UserId and songId are required' });
    }
    
    // Check if already liked
    const existingLike = await prisma.likedSong.findFirst({
      where: {
        userId: Number(userId),
        songId: Number(songId)
      }
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Song already liked' });
    }
    
    // Create liked song entry
    const likedSong = await prisma.likedSong.create({
      data: {
        userId: Number(userId),
        songId: Number(songId)
      }
    });
    
    res.status(201).json(likedSong);
  } catch (error) {
    console.error('Error liking song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlike a song
router.delete('/:userId/:songId', async (req, res) => {
  try {
    const { userId, songId } = req.params;
    
    // Delete the liked song entry
    await prisma.likedSong.deleteMany({
      where: {
        userId: Number(userId),
        songId: Number(songId)
      }
    });
    
    res.status(200).json({ message: 'Song unliked successfully' });
  } catch (error) {
    console.error('Error unliking song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
