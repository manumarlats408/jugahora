import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    // Extraer el token de las cookies
    const cookieHeader = req.headers.get('Cookie');
    const token = cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: "No autorizado: Token no encontrado." }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ message: "ID de usuario no válido." }, { status: 401 });
    }


    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ message: "ID de la solicitud requerido." }, { status: 400 });
    }

    // Buscar la solicitud pendiente
    const request = await prisma.friend.findUnique({
      where: { id: requestId, status: "pending" },
    });

    if (!request) {
      return NextResponse.json({ message: "Solicitud no encontrada." }, { status: 404 });
    }

    // Verificar si la relación ya existe
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: request.userId, friendId: request.friendId, status: "accepted" },
          { userId: request.friendId, friendId: request.userId, status: "accepted" },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ message: "La amistad ya existe." }, { status: 400 });
    }

    // Crear la relación de amistad
    await prisma.friend.createMany({
      data: [
        { userId: request.userId, friendId: request.friendId, status: "accepted" },
        { userId: request.friendId, friendId: request.userId, status: "accepted" },
      ],
    });

    // Eliminar la solicitud pendiente
    await prisma.friend.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: "Solicitud aceptada con éxito." }, { status: 200 });
  } catch (error) {
    console.error("Error al aceptar solicitud:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
