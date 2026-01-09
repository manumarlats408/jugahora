import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventoId = parseInt(params.id)

    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
      select: { parejas: true, tipo: true },
    })

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    }

    const resultados = await Promise.all(
      evento.parejas.map(async (pareja, i) => {
        // Si es torneo, dejamos el formato "1) Jugador 1 - Jugador 2"
        if (evento.tipo === "torneo") {
          const [j1, j2] = pareja.split('/')
          if (!j1 || !j2) {
            return `${i + 1}) ${pareja}`
          }
          return `${i + 1}) ${j1.trim()} - ${j2.trim()}`
        }

        // Si es cancha abierta, interpretamos como userId y buscamos el nombre
        const userId = parseInt(pareja)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true },
        })

        const nombre = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : `Usuario ${userId}`
        return `${i + 1}) ${nombre}`
      })
    )

    return NextResponse.json(resultados)
  } catch (error) {
    console.error('Error al obtener parejas del evento:', error)
    return NextResponse.json({ error: 'Error al obtener parejas' }, { status: 500 })
  }
}
