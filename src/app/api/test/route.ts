// src/app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ mensaje: 'Ruta de prueba funcionando' });
}
