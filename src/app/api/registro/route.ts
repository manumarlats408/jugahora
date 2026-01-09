import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password, firstName, lastName, phoneNumber, address, age, nivel, genero } = await request.json();

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
  }

  const hashedPassword = await hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        address: address || null,
        age: parseInt(age as string),
        nivel: nivel || null,
        genero, // 👈 nuevo campo requerido
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error al registrar:', error);
    return NextResponse.json({ error: 'Ocurrió un error al registrar' }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  const { email, nivel,  preferredSide, strengths, weaknesses } = await request.json();

  if (!nivel) {
    return NextResponse.json({ error: 'El nivel es obligatorio' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        nivel,
        progress: 50, // Asignar un progreso inicial del 50%
        preferredSide,
        strengths: strengths.split(',').map((s: string) => s.trim()),
        weaknesses: weaknesses.split(',').map((s: string) => s.trim()),
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return NextResponse.json({ error: 'Ocurrió un error al actualizar el perfil' }, { status: 500 });
  }
}

