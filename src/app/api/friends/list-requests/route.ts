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

    // Obtener solicitudes de amistad
    const requests = await prisma.friend.findMany({
      where: { 
        receiver: { id: userId },
        status: "pending"
      },
      include: {
        sender: true,
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
