import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  const logs: string[] = []
  const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000) // UTC-3
  logs.push(`🕒 Hora actual ARG (UTC-3): ${now.toISOString()}`)

  try {
    // Buscar todos los partidos
    const partidos = await prisma.partidos_club.findMany({
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        court: true,
        players: true,
        usuarios: true,
        clubId: true,
        price: true,
        categoria: true,
        genero: true,
        userId: true,
      },
    })

    logs.push(`📦 Total partidos encontrados: ${partidos.length}`)

    // Filtrar los partidos vencidos (por fecha y hora)
    const partidosVencidos = partidos.filter((partido) => {
      const [hh, mm] = (partido.startTime || '00:00').split(':')
      const fechaPartido = new Date(`${partido.date.toISOString().split('T')[0]}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`)
      return fechaPartido < now
    })

    logs.push(`🧹 Partidos vencidos: ${partidosVencidos.length}`)
    logs.push(`📝 IDs vencidos: ${partidosVencidos.map(p => p.id).join(', ')}`)

    // Filtrar partidos con 4 jugadores
    const partidosCompletos = partidosVencidos.filter((p) => p.players === 4)
    logs.push(`✅ Partidos con 4 jugadores: ${partidosCompletos.length}`)

    for (const partido of partidosCompletos) {
      logs.push(`➡️ Procesando partido ${partido.id}...`)

      try {
        // Guardar partido en tabla confirmados
        const confirmado = await prisma.partidosConfirmados.upsert({
          where: { matchId: partido.id },
          create: {
            matchId: partido.id,
            date: partido.date,
            startTime: partido.startTime,
            endTime: partido.endTime,
            court: partido.court,
            usuarios: partido.usuarios,
            clubId: partido.clubId,
            price: partido.price,
            categoria: partido.categoria,
            genero: partido.genero,
            userId: partido.userId ?? null,
          },
          update: {
            date: partido.date,
            startTime: partido.startTime,
            endTime: partido.endTime,
            court: partido.court,
            usuarios: partido.usuarios,
            clubId: partido.clubId,
            price: partido.price,
            categoria: partido.categoria,
            genero: partido.genero,
            userId: partido.userId ?? null,
          },
        })

        logs.push(`✅ Partido confirmado guardado: ID ${confirmado.id}, matchId: ${confirmado.matchId}`)

        // Incrementar partidosAgregar a cada jugador
        for (const userId of partido.usuarios) {
          try {
            logs.push(`🔁 A punto de incrementar partidosAgregar para usuarios: ${partido.usuarios.join(', ')}`);
            await prisma.user.update({
              where: { id: userId },
              data: { partidosAgregar: { increment: 1 } },
            })
            logs.push(`🔼 partidosAgregar +1 para userId=${userId}`)
          } catch (err) {
            logs.push(`❌ Error al actualizar userId=${userId}: ${err}`)
          }
        }

      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : JSON.stringify(error)
        logs.push(`❌ Error al guardar partido ${partido.id}: ${msg}`)
      }
    }

    // Eliminar los partidos vencidos (independientemente de si estaban llenos o no)
    const idsAEliminar = partidosVencidos.map(p => p.id)
    if (idsAEliminar.length > 0) {
      await prisma.partidos_club.deleteMany({
        where: { id: { in: idsAEliminar } },
      })
      logs.push(`🗑️ Partidos eliminados: ${idsAEliminar.length}`)
    } else {
      logs.push(`⚠️ No había partidos para eliminar`)
    }

    console.log(logs.join('\n'))
    return NextResponse.json({ eliminados: idsAEliminar.length, logs })
  } catch (error) {
    console.error('❌ Error general en cleanup:', error)
    return NextResponse.json({ error: 'Error al eliminar partidos pasados' }, { status: 500 })
  }
}
