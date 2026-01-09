"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatearPrecio } from "@/lib/utils"
import Link from "next/link"
import { CalendarIcon, Package, DollarSign, Trophy, UserCheck, CheckCircle, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Articulo, MovimientoFinanciero, Partido, Club, Evento } from "@/lib/tipos"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[]>([])
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [partidosConfirmados, setPartidosConfirmados] = useState<Partido[]>([])
  const [jugadoresCancelados, setJugadoresCancelados] = useState<number>(0)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [clubData, setClubData] = useState<Club | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [cantidadAbonados, setCantidadAbonados] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(true)

        // Autenticación - verificar si el usuario está logueado
        const authResponse = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })

        if (!authResponse.ok) {
          // Si no está autenticado, redirigir al login
          console.error("Error de autenticación")
          router.push("/login")
          return // Detener la carga de datos
        }

        // Usuario autenticado, obtener datos
        const userData = await authResponse.json()
        setUserName(userData.entity.firstName || userData.entity.name)
        setClubData(userData.entity)

        // Solo cargar el resto de los datos si el usuario está autenticado
        if (userData.entity?.id) {
          // Cargar partidos
          const partidosResponse = await fetch(`/api/matches?clubId=${userData.entity.id}`, {
            credentials: "include",
          })
          if (partidosResponse.ok) {
            const partidosData = await partidosResponse.json()
            setPartidos(partidosData)
          }

          // Cargar eventos
          const eventosResponse = await fetch(`/api/eventos?clubId=${userData.entity.id}`, {
            credentials: "include",
          })
          if (eventosResponse.ok) {
            const eventosData = await eventosResponse.json()
            setEventos(eventosData)
          }
        }

        // Cargar artículos
        const articulosResponse = await fetch("/api/articulos", {
          credentials: "include", // Asegurar que se envían las cookies
        })
        if (articulosResponse.ok) {
          const articulosData = await articulosResponse.json()
          setArticulos(articulosData)
        }

        const abonadosRes = await fetch(`/api/abonados?clubId=${userData.entity.id}`, {
          credentials: "include",
        })
        if (abonadosRes.ok) {
          const abonados = await abonadosRes.json()
          setCantidadAbonados(abonados.length)
        }      

        // Cargar movimientos financieros
        const fechaDesde = new Date()
        fechaDesde.setDate(fechaDesde.getDate() - 7)
        const fechaHasta = new Date()

        const movimientosResponse = await fetch(
          `/api/movimientos?desde=${fechaDesde.toISOString().split("T")[0]}&hasta=${fechaHasta.toISOString().split("T")[0]}`,
          { credentials: "include" },
        )
        if (movimientosResponse.ok) {
          const movimientosData = await movimientosResponse.json()
          setMovimientos(movimientosData)
        }

        // Fetch partidos confirmados
        const confirmadosResponse = await fetch(`/api/partidos-confirmados?clubId=${userData.entity.id}`, {
          credentials: "include",
        })
        if (confirmadosResponse.ok) {
          const confirmadosData = await confirmadosResponse.json()
          setPartidosConfirmados(confirmadosData)
        }

        // Cargar jugadores cancelados
        const canceladosRes = await fetch(`/api/jugadores-cancelados?clubId=${userData.entity.id}`, {
          credentials: "include",
        })
        if (canceladosRes.ok) {
          const canceladosData = await canceladosRes.json()
          setJugadoresCancelados(canceladosData.length)
        }

      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
        router.push("/login") // Redirigir en caso de error
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [router])

  const formatearFecha = (fechaString: string) => {
    const partes = fechaString.split("T")[0].split("-")
    if (partes.length !== 3) return fechaString
    const año = partes[0]
    const mes = partes[1]
    const dia = partes[2]
    return `${dia}/${mes}/${año}`
  }

  // const handleLogout = async () => {
  //   try {
  //     await fetch("/api/logout", {
  //       method: "GET",
  //       credentials: "include",
  //     })
  //     router.push("/")
  //   } catch (error) {
  //     console.error("Error al cerrar sesión:", error)
  //   }
  // }

  // Estadísticas
  // const articulosInactivos = articulos.filter((a) => a.cantidadStock === 0).length
  const totalIngresos = movimientos.reduce((total, m) => total + (m.ingreso || 0), 0)
  const totalEgresos = movimientos.reduce((total, m) => total + (m.egreso || 0), 0)
  const saldoNeto = totalIngresos - totalEgresos
  const partidosProximos = partidos.length

  // Si está cargando, mostrar pantalla de carga
  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Cargando información del dashboard...</p>
      </div>
    )
  }

  // Si llegamos a este punto y no hay nombre de usuario, redirigir al login
  if (!userName) {
    router.push("/login")
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-3 md:p-6 md:ml-16 space-y-6 overflow-x-hidden">
        <main className="flex-1 p-2 md:p-6 space-y-4 md:space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold mt-10 md:mt-0">Dashboard {clubData?.name ? `de ${clubData.name}` : ""}</h1>
          {/* <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button> */}
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* 👉 Partidos */}
          <Link href="/partidos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Partidos Próximos</CardTitle>
                <CalendarIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partidosProximos}</div>
                <p className="text-xs text-muted-foreground">
                  {partidosProximos === 1 ? "partido programado" : "partidos programados"}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* 👉 Partidos Confirmados */}
          <Link href="/partidos-confirmados">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Partidos Confirmados</CardTitle>
                <CheckCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partidosConfirmados.length}</div>
                <p className="text-xs text-muted-foreground">confirmados a través de Jugahora</p>
              </CardContent>
            </Card>
          </Link>


          {/* 👉 Jugadores Abonados */}
          <Link href="/abonados">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Jugadores Abonados</CardTitle>
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cantidadAbonados}</div>
                <p className="text-xs text-muted-foreground">autorizados a crear partidos</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/jugadores-cancelados">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Jugadores Cancelados</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jugadoresCancelados}</div>
                <p className="text-xs text-muted-foreground">con cancelaciones tardías</p>
              </CardContent>
            </Card>
          </Link>


          {/* 👉 Eventos */}
          <Link href="/eventos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Eventos Programados</CardTitle>
                <Trophy className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventos.length}</div>
                <p className="text-xs text-muted-foreground">
                  {eventos.length === 1 ? "evento programado" : "eventos programados"}
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* 👉 Inventario */}
          <Link href="/inventario">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Artículos en Inventario</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{articulos.length}</div>
                <p className="text-xs text-muted-foreground">artículos en total</p>
              </CardContent>
            </Card>
          </Link>

          {/* 👉 Finanzas */}
          <Link href="/finanzas">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Balance Financiero</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${saldoNeto >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatearPrecio(saldoNeto)}
                </div>
                <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              </CardContent>
            </Card>
          </Link>

          {/* <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Información no disponible</p>
            </CardContent>
          </Card> */}
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Partidos Próximos</CardTitle>
          </CardHeader>
          <CardContent>
            {partidos.length > 0 ? (
              <div className="space-y-4">
                {partidos.slice(0, 3).map((partido) => (
                  <div key={partido.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{formatearFecha(partido.date)}</p>
                      <p className="text-sm text-gray-500">{partido.startTime} - {partido.endTime} hs</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatearPrecio(partido.price)}
                    </span>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/partidos">Ver todos los partidos</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay partidos programados</p>
            )}
          </CardContent>
        </Card>


        <Card>
        <CardHeader>
          <CardTitle>Artículos Populares</CardTitle>
        </CardHeader>
        <CardContent>
          {articulos.length > 0 ? (
            <div className="space-y-4">
              {articulos.slice(0, 3).map((articulo) => (
                <div key={articulo.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{articulo.nombre}</p>
                    <p className="text-sm text-gray-500">Stock: {articulo.cantidadStock}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    {formatearPrecio(articulo.precioVenta)}
                  </span>
                </div>
              ))}
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/inventario">Ver inventario completo</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No hay artículos disponibles</p>
          )}
        </CardContent>
      </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Últimos Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {movimientos.length > 0 ? (
                <div className="space-y-4">
                  {movimientos.slice(0, 3).map((movimiento) => (
                    <div key={movimiento.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{movimiento.concepto}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(movimiento.fechaMovimiento).toLocaleDateString()}
                        </p>
                      </div>
                      {movimiento.ingreso ? (
                        <span className="text-sm font-semibold text-green-600">
                          +{formatearPrecio(movimiento.ingreso)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-600">
                          -{formatearPrecio(movimiento.egreso || 0)}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/finanzas">Ver todos los movimientos</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No hay movimientos recientes</p>
              )}
            </CardContent>
          </Card>
        </div>
        </main>
      </div>
    </div>
  )
}
