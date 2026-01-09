// src/app/components/TablaMovimientosFinancieros.tsx
"use client"

import { useEffect, useState } from "react"
import { MovimientoFinanciero } from "@/lib/tipos"

export default function TablaMovimientosFinancieros({ clubId }: { clubId: number }) {
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([])
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchMovimientos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ clubId: clubId.toString() })
      if (desde) params.append("desde", desde)
      if (hasta) params.append("hasta", hasta)

      const res = await fetch(`/api/movimientos?${params.toString()}`)
      const data = await res.json()
      setMovimientos(data)
    } catch (err) {
      console.error("Error al obtener movimientos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovimientos()
  }, [desde, hasta])

  const totalIngreso = movimientos.reduce((sum, m) => sum + (m.ingreso || 0), 0)
  const totalEgreso = movimientos.reduce((sum, m) => sum + (m.egreso || 0), 0)

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <h2 className="text-xl font-bold mb-4">Movimientos Financieros</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="border rounded px-2 py-1" />
        </div>
      </div>

      {loading ? (
        <p className="text-sm">Cargando movimientos...</p>
      ) : (
        <div>
          <table className="w-full table-auto text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Fecha</th>
                <th className="border px-2 py-1">Concepto</th>
                <th className="border px-2 py-1">Jugador</th>
                <th className="border px-2 py-1">Ingreso</th>
                <th className="border px-2 py-1">Egreso</th>
                <th className="border px-2 py-1">Método</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td className="border px-2 py-1">{new Date(m.fechaMovimiento).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{m.concepto}</td>
                  <td className="border px-2 py-1">{m.jugador || "-"}</td>
                  <td className="border px-2 py-1 text-green-600">{m.ingreso ? `$${m.ingreso}` : "-"}</td>
                  <td className="border px-2 py-1 text-red-600">{m.egreso ? `$${m.egreso}` : "-"}</td>
                  <td className="border px-2 py-1">{m.metodoPago}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between font-semibold">
            <div>Total Ingresos: <span className="text-green-600">${totalIngreso}</span></div>
            <div>Total Egresos: <span className="text-red-600">${totalEgreso}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
