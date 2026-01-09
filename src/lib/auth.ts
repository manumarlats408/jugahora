// lib/auth.ts

import jwt from 'jsonwebtoken';

export async function verifyAuth(token: string | undefined): Promise<number | null> {
  console.log('Iniciando verifyAuth');

  if (!token) {
    console.log('No se encontró token de autenticación');
    return null;
  }

  try {
    console.log('Verificando token con JWT_SECRET:', process.env.JWT_SECRET?.slice(0, 5));
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    console.log('Token decodificado:', decoded); // Confirm the payload structure
    return decoded.id; // Use `id` instead of `userId`
  } catch (error) {
    console.error('Error al verificar token:', error);
    return null;
  }
}
