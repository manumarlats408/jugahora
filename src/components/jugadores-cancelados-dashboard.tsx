"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"

type JugadorCancelado = {
  id: number
  userId: number
  clubId: number
  cantidadCancelaciones: number
  ultimaCancelacion: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export function JugadoresCanceladosDashboard() {
  const [jugadores, setJugadores] = useState<JugadorCancelado[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const authRes = await fetch("/api/auth", { credentials: "include" })
        if (!authRes.ok) throw new Error("No autorizado")
        const { entity } = await authRes.json()

        const res = await fetch(`/api/jugadores-cancelados?clubId=${entity.id}`)
        if (!res.ok) throw new Error("Error al cargar jugadores")

        const data = await res.json()
        setJugadores(data)
      } catch (err) {
        console.error(err)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJugadores()
  }, [router])

  const jugadoresFiltrados = jugadores.filter((j) =>
    `${j.user.firstName} ${j.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando jugadores cancelados...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 p-4 pt-20 md:pt-6 md:p-6 md:ml-16 space-y-6 overflow-x-hidden">
        <Card>
          <CardHeader>
            <CardTitle>Jugadores con Cancelaciones Tardías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar jugador por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {jugadoresFiltrados.length > 0 ? (
              jugadoresFiltrados.map((j) => (
                <div
                  key={j.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border p-4 rounded-md hover:bg-red-50 transition space-y-2 sm:space-y-0"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-red-700" />
                    <div>
                      <p className="font-semibold">{j.user.firstName} {j.user.lastName}</p>
                      <p className="text-sm text-gray-500">{j.user.email}</p>
                      <p className="text-sm text-red-600">Cancelaciones: {j.cantidadCancelaciones}</p>
                      <p className="text-xs text-gray-400">Última: {new Date(j.ultimaCancelacion).toLocaleString("es-AR")}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No hay jugadores registrados con cancelaciones tardías</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
