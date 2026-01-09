import { NextResponse, type NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number | string; isClub: boolean }

    if (!decoded.isClub) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const clubId = typeof decoded.id === "string" ? parseInt(decoded.id) : decoded.id

    const articulos = await prisma.articulo.findMany({
      where: { clubId },
      orderBy: {
        codigo: "asc",
      },
    })

    return NextResponse.json(articulos)
  } catch (error) {
    console.error("Error fetching articulos:", error)
    return NextResponse.json({ error: "Error al cargar los artículos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number | string; isClub: boolean }

    if (!decoded.isClub) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const clubId = typeof decoded.id === "string" ? parseInt(decoded.id) : decoded.id

    const body = await request.json()
    const { codigo, nombre, precioCompra, precioVenta, cantidadStock, tipo } = body

    if (!codigo || !nombre || precioCompra == null || precioVenta == null || cantidadStock == null || !tipo) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const articulo = await prisma.articulo.create({
      data: {
        codigo,
        nombre,
        precioCompra,
        precioVenta,
        cantidadStock,
        tipo,
        clubId,
      },
    })

    return NextResponse.json(articulo)
  } catch (error) {
    console.error("Error al crear artículo:", error)
    return NextResponse.json({ error: "Error al crear el artículo" }, { status: 500 })
  }
}
