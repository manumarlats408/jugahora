import { Prisma, MovimientoFinanciero } from '@prisma/client'
import { prisma } from '@/lib/prisma' // o desde donde tengas tu instancia

export async function obtenerMovimientosFinancieros(desde?: string, hasta?: string): Promise<MovimientoFinanciero[]> {
  const where: Prisma.MovimientoFinancieroWhereInput = {}

  if (desde) {
    where.fechaMovimiento = {
      ...(typeof where.fechaMovimiento === 'object' ? where.fechaMovimiento : {}),
      gte: new Date(desde),
    }
  }

  if (hasta) {
    where.fechaMovimiento = {
      ...(typeof where.fechaMovimiento === 'object' ? where.fechaMovimiento : {}),
      lte: new Date(hasta),
    }
  }

  return await prisma.movimientoFinanciero.findMany({
    where,
    orderBy: { fechaMovimiento: 'desc' },
  })
}
