"use client"

import { useEffect, useState } from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"


type User = {
  id: number
  firstName: string
  lastName: string
  email: string
}

export function AbonadosDashboard() {
  const [clubId, setClubId] = useState<number | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [abonados, setAbonados] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const authRes = await fetch("/api/auth", { credentials: "include" })
        if (!authRes.ok) throw new Error("No autorizado")
        const authData = await authRes.json()
        const clubId = authData.entity.id
        setClubId(clubId)
  
        const [usersRes, abonadosRes] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/abonados?clubId=${clubId}`)
        ])
  
        const users = await usersRes.json()
        const abonados = await abonadosRes.json()
        setAllUsers(users)
        setAbonados(abonados)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
  
    cargarTodo()
  }, [router])
  

  const handleAgregar = async (userId: number) => {
    setLoadingUserId(userId)
    const res = await fetch("/api/abonados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, userId }),
    })
    if (res.ok) {
      const newUser = allUsers.find((u) => u.id === userId)
      setAbonados([...abonados, newUser!])
      toast.success("Jugador agregado")
    }
    setLoadingUserId(null)
  }

  const handleEliminar = async (userId: number) => {
    setLoadingUserId(userId)
    const res = await fetch(`/api/abonados?clubId=${clubId}&userId=${userId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setAbonados(abonados.filter((u) => u.id !== userId))
      toast.success("Jugador eliminado")
    }
    setLoadingUserId(null)
  }

  const abonadosIds = abonados.map((u) => u.id)
  const filteredUsers = allUsers
    .filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (abonadosIds.includes(b.id) ? 1 : -1))

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando jugadores abonados...</p>
      </div>
    )
  }
      

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 p-4 pt-20 md:pt-6 md:p-6 md:ml-16 space-y-6 overflow-x-hidden">

        <Card>
          <CardHeader>
            <CardTitle>Gestionar Jugadores Abonados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar jugador por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border p-4 rounded-md hover:bg-brand-bg transition space-y-2 sm:space-y-0"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-brand-primary" />
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex justify-end sm:justify-start">
                  {abonadosIds.includes(user.id) ? (
                    <Button
                      variant="destructive"
                      disabled={loadingUserId === user.id}
                      onClick={() => handleEliminar(user.id)}
                      className="w-full sm:w-auto"
                    >
                      {loadingUserId === user.id ? (
                        <span className="flex items-center gap-2">
                          <span className="loader"></span> Quitando...
                        </span>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Quitar
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      disabled={loadingUserId === user.id}
                      onClick={() => handleAgregar(user.id)}
                      className="w-full sm:w-auto"
                    >
                      {loadingUserId === user.id ? (
                        <span className="flex items-center gap-2">
                          <span className="loader"></span> Agregando...
                        </span>
                      ) : (
                        "Agregar"
                      )}
                    </Button>
                  )}
                </div>
              </div>

            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
