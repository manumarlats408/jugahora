import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const token = req.headers
  .get("cookie")
  ?.split("; ")
  .find((c) => c.startsWith("token="))
  ?.split("=")[1]

if (!token) {
  return new Response(JSON.stringify({ error: "No autorizado: falta token" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  })
}

const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string | number; isClub: boolean }
if (!decoded.isClub) {
  return new Response(JSON.stringify({ error: "No autorizado" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  })
}

const clubId = typeof decoded.id === "string" ? parseInt(decoded.id) : decoded.id


    const articulos = await prisma.articulo.findMany({
      where: { clubId },
      orderBy: { codigo: "asc" },
    })

    const worksheet = XLSX.utils.json_to_sheet(
      articulos.map((articulo) => ({
        Código: articulo.codigo,
        Nombre: articulo.nombre,
        "Precio Compra": articulo.precioCompra,
        "Precio Venta": articulo.precioVenta,
        Tipo: articulo.tipo,
        "Cantidad en Stock": articulo.cantidadStock,

      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articulos")

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=articulos.xlsx",
      },
    })
  } catch (error) {
    console.error("Error al exportar artículos:", error)
    return new Response(JSON.stringify({ error: "Error al exportar los artículos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
