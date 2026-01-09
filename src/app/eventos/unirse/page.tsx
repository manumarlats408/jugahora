"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Menu,
  X,
  Home,
  User,
  Users,
  LogOut,
  Clock,
  MapPin,
  Search,
  DollarSign,
  Trophy,
  Hash,
  Plus
} from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Calendar } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as DatePickerCalendar} from "@/components/ui/calendar"
import { format } from "date-fns"


type Evento = {
  id: number
  nombre: string
  date: string
  startTime: string
  endTime: string
  tipo: string
  formato?: string
  categoria?: string
  genero: string
  maxParejas: number
  parejas: string[]
  inscripciones?: number[] // 👈 NUEVO
  price: number
  Club: {
    name: string
    address?: string
  }
}

type UserType = {
  id: number
  email: string
  firstName?: string
  lastName?: string
  name?: string
}

const elementosMenu = [
  { href: "/menu", etiqueta: "Menú", icono: Home },
  { href: "/perfil", etiqueta: "Perfil", icono: User },
  { href: "/reserva", etiqueta: "Reservar", icono: Calendar },
  { href: "/jugar", etiqueta: "Unirme a un partido", icono: Users },
  { href: "/crear-partido", etiqueta: "Crear un partido", icono: Plus },
  { href: "/eventos/unirse", etiqueta: "Unirse a un evento", icono: Trophy },
]

export default function PaginaEventos() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [filteredEventos, setFilteredEventos] = useState<Evento[]>([])
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [priceFilter, setPriceFilter] = useState<number>(0)
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(100)
  const [loadingEventos, setLoadingEventos] = useState<{ [key: number]: boolean }>({})
  const [loadingEventoDetails, setLoadingEventoDetails] = useState<{ [key: number]: boolean }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null)
  const [selectedEventoTipo, setSelectedEventoTipo] = useState<string | null>(null)
  const [joinedUsers, setJoinedUsers] = useState<string[]>([])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isInscripcionModalOpen, setIsInscripcionModalOpen] = useState(false)
  const [nombre1, setNombre1] = useState("")
  const [nombre2, setNombre2] = useState("")
  const referenciaMenu = useRef<HTMLDivElement>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const router = useRouter()

  const alternarMenu = () => setMenuAbierto(!menuAbierto)

  useEffect(() => {
    const fetchUserAndEventos = async () => {
      try {
        setIsLoading(true)
        const authResponse = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })

        if (authResponse.ok) {
          const userData = await authResponse.json()
          setUser(userData.entity)

          const eventosResponse = await fetch("/api/eventos", {
            method: "GET",
            credentials: "include",
          })

          if (eventosResponse.ok) {
            const eventosData = await eventosResponse.json()
            setEventos(eventosData)
            setFilteredEventos(eventosData)

            // Set min and max prices
            const prices = eventosData.map((evento: Evento) => evento.price)
            setMinPrice(Math.min(...prices, 0))
            setMaxPrice(Math.max(...prices, 1000))
            setPriceFilter(Math.max(...prices, 1000))
          } else {
            console.error("Error al obtener los eventos")
            toast.error("No se pudieron cargar los eventos")
          }
        } else {
          throw new Error("Failed to fetch user data")
        }
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error)
        toast.error("Error de autenticación")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndEventos()

    const manejarClicFuera = (evento: MouseEvent) => {
      if (referenciaMenu.current && !referenciaMenu.current.contains(evento.target as Node)) {
        setMenuAbierto(false)
      }
    }

    document.addEventListener("mousedown", manejarClicFuera)
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera)
    }
  }, [router])

  useEffect(() => {
    const filtered = eventos.filter((evento) => {
      const eventoDate = evento.date.split('T')[0]
      const matchesSearch =
        evento.Club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evento.Club.address && evento.Club.address.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDate = dateFilter === "" || eventoDate === dateFilter
      const matchesPrice = evento.price <= priceFilter

      return matchesSearch && matchesDate && matchesPrice
    })
    setFilteredEventos(filtered)
  }, [eventos, searchTerm, dateFilter, priceFilter])

  const manejarCierreSesion = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    }
  }

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

  const handleUnirseEvento = (eventoId: number) => {
    if (!user) {
      toast.error("Debes iniciar sesión para unirte a un evento")
      router.push("/login")
      return
    }
  
    const evento = eventos.find((e) => e.id === eventoId)
    if (!evento) return
  
    setSelectedEventoId(eventoId)
  
    if (evento.tipo === "torneo") {
      setNombre1("")
      setNombre2("")
      setIsInscripcionModalOpen(true) // Mostrar modal para torneos
    } else {
      // Enviar inscripción directa para cancha abierta
      confirmarInscripcionDirecta(eventoId)
    }
  }
  
  const confirmarInscripcionDirecta = async (eventoId: number) => {
    setLoadingEventos((prev) => ({ ...prev, [eventoId]: true }))
  
    try {
      const respuesta = await fetch(`/api/eventos/${eventoId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      })
  
      if (respuesta.ok) {
        const eventosActualizados = await fetch("/api/eventos", { credentials: "include" }).then((res) => res.json())
        setEventos(eventosActualizados)
        setFilteredEventos(eventosActualizados)
        toast.success("Inscripción exitosa!")
      } else {
        const errorData = await respuesta.json()
        toast.error(errorData.error || "Error al unirse al evento")
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error)
      toast.error("Error al conectar con el servidor")
    } finally {
      setLoadingEventos((prev) => ({ ...prev, [eventoId]: false }))
    }
  }
  
  const confirmarInscripcion = async () => {
    if (!nombre1 || !nombre2 || !selectedEventoId) {
      toast.error("Por favor completa los nombres de ambos jugadores")
      return
    }

    setLoadingEventos((prev) => ({ ...prev, [selectedEventoId]: true }))
    setIsInscripcionModalOpen(false)

    try {
      const respuesta = await fetch(`/api/eventos/${selectedEventoId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombrePareja1: nombre1, nombrePareja2: nombre2 }),
        credentials: "include",
      })

      if (respuesta.ok) {
        // Actualizar el estado local con la nueva pareja
        setEventos(
            eventos.map((evento) =>
              evento.id === selectedEventoId
                ? {
                    ...evento,
                    parejas: [...evento.parejas, `${nombre1}/${nombre2}`],
                    inscripciones: [...(evento.inscripciones || []), user!.id],
                  }
                : evento,
            )
          )
          
        toast.success("Pareja registrada exitosamente!")
      } else {
        const errorData = await respuesta.json()
        if (respuesta.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
          router.push("/login")
        } else {
          toast.error(errorData.error || "Error al unirse al evento")
        }
      }
    } catch (error) {
      console.error("Error al conectar con la API para unirse al evento:", error)
      toast.error("Error al conectar con el servidor")
    } finally {
      setLoadingEventos((prev) => ({ ...prev, [selectedEventoId]: false }))
    }
  }

  const handleCancelarInscripcion = (eventoId: number) => {
    setSelectedEventoId(eventoId)
    setIsDialogOpen(true)
  }

  const confirmarCancelacion = async () => {
    if (!selectedEventoId) return

    setLoadingEventos((prev) => ({ ...prev, [selectedEventoId]: true }))
    setIsDialogOpen(false)

    try {
      const respuesta = await fetch(`/api/eventos/${selectedEventoId}/cancel`, {
        method: "POST",
        credentials: "include",
      })

      if (respuesta.ok) {
        const refreshed = await fetch("/api/eventos", { credentials: "include" });
        if (refreshed.ok) {
          const eventosActualizados = await refreshed.json();
          setEventos(eventosActualizados);
          setFilteredEventos(eventosActualizados);
        }
        toast.success("Inscripción cancelada exitosamente!");
      }
       else {
        const errorData = await respuesta.json()
        if (respuesta.status === 401) {
          toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.")
          router.push("/login")
        } else {
          toast.error(errorData.error || "Error al cancelar la inscripción")
        }
      }
    } catch (error) {
      console.error("Error al conectar con la API para cancelar inscripción:", error)
      toast.error("Error al conectar con el servidor")
    } finally {
      setLoadingEventos((prev) => ({ ...prev, [selectedEventoId]: false }))
    }
  }

  const handleEventoClick = async (eventoId: number, tipo: string) => {
    setSelectedEventoId(eventoId)
    setSelectedEventoTipo(tipo)
    setLoadingEventoDetails((prev) => ({ ...prev, [eventoId]: true }))
  
    try {
      const response = await fetch(`/api/eventos/${eventoId}/parejas`)
      if (response.ok) {
        const parejas = await response.json()
        setJoinedUsers(parejas)
        setIsUserModalOpen(true)
      } else {
        console.error("Error al obtener las parejas del evento:", await response.text())
      }
    } catch (error) {
      console.error("Error al conectar con la API para obtener las parejas:", error)
    } finally {
      setLoadingEventoDetails((prev) => ({ ...prev, [eventoId]: false }))
    }
  }
  

  const isUserInscrito = (evento: Evento) => {
    if (!user) return false
    return evento.inscripciones?.includes(user?.id)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando eventos...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">
          No se pudo cargar la información del usuario. Por favor, inténtalo de nuevo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src="/logo.svg" alt="Logo de JugáHora" width={32} height={32} />
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
        <Card className="w-full max-w-4xl mx-auto shadow-lg border border-brand-border">
          <CardHeader className="bg-white border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Unirse a un evento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-600">
              Bienvenido, {user.firstName || user.name}. Elige un evento y únete para participar!
            </p>

            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search" className="mb-2 block">
                    Buscar
                  </Label>
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
                        setDateFilter("")
                      }}
                      className="px-2"
                    >
                      Borrar
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="price" className="mb-2 block">
                    Precio máximo
                  </Label>
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
              {filteredEventos.map((evento) => {
                const userInscrito = isUserInscrito(evento)
                return (
                  <div
                    key={evento.id}
                    className="relative flex items-center justify-between p-4 border border-brand-border rounded-lg hover:bg-brand-bg transition-colors duration-300 cursor-pointer"

                    onClick={() => handleEventoClick(evento.id, evento.tipo)}

                  >
                    <div>
                      <p className="font-semibold text-gray-800">{evento.nombre}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatearFecha(evento.date)}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {evento.startTime} - {evento.endTime}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {evento.Club.name} {evento.Club.address ? `- ${evento.Club.address}` : ""}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Trophy className="w-4 h-4 mr-1" />
                        {evento.categoria ? `Nivel ${evento.categoria}` : "Todos los niveles"} ({evento.genero})
                      </p>
                      
                      <p className="text-sm text-gray-500 flex items-center">
                        <Hash className="w-4 h-4 mr-1" />
                        {evento.tipo === "torneo" ? `Torneo (${evento.formato || "Estándar"})` : "Cancha Abierta"}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {evento.parejas.length}/{evento.maxParejas} {evento.tipo === "cancha_abierta" ? "personas" : "parejas"}
                      </p>

                      <p className="text-sm text-green-600 font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />${evento.price}
                      </p>
                      <p className="text-sm text-blue-700">
                        Clickea en la tarjeta del partido para ver los jugadores que ya están unidos!
                      </p>
                    </div>

                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {userInscrito ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelarInscripcion(evento.id)
                          }}
                          disabled={loadingEventos[evento.id]}
                          className="min-w-[100px] bg-red-600 hover:bg-red-700"
                        >
                          {loadingEventos[evento.id] ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Cancelando...
                            </span>
                          ) : (
                            "Cancelar"
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnirseEvento(evento.id)
                          }}
                          disabled={evento.parejas.length >= evento.maxParejas || loadingEventos[evento.id]}
                          className="min-w-[100px]"
                        >
                          {loadingEventos[evento.id] ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Inscribiendo...
                            </span>
                          ) : evento.parejas.length >= evento.maxParejas ? (
                            "Completo"
                          ) : (
                            "Inscribirse"
                          )}
                        </Button>
                      )}
                    </div>

                    {loadingEventoDetails[evento.id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-lg">
                        <svg
                          className="animate-spin h-5 w-5 text-brand-primary"

                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredEventos.length === 0 && (
                <p className="text-center text-gray-500">
                  No se encontraron eventos que coincidan con los criterios de búsqueda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Link href="/menu">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100 text-brand-primary border-brand-primary hover:border-brand-hover transition-colors duration-300"
            >
              Volver al menú
            </Button>

          </Link>
        </div>
      </main>

      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">© 2024 JugáHora. Todos los derechos reservados.</p>
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

      {/* Modal de confirmación para cancelar inscripción */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelación de inscripción</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cancelar tu inscripción a este evento? Dependiendo de la política del club, es
              posible que recibas una penalización.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Volver
            </Button>
            <Button onClick={confirmarCancelacion} className="bg-red-600 hover:bg-red-700">
              Confirmar cancelación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver parejas inscritas */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedEventoTipo === "torneo" ? "Parejas Inscritas" : "Personas Inscritas"}</DialogTitle>
        </DialogHeader>
          <div className="py-4">
            {joinedUsers.length > 0 ? (
              <ul className="space-y-2">
                {joinedUsers.map((pareja, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{pareja}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No hay parejas inscritas a este evento.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUserModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para inscribir pareja */}
      <Dialog open={isInscripcionModalOpen} onOpenChange={setIsInscripcionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscribí tu pareja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="nombre1">Nombre jugador 1</Label>
              <Input
                id="nombre1"
                placeholder="Nombre jugador 1"
                value={nombre1}
                onChange={(e) => setNombre1(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="nombre2">Nombre jugador 2</Label>
              <Input
                id="nombre2"
                placeholder="Nombre jugador 2"
                value={nombre2}
                onChange={(e) => setNombre2(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsInscripcionModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarInscripcion}>Confirmar inscripción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

