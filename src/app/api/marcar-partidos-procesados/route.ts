import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const { userId } = await request.json();

    // Actualizar partidos como procesados
    await prisma.partidos.updateMany({
      where: {
        userId: parseInt(userId),
        procesado: false, // Solo marcar los no procesados
      },
      data: {
        procesado: true,
      },
    });

    return NextResponse.json({ message: 'Partidos procesados exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al marcar partidos como procesados:', error);
    return NextResponse.json({ error: 'Error al marcar partidos como procesados' }, { status: 500 });
  }
}
