import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { userId, progress, nivel } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        progress,
        nivel,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar progreso del usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar progreso del usuario' }, { status: 500 });
  }
}
