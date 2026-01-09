"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Obtener todos los movimientos de un club
export async function obtenerMovimientosPorClub(clubId: number) {
  return await prisma.movimientoFinanciero.findMany({
    where: { clubId },
    orderBy: { fechaMovimiento: "desc" },
  })
}

// Crear un nuevo movimiento financiero
export async function crearMovimientoFinanciero(data: {
  concepto: string
  jugador?: string | null
  cancha?: string | null
  fechaTurno?: Date | null
  fechaMovimiento: Date
  metodoPago: "Efectivo" | "Transferencia" | "Tarjeta"
  egreso?: number | null
  ingreso?: number | null
  clubId: number
}) {
  const nuevoMovimiento = await prisma.movimientoFinanciero.create({
    data,
  })

  revalidatePath("/club-dashboard") // Revalida la caché si usás `fetch` cacheado
  return nuevoMovimiento
}
