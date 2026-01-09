import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.decode(token);
        if (!decoded || typeof decoded !== 'object' || !('email' in decoded)) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
    const { email: userEmail } = decoded as { email: string };


    if (!userEmail) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Amigos que él envió
    const friends1 = await prisma.friend.findMany({
      where: { userId: currentUser.id, status: 'accepted' },
      select: {
        friendId: true,
      },
    });

    // Amigos que le enviaron
    const friends2 = await prisma.friend.findMany({
      where: { friendId: currentUser.id, status: 'accepted' },
      select: {
        userId: true,
      },
    });

    const friendIds = [
      ...friends1.map(f => f.friendId),
      ...friends2.map(f => f.userId),
    ];

    const uniqueFriendIds = Array.from(new Set(friendIds));

    const friendsData = await prisma.user.findMany({
      where: {
        id: { in: uniqueFriendIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        nivel: true,
        progress: true,
      },
    });

    // Agregamos al propio usuario
    const all = [
      ...friendsData,
      {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        nivel: currentUser.nivel,
        progress: currentUser.progress,
      },
    ];

    // Ordenar por nivel (ascendente) y progreso (descendente)
    const sorted = all.sort((a, b) => {
      const nivelA = parseInt(a.nivel || '999');
      const nivelB = parseInt(b.nivel || '999');
      if (nivelA !== nivelB) return nivelA - nivelB;
      return (b.progress || 0) - (a.progress || 0);
    });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error en ranking:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
