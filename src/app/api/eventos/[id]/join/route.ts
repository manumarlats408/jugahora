// /api/eventos/[id]/join/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventoId = parseInt(params.id)
    const token = cookies().get("token")?.value
    const userId = await verifyAuth(token)

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { nombrePareja1, nombrePareja2 } = body

    const evento = await prisma.evento_club.findUnique({
      where: { id: eventoId },
    })

    if (!evento) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    const inscripciones = Array.isArray(evento.inscripciones)
      ? (evento.inscripciones as number[])
      : []

    if (inscripciones.includes(userId)) {
      return NextResponse.json({ error: "Ya estás inscripto en este evento" }, { status: 400 })
    }

    const nuevasParejas = [...evento.parejas]

    if (evento.tipo === "torneo") {
      if (!nombrePareja1 || !nombrePareja2) {
        return NextResponse.json({ error: "Debes ingresar ambos nombres para un torneo" }, { status: 400 })
      }
      nuevasParejas.push(`${nombrePareja1}/${nombrePareja2}`)
    } else {
      // Evento de cancha abierta → solo un jugador se inscribe
      nuevasParejas.push(`${userId}`)
    }

    if (evento.maxParejas && nuevasParejas.length > evento.maxParejas) {
      return NextResponse.json({ error: "El evento ya está completo" }, { status: 400 })
    }

    await prisma.evento_club.update({
      where: { id: eventoId },
      data: {
        parejas: nuevasParejas,
        inscripciones: [...inscripciones, userId],
      },
    })

    return NextResponse.json({ message: "Inscripción exitosa" })
  } catch (error) {
    console.error("Error al registrar inscripción:", error)
    return NextResponse.json({ error: "Error interno al inscribirse al evento" }, { status: 500 })
  }
}
