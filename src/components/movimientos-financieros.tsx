"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Calendar } from "lucide-react"
import type { MovimientoFinanciero } from "@/lib/tipos"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/layout/sidebar"
import AgregarMovimientoDialog from "./agregar-movimiento-dialog"
import { useRouter } from "next/navigation"

export default function MovimientosFinancieros() {
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([])
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [isLoading, setIsLoading] = useState(true) // ✅ loader global
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  const fetchMovimientos = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (desde) params.append("desde", desde)
      if (hasta) params.append("hasta", hasta)

      const res = await fetch(`/api/movimientos?${params.toString()}`)
      const data = await res.json()
      setMovimientos(data)
    } finally {
      setIsLoading(false)
    }
  }, [desde, hasta])

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const res = await fetch("/api/auth", { credentials: "include" })
        if (!res.ok) throw new Error("No autorizado")
        setIsAuthorized(true)
      } catch {
        router.push("/login")
      }
    }

    verificarAuth()
  }, [router])

  useEffect(() => {
    if (isAuthorized) {
      fetchMovimientos()
    }
  }, [isAuthorized, fetchMovimientos])

  const totalEfectivo = movimientos
    .filter((m) => m.metodoPago === "Efectivo")
    .reduce((s, m) => s + ((m.ingreso || 0) - (m.egreso || 0)), 0)

  const totalTransferencia = movimientos
    .filter((m) => m.metodoPago === "Transferencia")
    .reduce((s, m) => s + ((m.ingreso || 0) - (m.egreso || 0)), 0)

  const saldoTotal = totalEfectivo + totalTransferencia

  const formatearFecha = (fechaString: string) => {
    const partes = fechaString.split("T")[0].split("-")
    if (partes.length !== 3) return fechaString
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando movimientos...</p>
      </div>
    )
  }

  



  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 md:ml-16 p-3 sm:p-4 md:p-6 space-y-6 overflow-x-hidden">
        <div className="bg-white rounded-lg shadow-sm w-full">
          <div className="p-4 md:p-6 border-b">
            <h1 className="text-2xl md:text-3xl font-bold mt-10 md:mt-0">Movimientos financieros</h1>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              Consulta todos los movimientos financieros del complejo deportivo
            </p>
          </div>
  
          <div className="p-4 md:p-6">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  className="pl-10 bg-white"
                  placeholder="Buscar por concepto o jugador"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
  
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 whitespace-nowrap">Desde</span>
                  <div className="relative">
                    <Input
                      type="date"
                      value={desde}
                      onChange={(e) => setDesde(e.target.value)}
                      className="pr-10 bg-white"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
  
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 whitespace-nowrap">Hasta</span>
                  <div className="relative">
                    <Input
                      type="date"
                      value={hasta}
                      onChange={(e) => setHasta(e.target.value)}
                      className="pr-10 bg-white"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
  
                <AgregarMovimientoDialog onSuccess={fetchMovimientos} />
              </div>
            </div>
  
            <div className="overflow-x-auto border rounded-lg max-h-[360px] overflow-y-auto">
            <table className="w-full table-auto">

                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left font-medium text-gray-500">Concepto</th>
                    <th className="py-3 text-left font-medium text-gray-500">Jugador</th>
                    <th className="py-3 text-left font-medium text-gray-500">Cancha</th>
                    <th className="py-3 text-left font-medium text-gray-500">Fecha de turno</th>
                    <th className="py-3 text-left font-medium text-gray-500">Fecha movimiento</th>
                    <th className="py-3 text-left font-medium text-gray-500">Método de pago</th>
                    <th className="py-3 text-left font-medium text-gray-500">Egreso</th>
                    <th className="py-3 text-left font-medium text-gray-500">Ingreso</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.length > 0 ? (
                    movimientos.map((m) => (
                      <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">{m.concepto}</td>
                        <td className="py-3">{m.jugador || "-"}</td>
                        <td className="py-3">{m.cancha || "-"}</td>
                        <td className="py-3">{m.fechaTurno ? formatearFecha(m.fechaTurno) : "-"}</td>
                        <td className="py-3">{formatearFecha(m.fechaMovimiento)}</td>
                        <td className="py-3">{m.metodoPago}</td>
                        <td className="py-3 text-red-600">{m.egreso ? `$${m.egreso.toFixed(2)}` : "-"}</td>
                        <td className="py-3 text-green-600">{m.ingreso ? `$${m.ingreso.toFixed(2)}` : "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 bg-gray-50">
                        No se encontraron movimientos en el período seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-gray-500 mb-1">Efectivo</div>
                <div className="text-2xl font-semibold">$ {totalEfectivo.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-gray-500 mb-1">Transferencia</div>
                <div className="text-2xl font-semibold">$ {totalTransferencia.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="text-gray-500 mb-1">Saldo</div>
                <div className="text-2xl font-semibold">$ {saldoTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
}
