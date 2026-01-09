import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    const articulo = await prisma.articulo.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(articulo)
  } catch (error) {
    console.error("Error updating articulo:", error)
    return NextResponse.json({ error: "Error al actualizar el artículo" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    await prisma.articulo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting articulo:", error)
    return NextResponse.json({ error: "Error al eliminar el artículo" }, { status: 500 })
  }
}

