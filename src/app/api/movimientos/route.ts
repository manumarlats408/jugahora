import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number | string; isClub: boolean }
    if (!decoded.isClub) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const clubId = typeof decoded.id === "string" ? parseInt(decoded.id) : decoded.id

    const { searchParams } = new URL(request.url)
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    const where: Prisma.MovimientoFinancieroWhereInput = {
      clubId,
    }

    if (desde || hasta) {
      where.fechaMovimiento = {}

      if (desde) {
        where.fechaMovimiento.gte = new Date(desde)
      }

      if (hasta) {
        where.fechaMovimiento.lte = new Date(hasta)
      }
    }

    const movimientos = await prisma.movimientoFinanciero.findMany({
      where,
      orderBy: { fechaMovimiento: "desc" },
    })

    return NextResponse.json(movimientos)
  } catch (error) {
    console.error("Error al obtener movimientos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number | string; isClub: boolean }
    if (!decoded.isClub) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const clubId = typeof decoded.id === "string" ? parseInt(decoded.id) : decoded.id

    const data = await request.json()

    if (!data.concepto || !data.fechaMovimiento || !data.metodoPago) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const nuevoMovimiento = await prisma.movimientoFinanciero.create({
      data: {
        concepto: data.concepto,
        jugador: data.jugador || null,
        cancha: data.cancha || null,
        fechaTurno: data.fechaTurno ? new Date(data.fechaTurno) : null,
        fechaMovimiento: new Date(data.fechaMovimiento),
        metodoPago: data.metodoPago,
        egreso: data.egreso ?? null,
        ingreso: data.ingreso ?? null,
        clubId,
      },
    })

    return NextResponse.json(nuevoMovimiento)
  } catch (error) {
    console.error("Error al crear movimiento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
