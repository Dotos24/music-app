import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { getCurrentUser } from '../../lib/auth';

interface CreatePlaylistRequest {
  name: string;
  description?: string;
}

// Get all playlists for the current user
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

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id },
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
    });

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new playlist
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

    const { name, description } = await request.json() as CreatePlaylistRequest;

    if (!name) {
      return NextResponse.json(
        { error: 'Playlist name is required' },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Create playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 