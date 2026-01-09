import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventoId = parseInt(params.id)
    const token = cookies().get('token')?.value
    const userId = await verifyAuth(token)

    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const evento = await prisma.evento_club.findUnique({ where: { id: eventoId } })
    if (!evento) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

    let nuevasParejas: string[] = []

    if (evento.tipo === "torneo") {
      if (!user.firstName) {
        return NextResponse.json({ error: 'El usuario no tiene nombre registrado' }, { status: 400 })
      }

      nuevasParejas = evento.parejas.filter((p) => !p.includes(user.firstName!))
    } else {
      // Cancha abierta → se guarda el userId como string
      nuevasParejas = evento.parejas.filter((p) => p !== String(userId))
    }


    const inscripciones = Array.isArray(evento.inscripciones)
      ? (evento.inscripciones as number[])
      : []

    const nuevasInscripciones = inscripciones.filter((id) => id !== userId)

    const eventoActualizado = await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        parejas: nuevasParejas,
        inscripciones: nuevasInscripciones,
      },
    })

    return NextResponse.json(eventoActualizado)
  } catch (error) {
    console.error('Error al cancelar inscripción:', error)
    return NextResponse.json({ error: 'Error al cancelar inscripción' }, { status: 500 })
  }
}
