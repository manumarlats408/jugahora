import { prisma } from "./prisma"
import type { Articulo } from "@/lib/tipos"

export async function actualizarArticuloDB(id: number, datos: Articulo) {
  return await prisma.articulo.update({
    where: { id },
    data: {
      codigo: datos.codigo,
      nombre: datos.nombre,
      precioCompra: datos.precioCompra,
      precioVenta: datos.precioVenta,
      tipo: datos.tipo,
      cantidadStock: datos.cantidadStock,
      updatedAt: new Date(),
      clubId: datos.clubId,
    },
  })
}

export async function crearArticulo(data: Omit<Articulo, "id">) {
  return await prisma.articulo.create({
    data: {
      ...data,
      cantidadStock: data.cantidadStock,
      updatedAt: new Date(),
    },
  })
}
