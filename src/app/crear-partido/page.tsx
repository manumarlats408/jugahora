'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSelector } from '@/components/ui/time-selector'
import { Home, User, Calendar, Users, Trophy, LogOut, Edit, Trash2, Hash, Clock, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { Menu, X } from 'lucide-react'
import { useRef } from 'react'



const elementosMenu = [
  { href: '/menu', etiqueta: 'Menú', icono: Home },
  { href: '/perfil', etiqueta: 'Perfil', icono: User },
  { href: '/reserva', etiqueta: 'Reservar', icono: Calendar },
  { href: '/jugar', etiqueta: 'Unirme a un partido', icono: Users },
  { href: '/crear-partido', etiqueta: 'Crear un partido', icono: Plus },
  { href: '/eventos/unirse', etiqueta: 'Unirme a un evento', icono: Trophy },
]

type Club = {
  id: number
  name: string
}

type Match = {
  id: number
  date: string
  startTime: string
  endTime: string
  court: string
  players: number
  price: number
  clubId: number
  Club: {
    name: string
    address?: string
  }
}

export default function CrearPartidoJugador() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedClubId, setSelectedClubId] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [court, setCourt] = useState('')
  const [price, setPrice] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [misPartidos, setMisPartidos] = useState<Match[]>([])
  const [editMatch, setEditMatch] = useState<Match | null>(null)
  const [isSavingMatch, setIsSavingMatch] = useState(false)
  const [isSavingEditMatch, setIsSavingEditMatch] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const [verifying, setVerifying] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const res = await fetch("/api/auth", { credentials: "include" })
        if (!res.ok) throw new Error("No autorizado")
      } catch {
        router.push("/login")
      } finally {
        setVerifying(false)
      }
    }
  
    verificarAuth()
  }, [router])

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true)
      try {
        const storedPlayers = sessionStorage.getItem('finalPlayers')
        if (storedPlayers) setSelectedPlayers(JSON.parse(storedPlayers))
  
        const storedData = sessionStorage.getItem('formData')
        if (storedData) {
          const data = JSON.parse(storedData)
          setSelectedClubId(data.selectedClubId)
          setDate(data.date ? new Date(data.date) : null)
          setStartTime(data.startTime)
          setEndTime(data.endTime)
          setCourt(data.court)
          setPrice(data.price)
        }
  
        const [clubsRes, userRes] = await Promise.all([
          fetch('/api/clubs'),
          fetch('/api/auth', { method: 'GET', credentials: 'include' }),
        ])
  
        const clubsData = await clubsRes.json()
        setClubs(clubsData)

        console.log("Clubes recibidos desde la API:", clubsData)
  
        if (userRes.ok) {
          const userData = await userRes.json()
          setUserId(userData.entity.id)
  
          const matchesRes = await fetch(`/api/matches?userId=${userData.entity.id}`)
          const matchesData = await matchesRes.json()
          setMisPartidos(matchesData)
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchInitialData()
  }, [])

  const formatearFecha = (fechaString: string) => {
    const partes = fechaString.split("T")[0].split("-")
    if (partes.length !== 3) return fechaString
  
    const año = partes[0]
    const mes = partes[1]
    const dia = partes[2]
  
    return `${dia}/${mes}/${año}`
  }  
  
  const guardarFormularioEnSession = () => {
    sessionStorage.setItem('formData', JSON.stringify({
      selectedClubId,
      date: date?.toISOString() || '',
      startTime,
      endTime,
      court,
      price
    }))
  }

  const handleDeleteMatch = async (id: number) => {
    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMisPartidos((prev) => prev.filter((m) => m.id !== id))
        toast.success('Partido eliminado con éxito')
      } else {
        toast.error('Error al eliminar el partido')
      }      
    } catch (error) {
      console.error('Error al eliminar partido:', error)
    }
  }
  
  const handleSaveEdit = async () => {
    if (!editMatch) return
    setIsSavingEditMatch(true)
    try {
      const res = await fetch(`/api/matches/${editMatch.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMatch),
      })
      if (res.ok) {
        const updated = await res.json()
        setMisPartidos((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        setEditMatch(null)
        toast.success('Partido actualizado con éxito')
      } else {
        toast.error('Error al actualizar el partido')
      }
      
    } catch (error) {
      console.error('Error al actualizar partido:', error)
    } finally {
      setIsSavingEditMatch(false)
    }
  }
  

  const handleSubmit = async () => {
    if (!selectedClubId || !date || !startTime || !endTime || !court || !price || !userId) {
      toast.error('Por favor completá todos los campos')
      return
    }
    setIsSavingMatch(true)
    guardarFormularioEnSession()
    
    try {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date.toISOString(),
        startTime,
        endTime,
        court,
        price: parseFloat(price),
        clubId: parseInt(selectedClubId),
        userId,
        players: selectedPlayers,
      }),
    })
  
    const data = await res.json()
  
    if (res.ok) {
      toast.success('Partido creado con éxito')
      sessionStorage.removeItem('formData')
      sessionStorage.removeItem('finalPlayers')
      router.push('/jugar')
    } else {
      toast.error(data.error || 'Error al crear el partido')
    } 
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setIsSavingMatch(false)
  }
}

  

  const handleAddPlayersRedirect = () => {
    if (!selectedClubId || !date || !startTime || !endTime || !court || !price) {
      toast.error('Por favor completá todos los campos antes de añadir jugadores')
      return
    }
    

    guardarFormularioEnSession()
    router.push('/add-players')
  }

  const alternarMenu = () => setMenuAbierto(!menuAbierto)

  useEffect(() => {
    const manejarClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClicFuera)
    return () => {
      document.removeEventListener('mousedown', manejarClicFuera)
    }
  }, [])


  const manejarCierreSesion = async () => {
    try {
      await fetch('/api/logout', { method: 'GET', credentials: 'include' })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando tus partidos...</p>
      </div>
    )
  }

  if (verifying) return null
  
  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      {/* TOPBAR */}
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <Image src='/logo.svg' alt="Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold text-black">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {elementosMenu.map((el) => (
            <Link
              key={el.href}
              href={el.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
            >
              <el.icono className="w-4 h-4 mr-2" />
              {el.etiqueta}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
            onClick={manejarCierreSesion}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-brand-primary"
          onClick={alternarMenu}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
        >
          {menuAbierto ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {menuAbierto && (
        <div
          ref={referenciaMenu}
          className="lg:hidden absolute top-16 right-0 left-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
        >
          <nav className="py-2">
            {elementosMenu.map((elemento) => (
              <Link
                key={elemento.href}
                href={elemento.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMenuAbierto(false)}
              >
                <elemento.icono className="w-4 h-4 mr-2" />
                {elemento.etiqueta}
              </Link>
            ))}
            <button
              onClick={manejarCierreSesion}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}

      <main className="flex-1 p-4 bg-brand-page">
      {misPartidos.length > 0 && (
        <Card className="w-full max-w-xl mx-auto mb-10 shadow-md border border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary">Mis partidos creados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            {misPartidos.map((match) => (
              <div
                key={match.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-brand-border rounded-lg hover:bg-brand-soft transition-colors duration-300"

              >
                <div>
                  <p className="font-semibold text-gray-800">{match.Club?.name || 'Club'}</p>
                  <div className="grid grid-cols-2 gap-1 text-sm text-gray-500">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatearFecha(match.date)}
                    </p>
                    <p className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {match.startTime} - {match.endTime}
                    </p>
                    <p className="flex items-center">
                      <Hash className="w-4 h-4 mr-1" />
                      Cancha: {match.court}
                    </p>
                    <p className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {match.players}/4
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-primary">${match.price}</span>
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <Button variant="outline" size="icon" onClick={() => setEditMatch(match)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteMatch(match.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

        <Card className="w-full max-w-xl mx-auto shadow-md border border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center">
              <Plus className="w-6 h-6 mr-2" />
              Crear Partido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
          <p className="mb-4 text-gray-600">
            Como jugador abonado podés crear partidos, sumar a tus amigos ya confirmados y dejar el resto de los lugares disponibles para que otros jugadores de la app se sumen.
          </p>
            <div>
              <Label>Club</Label>
              <select
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Seleccioná un club</option>
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <Label>Hora de Inicio</Label>
              <TimeSelector id="startTime" value={startTime} onChange={setStartTime} />
            </div>

            <div>
              <Label>Hora de Fin</Label>
              <TimeSelector id="endTime" value={endTime} onChange={setEndTime} />
            </div>

            <div>
              <Label>Cancha</Label>
              <Input
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="Ej: 5"
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <Label>Precio</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej: 44000"
                className="w-full border rounded p-2"
              />
            </div>

            <Button onClick={handleAddPlayersRedirect} className="w-full mt-4">
              Añadir Jugadores
            </Button>

            <div className="pt-4">
            <Button onClick={handleSubmit} disabled={isSavingMatch} className="w-full min-w-[140px] bg-brand-primary text-white hover:bg-brand-hover">
              {isSavingMatch ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 3.042 
                      1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando...
                </span>
              ) : (
                "Crear Partido"
              )}
            </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/menu">
            <Button variant="outline" className="bg-white hover:bg-gray-100 text-brand-primary border-brand-primary hover:border-brand-hover">
              Volver al menú
            </Button>
          </Link>
        </div>
        
        {editMatch && (
          <Dialog open={!!editMatch} onOpenChange={(open) => !open && setEditMatch(null)}>
            <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-auto">
              <DialogHeader>
                <DialogTitle>Editar Partido</DialogTitle>
                <DialogDescription>
                  Modificá los detalles del partido y guardá los cambios.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="date" className="sm:text-right">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    className="col-span-1 sm:col-span-3"
                    value={editMatch ? new Date(editMatch.date).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEditMatch((prev) =>
                        prev ? { ...prev, date: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="startTime" className="sm:text-right">Hora de Inicio</Label>
                  <TimeSelector
                    id="startTime"
                    value={editMatch?.startTime || ""}
                    onChange={(val) =>
                      setEditMatch((prev) =>
                        prev ? { ...prev, startTime: val } : prev
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="endTime" className="sm:text-right">Hora de Fin</Label>
                  <TimeSelector
                    id="endTime"
                    value={editMatch?.endTime || ""}
                    onChange={(val) =>
                      setEditMatch((prev) =>
                        prev ? { ...prev, endTime: val } : prev
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="court" className="sm:text-right">Cancha</Label>
                  <Input
                    id="court"
                    className="col-span-1 sm:col-span-3"
                    value={editMatch?.court || ""}
                    onChange={(e) =>
                      setEditMatch((prev) =>
                        prev ? { ...prev, court: e.target.value } : prev
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="price" className="sm:text-right">Precio</Label>
                  <Input
                    id="price"
                    type="text"
                    className="col-span-1 sm:col-span-3"
                    value={editMatch?.price?.toString() || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      setEditMatch((prev) =>
                        prev ? { ...prev, price: parseFloat(value) || 0 } : prev
                      )
                    }}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={isSavingEditMatch}>
                {isSavingEditMatch ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                        5.291A7.962 7.962 0 014 12H0c0 3.042 
                        1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © 2024 JugáHora. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs text-gray-600 hover:text-brand-primary transition-colors" href="/terminos">
              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-600 hover:text-brand-primary transition-colors" href="/privacidad">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
