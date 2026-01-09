import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();

    if (!requestId) {
      return NextResponse.json({ message: "ID de la solicitud requerido." }, { status: 400 });
    }

    // Elimina la solicitud de amistad
    await prisma.friend.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: "Solicitud rechazada." }, { status: 200 });
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    return NextResponse.json({ message: "Error interno del servidor." }, { status: 500 });
  }
}
