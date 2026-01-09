"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/layout/sidebar"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

type PartidoConfirmado = {
  id: number
  date: string
  startTime: string
  endTime: string
  court: string
  price: number
  usuarios: number[]
}

export default function PartidosConfirmados() {
  const [partidos, setPartidos] = useState<PartidoConfirmado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const cargarPartidos = async () => {
      try {
        const auth = await fetch("/api/auth", { credentials: "include" })
        if (!auth.ok) throw new Error("No autorizado")
        const { entity } = await auth.json()
        const res = await fetch(`/api/partidos-confirmados?clubId=${entity.id}`)
        const data = await res.json()
        setPartidos(data)
      } catch (error) {
        console.error("Error al cargar partidos confirmados:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    cargarPartidos()
  }, [router])

  const formatearFecha = (fechaStr: string) => {
    const [a, m, d] = fechaStr.split("T")[0].split("-")
    return `${d}/${m}/${a}`
  }

  const filteredPartidos = partidos.filter(
    (p) =>
      formatearFecha(p.date).includes(searchTerm.toLowerCase()) ||
      p.court.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-muted-foreground text-lg">Cargando partidos confirmados...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 p-4 pt-20 md:pt-6 md:ml-16 space-y-6 overflow-x-hidden">

        <Card>
          <CardHeader>
            <CardTitle>Partidos Confirmados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar por fecha o cancha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />

            {filteredPartidos.length > 0 ? (
              filteredPartidos.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col md:flex-row justify-between md:items-center border p-4 rounded-md hover:bg-brand-soft transition"
                >
                  <div className="mb-2 md:mb-0">
                    <p className="font-semibold text-foreground">
                      {formatearFecha(p.date)} | {p.startTime} - {p.endTime} hs
                    </p>
                    <p className="text-sm text-muted-foreground">Cancha: {p.court}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">${p.price}</p>
                    <p className="flex items-center text-sm text-muted-foreground justify-end">
                      <Users className="h-4 w-4 mr-1" /> {p.usuarios.length} jugadores
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-6">No hay partidos confirmados registrados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
