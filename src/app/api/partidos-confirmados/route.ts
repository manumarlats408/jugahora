import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const clubId = searchParams.get('clubId')

    if (!clubId) {
      return NextResponse.json({ message: 'clubId es requerido' }, { status: 400 })
    }

    const partidos = await prisma.partidosConfirmados.findMany({
      where: {
        clubId: parseInt(clubId, 10),
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(partidos)
  } catch (error) {
    console.error('❌ Error al obtener partidos confirmados:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}
