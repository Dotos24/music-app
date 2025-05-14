import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test user
    const hashedPassword = await hashPassword('password123');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      },
    });
    console.log('Created user:', user.email);

    // Create an artist
    const artist = await prisma.artist.create({
      data: {
        name: 'The Beatles',
        bio: 'Legendary rock band from Liverpool',
        imageUrl: 'https://example.com/beatles.jpg',
      },
    });
    console.log('Created artist:', artist.name);

    // Create an album
    const album = await prisma.album.create({
      data: {
        title: 'Abbey Road',
        releaseDate: new Date('1969-09-26'),
        coverUrl: 'https://example.com/abbey-road.jpg',
        artistId: artist.id,
      },
    });
    console.log('Created album:', album.title);

    // Create some songs
    const songs = await Promise.all([
      prisma.song.create({
        data: {
          title: 'Come Together',
          duration: 259, // 4:19
          audioUrl: 'https://example.com/come-together.mp3',
          artistId: artist.id,
          albumId: album.id,
        },
      }),
      prisma.song.create({
        data: {
          title: 'Something',
          duration: 183, // 3:03
          audioUrl: 'https://example.com/something.mp3',
          artistId: artist.id,
          albumId: album.id,
        },
      }),
    ]);
    console.log('Created songs:', songs.map(s => s.title).join(', '));

    // Create a playlist
    const playlist = await prisma.playlist.create({
      data: {
        name: 'My Favorite Songs',
        description: 'A collection of great tunes',
        userId: user.id,
        songs: {
          create: [
            { songId: songs[0].id },
            { songId: songs[1].id },
          ],
        },
      },
    });
    console.log('Created playlist:', playlist.name);

    // Like a song
    await prisma.likedSong.create({
      data: {
        userId: user.id,
        songId: songs[0].id,
      },
    });
    console.log('Liked song:', songs[0].title);

    // Fetch user's playlists with songs
    const userWithPlaylists = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        playlists: {
          include: {
            songs: {
              include: {
                song: {
                  include: {
                    artist: true,
                    album: true,
                  },
                },
              },
            },
          },
        },
        likedSongs: {
          include: {
            song: {
              include: {
                artist: true,
                album: true,
              },
            },
          },
        },
      },
    });

    console.log('\nUser details:');
    console.log('Email:', userWithPlaylists?.email);
    console.log('Playlists:', userWithPlaylists?.playlists.length);
    console.log('Liked songs:', userWithPlaylists?.likedSongs.length);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 