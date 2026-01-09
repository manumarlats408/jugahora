// app/api/admin/create-club/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'jugahora.manu.pato.2025';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, email, password, phoneNumber, address } = await request.json();

    const existing = await prisma.club.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ error: 'Ya existe un club con ese email' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const newClub = await prisma.club.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        address,
      },
    });

    return NextResponse.json({ message: 'Club creado correctamente', club: newClub }, { status: 201 });
  } catch (error) {
    console.error('Error al crear el club:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
