import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { getCurrentUser } from '../../lib/auth';

interface LikedSongRequest {
  songId: string;
}

// Get all liked songs
export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const likedSongs = await prisma.likedSong.findMany({
      where: { userId: user.id },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
      orderBy: {
        likedAt: 'desc',
      },
    });

    return NextResponse.json(likedSongs);
  } catch (error) {
    console.error('Get liked songs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add a song to liked songs
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songId } = await request.json() as LikedSongRequest;
    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    const likedSong = await prisma.likedSong.create({
      data: {
        userId: user.id,
        songId,
      },
      include: {
        song: {
          include: {
            artist: true,
            album: true,
          },
        },
      },
    });

    return NextResponse.json(likedSong);
  } catch (error) {
    console.error('Add liked song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove a song from liked songs
export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songId } = await request.json() as LikedSongRequest;
    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    await prisma.likedSong.delete({
      where: {
        userId_songId: {
          userId: user.id,
          songId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove liked song error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 