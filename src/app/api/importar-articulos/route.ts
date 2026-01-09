import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import * as XLSX from "xlsx"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

interface ExcelRow {
  Código?: string
  Nombre?: string
  "Precio Compra"?: number | string
  "Precio Venta"?: number | string
  Tipo?: string
  "Cantidad Stock"?: number | string
  "Cantidad en Stock"?: number | string // ✅ AÑADIR ESTA LÍNEA
  cantidadStock?: number | string // Añadimos el nombre exacto que aparece en el Excel
  Stock?: number | string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("archivo") as File

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 })
    }

    const token = request.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1]

    if (!token) {
      return NextResponse.json({ error: "No autorizado: falta token" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string | number; isClub: boolean }
    const clubId = typeof decoded.id === "string" ? Number.parseInt(decoded.id) : decoded.id

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    // Convertir a JSON y mostrar las primeras filas para depuración
    const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]
    console.log("Primeras 3 filas del Excel:", JSON.stringify(data.slice(0, 3), null, 2))

    // Mostrar los nombres de las columnas para depuración
    if (data.length > 0) {
      console.log("Nombres de columnas en el Excel:", Object.keys(data[0]).join(", "))
    }

    for (const row of data) {
      // Verificar qué columna de stock está presente, probando todas las variantes posibles
      const stockValue =
      row["Cantidad en Stock"] !== undefined
        ? row["Cantidad en Stock"]
        : row.cantidadStock !== undefined
          ? row.cantidadStock
          : row["Cantidad Stock"] !== undefined
            ? row["Cantidad Stock"]
            : row.Stock !== undefined
              ? row.Stock
              : 0


      // Convertir a número de manera más segura
      let cantidadStock = 0
      if (stockValue !== undefined && stockValue !== null && stockValue !== "") {
        // Si es string, intentar convertir a número
        if (typeof stockValue === "string") {
          // Limpiar el string (quitar espacios, comas, etc.)
          const cleanedValue = stockValue.replace(/,/g, ".").trim()
          cantidadStock = Number.parseFloat(cleanedValue) || 0
        } else {
          cantidadStock = Number(stockValue) || 0
        }
      }

      console.log(
        `Procesando artículo: ${row["Código"]} - Stock original: ${stockValue}, Stock convertido: ${cantidadStock}`,
      )

      const articulo = {
        codigo: row["Código"]?.toString().trim() || "",
        nombre: row["Nombre"]?.toString().trim() || "",
        precioCompra: Number(row["Precio Compra"]) || 0,
        precioVenta: Number(row["Precio Venta"]) || 0,
        tipo: row["Tipo"] === "Ambos" ? "Ambos" : "Venta",
        cantidadStock: cantidadStock,
        clubId,
      }

      console.log("Guardando artículo:", JSON.stringify(articulo, null, 2))

      const existente = await prisma.articulo.findFirst({
        where: {
          codigo: articulo.codigo,
          clubId,
        },
      })

      if (existente) {
        await prisma.articulo.update({
          where: { id: existente.id },
          data: articulo,
        })
      } else {
        await prisma.articulo.create({
          data: articulo,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al importar:", error)
    return NextResponse.json({ error: "Error al importar los artículos" }, { status: 500 })
  }
}
