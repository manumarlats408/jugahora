import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma';



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fecha, jugadores, resultado, ganado } = body;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { partidosAgregar: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.partidosAgregar <= 0) {
      return NextResponse.json({ error: 'No tenés partidos disponibles para registrar' }, { status: 403 });
    }

    // Crear el nuevo partido
    const newPartido = await prisma.partidos.create({
      data: {
        userId: parseInt(userId),
        fecha: new Date(fecha),
        jugadores,
        resultado,
        ganado: !!ganado,
      },
    });

    // Restar 1 a partidosAgregar
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        partidosAgregar: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json(newPartido, { status: 201 });
  } catch (error) {
    console.error('Error al crear nuevo partido:', error);
    return NextResponse.json({ error: 'Error al crear nuevo partido' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId es requerido' }, { status: 400 })
    }

    const partidos = await prisma.partidos.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        fecha: 'desc',
      },
    })

    return NextResponse.json(partidos)
  } catch (error) {
    console.error('Error al obtener partidos:', error)
    return NextResponse.json({ error: 'Error al obtener partidos' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}