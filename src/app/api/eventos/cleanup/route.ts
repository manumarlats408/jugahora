import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000) // UTC-3
    const logs: string[] = []

    logs.push(`🕒 Hora actual ARG (UTC-3): ${now.toISOString()}`)

    const eventos = await prisma.evento_club.findMany()

    const eventosParaBorrar = eventos.filter((evento) => {
      const fecha = evento.date.toISOString().split("T")[0]
      const fin = evento.endTime || "00:00"
      const [hh, mm] = fin.split(":")
      const endDate = new Date(`${fecha}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`)

      return endDate < now
    })

    const idsAEliminar = eventosParaBorrar.map(e => e.id)

    if (idsAEliminar.length > 0) {
      await prisma.evento_club.deleteMany({
        where: { id: { in: idsAEliminar } },
      })
    }

    logs.push(`🗑️ Eventos eliminados: ${idsAEliminar.length}`)
    console.log(logs.join('\n'))

    return NextResponse.json({ eliminados: idsAEliminar.length, logs })
  } catch (error) {
    console.error('❌ Error al eliminar eventos pasados:', error)
    return NextResponse.json({ error: 'Error al eliminar eventos pasados' }, { status: 500 })
  }
}
