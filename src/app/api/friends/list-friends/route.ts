import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // Extraer el token de las cookies
    const cookieHeader = req.headers.get('Cookie');
    const token = cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    console.log("Token extraído de cookies:", token);

    if (!token) {
      return NextResponse.json({ message: "No autorizado: Token no encontrado." }, { status: 401 });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    console.log("Token decodificado:", decoded);

    const userId = decoded.id;

    // Obtener amigos donde el usuario es parte de la relación
    const friends = await prisma.friend.findMany({
      where: {
        status: "accepted",
        OR: [
          { userId: userId },  // El usuario envió la solicitud
          { friendId: userId } // El usuario recibió la solicitud
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            nivel: true,
            progress: true,
            phoneNumber: true,
            age: true,
            preferredSide: true,
            weaknesses : true,
            strengths : true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            nivel: true,
            progress: true,
            phoneNumber: true,
            age: true,
            preferredSide: true,
            weaknesses : true,
            strengths : true,
          },
        },
      },      
    });

    // Formatear la lista de amigos
    const friendList = friends.map((friend) => {
      if (friend.userId === userId) {
        return friend.receiver; // Si el usuario envió la solicitud, el amigo es "receiver"
      } else {
        return friend.sender; // Si el usuario recibió la solicitud, el amigo es "sender"
      }
    });

    console.log("Lista de amigos obtenida:", friendList);

    return NextResponse.json(friendList, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la lista de amigos:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
