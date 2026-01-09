import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: number;
}

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded.userId !== 'number') {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error);
    return NextResponse.json({ error: 'Ocurrió un error al restablecer la contraseña' }, { status: 500 });
  }
}