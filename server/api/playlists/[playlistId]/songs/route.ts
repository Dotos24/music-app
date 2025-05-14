import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser } from '../../../../lib/auth';

interface PlaylistSongRequest {
  songId: string;
}

// Add a song to a playlist
export async function POST(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songId } = await request.json() as PlaylistSongRequest;
    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Verify playlist ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    // Add song to playlist
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: params.playlistId,
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

    return NextResponse.json(playlistSong);
  } catch (error) {
    console.error('Add song to playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove a song from a playlist
export async function DELETE(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { songId } = await request.json() as PlaylistSongRequest;
    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Verify playlist ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
    });

    if (!playlist || playlist.userId !== user.id) {
      return NextResponse.json(
        { error: 'Playlist not found or access denied' },
        { status: 404 }
      );
    }

    // Remove song from playlist
    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId: params.playlistId,
          songId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 