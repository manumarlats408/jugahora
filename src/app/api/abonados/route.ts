import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: listar todos los abonados de un club
export async function GET(req: NextRequest) {
  const clubId = Number(req.nextUrl.searchParams.get("clubId"))
  if (!clubId) return NextResponse.json({ error: "Falta clubId" }, { status: 400 })

  try {
    const abonados = await prisma.jugadorAbonado.findMany({
      where: { clubId },
      include: { User: true },
    })
    return NextResponse.json(abonados.map((a) => a.User))
  } catch (error) {
    console.error("Error en la API de abonados:", error)
    return NextResponse.json({ error: "Error al obtener jugadores abonados" }, { status: 500 })
  }
}

// POST: agregar jugador abonado
export async function POST(req: NextRequest) {
  const { clubId, userId } = await req.json()

  if (!clubId || !userId) {
    return NextResponse.json({ error: "Faltan clubId o userId" }, { status: 400 })
  }

  try {
    const creado = await prisma.jugadorAbonado.create({
      data: { clubId, userId },
    })
    return NextResponse.json(creado)
  } catch (error) {
    console.error("Error en la API de abonados:", error)
    return NextResponse.json({ error: "Error al agregar jugador abonado" }, { status: 500 })
  }
}

// DELETE: eliminar jugador abonado
export async function DELETE(req: NextRequest) {
  const clubId = Number(req.nextUrl.searchParams.get("clubId"))
  const userId = Number(req.nextUrl.searchParams.get("userId"))

  if (!clubId || !userId) {
    return NextResponse.json({ error: "Faltan clubId o userId" }, { status: 400 })
  }

  try {
    await prisma.jugadorAbonado.delete({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API de abonados:", error)
    return NextResponse.json({ error: "Error al eliminar jugador abonado" }, { status: 500 })
  }
}
