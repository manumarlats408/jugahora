'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Menu, X, Home, User, Users, LogOut, Clock, MapPin, Hash, Search, DollarSign, Trophy, Plus, VenetianMask  } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Dialog, DialogContent, DialogHeader,  DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Calendar} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar"




type Match = {
  id: number
  date: string
  startTime: string
  endTime: string  
  court: string
  players: number
  maxPlayers: number
  nombreClub: string
  clubId: number
  price: number
  direccionClub: string
  usuarios: number[]
  categoria: string
  genero: string
}

type User = {
  id: number
  email: string
  firstName?: string
  lastName?: string
  name?: string
  preferredSide?: string
}

const elementosMenu = [
  { href: '/menu', etiqueta: 'Menú', icono: Home },
  { href: '/perfil', etiqueta: 'Perfil', icono: User },
  { href: '/reserva', etiqueta: 'Reservar', icono: Calendar },
  { href: '/jugar', etiqueta: 'Unirme a un partido', icono: Users },
  { href: "/crear-partido", etiqueta: "Crear un partido", icono: Plus },
  { href: '/eventos/unirse', etiqueta: 'Unirme a un evento', icono: Trophy },
]

export default function PaginaJuega() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState<number>(0)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(100)
  const [loadingMatches, setLoadingMatches] = useState<{ [key: number]: boolean }>({})
  const [loadingMatchDetails, setLoadingMatchDetails] = useState<{ [key: number]: boolean }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [joinedUsers, setJoinedUsers] = useState<User[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const alternarMenu = () => setMenuAbierto(!menuAbierto)

  useEffect(() => {
    const fetchUserAndMatches = async () => {
      try {
        setIsLoading(true)
        const authResponse = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })

        if (authResponse.ok) {
          const userData = await authResponse.json()
          setUser(userData.entity)

          const matchesResponse = await fetch('/api/matches', {
            method: 'GET',
            credentials: 'include',
          })

          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            setMatches(matchesData)
            setFilteredMatches(matchesData)

            // Set min and max prices
            const prices = matchesData.map((match: Match) => match.price)
            setMinPrice(Math.min(...prices))
            setMaxPrice(Math.max(...prices))
            setPriceFilter(Math.max(...prices))
          } else {
            console.error('Error al obtener los partidos')
            toast.error('No se pudieron cargar los partidos')
          }
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error)
        toast.error('Error de autenticación')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndMatches()

    const manejarClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClicFuera)
    return () => {
      document.removeEventListener('mousedown', manejarClicFuera)
    }
  }, [router])

  useEffect(() => {
    const filtered = matches.filter((match) => {
      const matchDate = match.date.split('T')[0]  // Cambiado de new Date(match.date).toISOString().split('T')[0]
      const matchesSearch =
        match.nombreClub.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.direccionClub.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = dateFilter === "" || matchDate === dateFilter
      const matchesPrice = match.price <= priceFilter
  
      return matchesSearch && matchesDate && matchesPrice
    })
    setFilteredMatches(filtered)
  }, [matches, searchTerm, dateFilter, priceFilter])

  const manejarCierreSesion = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  const manejarUnirsePartido = async (idPartido: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión para unirte a un partido')
      router.push('/login')
      return
    }

    setLoadingMatches(prev => ({ ...prev, [idPartido]: true }));

    try {
      const respuesta = await fetch(`/api/matches/${idPartido}/join`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (respuesta.ok) {
        const updatedMatch = await respuesta.json()
        setMatches(matches.map(match =>
          match.id === idPartido
            ? { ...match, ...updatedMatch }
            : match
        ))
        toast.success('Te has unido al partido exitosamente!')
      } else {
        const errorData = await respuesta.json()
        if (respuesta.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
          router.push('/login')
        } else {
          toast.error(errorData.error || 'Error al unirse al partido')
        }
      }
    } catch (error) {
      console.error('Error al conectar con la API para unirse al partido:', error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setLoadingMatches(prev => ({ ...prev, [idPartido]: false }));
    }
  }

  const manejarRetirarsePartido = async (idPartido: number) => {
    if (!user) {
      toast.error('Debes iniciar sesión para retirarte de un partido');
      router.push('/login');
      return;
    }
  
    setLoadingMatches(prev => ({ ...prev, [idPartido]: true }));
  
    try {
      const respuesta = await fetch(`/api/matches/${idPartido}/leave`, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (respuesta.ok) {
        const updatedMatch = await respuesta.json();
        setMatches(matches.map(match =>
          match.id === idPartido ? { ...match, players: updatedMatch.players, usuarios: match.usuarios.filter(userId => userId !== user.id) } : match
        ));
        toast.success('Te has retirado del partido exitosamente!');
      } else {
        const errorData = await respuesta.json();
        if (respuesta.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          router.push('/login');
        } else {
          toast.error(errorData.error || 'Error al retirarse del partido');
        }
      }
    } catch (error) {
      console.error('Error al conectar con la API para retirarse del partido:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoadingMatches(prev => ({ ...prev, [idPartido]: false }));
    }
  };

  // Función para formatear la fecha correctamente sin desfase
  const formatearFecha = (fechaString: string) => {
    // Parsear la fecha sin aplicar zona horaria
    const partes = fechaString.split('T')[0].split('-');
    if (partes.length !== 3) return fechaString;
    
    const año = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const dia = parseInt(partes[2]);
    
    // Crear fecha local sin conversión de zona horaria
    return `${dia}/${mes}/${año}`;
  };

  const obtenerTipoDeCancha = (clubId: number, court: string) => {
    const canchaNum = parseInt(court)
    if (isNaN(canchaNum)) return ''
  
    if (clubId === 3) {
      if (canchaNum >= 1 && canchaNum <= 9) return 'Techada'
      if (canchaNum === 10 || canchaNum === 11) return 'Destechada'
    }
  
    // Agregá más condiciones por club si querés
  
    return '' // Desconocido o no especificado
  }  

  const handleMatchClick = async (matchId: number) => {
    setLoadingMatchDetails(prev => ({ ...prev, [matchId]: true }))
    try {
      const response = await fetch(`/api/matches/${matchId}/users`)
      if (response.ok) {
        const users = await response.json()
        setJoinedUsers(users)
        setIsUserModalOpen(true)
      } else {
        console.error('Error al obtener los usuarios del partido:', await response.text())
      }
    } catch (error) {
      console.error('Error al conectar con la API para obtener los usuarios:', error)
    } finally {
      setLoadingMatchDetails(prev => ({ ...prev, [matchId]: false }))
    }
  }
  
  
  const handleRetirarse = (idPartido: number) => {
    setSelectedMatchId(idPartido);
    setIsDialogOpen(true);
  };

  const confirmarRetirarse = () => {
    if (selectedMatchId !== null) {
      manejarRetirarsePartido(selectedMatchId);
    }
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando partidos...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">No se pudo cargar la información del usuario. Por favor, inténtalo de nuevo.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="Logo de JugáHora" width={32} height={32} /> 
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {elementosMenu.map((elemento) => (
            <Link
              key={elemento.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
              href={elemento.href}
            >
              <elemento.icono className="w-4 h-4 mr-2" />
              {elemento.etiqueta}
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
        <Card className="w-full max-w-4xl mx-auto shadow-lg border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Unirse a un partido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-600">Bienvenido, {user.firstName || user.name}. Elige un partido y únete para jugar!</p>
            
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search" className="mb-2 block">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Buscar por club o dirección"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="date" className="mb-2 block">Fecha</Label>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !selectedDate ? "text-muted-foreground" : ""
                          }`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DatePickerCalendar
                          mode="single"
                          selected={selectedDate || undefined}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date)
                              setDateFilter(date.toISOString().split("T")[0])
                            } else {
                              setSelectedDate(null)
                              setDateFilter('')
                            }
                          }}
                          showOutsideDays={false}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDate(null)
                        setDateFilter('')
                      }}
                      className="px-2"
                    >
                      Borrar
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="price" className="mb-2 block">Precio máximo</Label>
                  <div className="space-y-4">
                    <Slider
                      id="price"
                      min={minPrice}
                      max={maxPrice}
                      step={1}
                      value={[priceFilter]}
                      onValueChange={(value: number[]) => setPriceFilter(value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">${minPrice}</span>
                      <span className="text-lg font-semibold text-green-600">${priceFilter}</span>
                      <span className="text-sm text-gray-500">${maxPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredMatches.map((match) => {
                const isUserJoined = match.usuarios.includes(user?.id);
                return (
                  <div
                    key={match.id}
                    className="relative flex items-center justify-between p-4 border border-brand-border rounded-lg hover:bg-brand-bg transition-colors duration-300 cursor-pointer"
                    onClick={() => handleMatchClick(match.id)}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{match.nombreClub}</p>
                      {match.players === 0 && (
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          🎯 Si sos el primer jugador, el partido se ajustará a tu categoría y género.
                        </p>
                      )}
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatearFecha(match.date)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {match.startTime} - {match.endTime}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {match.direccionClub}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Hash className="w-4 h-4 mr-1" />
                        Cancha: {match.court}
                        <span className="ml-2 italic">({obtenerTipoDeCancha(match.clubId, match.court)})</span>
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {match.players}/{match.maxPlayers} jugadores
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {match.price} en total
                      </p>
                      <p className="text-sm text-gray-500 italic">* El total se abona en persona en el club.</p>
                      {match.players > 0 && match.categoria && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <Trophy className="w-4 h-4 mr-1" />
                          Categoria : {match.categoria}
                        </p>   
                      )}
                      {match.players > 0 && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <VenetianMask className="w-4 h-4 mr-1" />
                          Género: {match.genero === 'Masculino' ? 'Masculino' : match.genero === 'Femenino' ? 'Femenino' : 'Mixto'}
                        </p>
                      )}
                      <p className="text-sm text-blue-700">
                        Clickea en la tarjeta del partido para ver los jugadores que ya están unidos y conocer sus preferencias de lado!
                      </p>
                    </div>

                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {isUserJoined ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Detiene la propagación del clic
                            handleRetirarse(match.id);
                          }}
                          disabled={loadingMatches[match.id]}
                          className="min-w-[100px] bg-red-600 hover:bg-red-700"
                        >
                          {loadingMatches[match.id] ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Retirándose...
                            </span>
                          ) : (
                            'Retirarse'
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation(); // Detiene la propagación del clic
                            manejarUnirsePartido(match.id);
                          }}
                          disabled={match.players >= match.maxPlayers || loadingMatches[match.id]}
                          className="min-w-[100px]"
                        >
                          {loadingMatches[match.id] ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Uniéndose...
                            </span>
                          ) : match.players >= match.maxPlayers ? (
                            'Completo'
                          ) : (
                            'Unirse'
                          )}
                        </Button>
                      )}
                    </div>

                    {loadingMatchDetails[match.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
                        <svg
                          className="animate-spin h-5 w-5 text-brand-primary" 
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredMatches.length === 0 && (
                <p className="text-center text-gray-500">No se encontraron partidos que coincidan con los criterios de búsqueda.</p>
              )}
            </div>


          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Link href="/menu">
            <Button variant="outline" className="bg-white hover:bg-gray-100 text-brand-primary border-brand-primary hover:border-brand-hover transition-colors duration-300">
              Volver al menú
            </Button>
          </Link>
        </div>
      </main>

      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © 2024 JugáHora. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/terminos">
              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/privacidad">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar retiro del partido</DialogTitle>
            <DialogDescription>
              Atención: Si te retiras del partido en las 12 horas previas a la hora de inicio del partido, podrías recibir una penalización.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmarRetirarse}>Confirmar retiro</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Usuarios unidos al partido</DialogTitle>
            <DialogDescription>
              Lista de jugadores unidos al partido y sus preferencias de lado
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {joinedUsers.length > 0 ? (
              <ul className="space-y-3">
                {joinedUsers.map((user) => (
                  <li key={user.id} className="flex items-start p-2 border border-gray-100 rounded-md hover:bg-gray-50">
                    <Users className="h-5 w-5 text-brand-primary mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">{`${user.firstName || ''} ${user.lastName || ''}`}</span>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <span className="font-medium mr-1">Preferencia de lado:</span> 
                          {user.preferredSide}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No hay usuarios unidos a este partido.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUserModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}