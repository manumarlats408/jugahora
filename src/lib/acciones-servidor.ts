"use server"

import { revalidatePath } from "next/cache"
import { actualizarArticuloDB } from "@/lib/db"
import type { Articulo } from "@/lib/tipos"

export async function actualizarArticulo(articulo: Articulo) {
  try {
    await actualizarArticuloDB(articulo.id, articulo)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar artículo:", error)
    return { success: false, error: "Error al actualizar el artículo" }
  }
}
