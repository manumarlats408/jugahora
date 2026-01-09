import { formatearPrecio } from "@/lib/utils"

interface ResumenSaldosProps {
  totalEfectivo: number
  totalTransferencia: number
  saldoTotal: number
}

export function ResumenSaldos({ totalEfectivo, totalTransferencia, saldoTotal }: ResumenSaldosProps) {
  return (
    <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
      <div className="bg-gray-100 rounded-md p-4 text-center min-w-[180px]">
        <div className="text-gray-500 mb-1">Efectivo</div>
        <div className="text-xl font-semibold">{formatearPrecio(totalEfectivo)}</div>
      </div>

      <div className="bg-gray-100 rounded-md p-4 text-center min-w-[180px]">
        <div className="text-gray-500 mb-1">Transferencia</div>
        <div className="text-xl font-semibold">{formatearPrecio(totalTransferencia)}</div>
      </div>

      <div className="bg-gray-50 border rounded-md p-4 text-center min-w-[180px]">
        <div className="text-gray-500 mb-1">Saldo</div>
        <div className="text-2xl font-bold">{formatearPrecio(saldoTotal)}</div>
      </div>
    </div>
  )
}

