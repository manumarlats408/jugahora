"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Home, User, Calendar, Users, LogOut, Trophy, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { FeedbackForm } from "@/components/feedback-form"

const menuItems = [
  { href: "/menu", label: "Menu", icon: Home },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/reserva", label: "Reservar", icon: Calendar },
  { href: "/jugar", label: "Unirme a un partido", icon: Users },
  { href: "/crear-partido", label: "Crear un partido", icon: Plus },
  { href: "/eventos/unirse", label: "Unirme a un evento", icon: Trophy },
]

export default function MenuPage() {
  console.log("Página de menú cargada")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setUserName(data.entity.firstName || data.entity.name)
        } else {
          throw new Error("Authentication failed")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando menu...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src="/logo.svg" alt="JugáHora Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>

        <nav className="hidden lg:flex ml-auto gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
              href={item.href}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Link>
          ))}
          <button
            className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden ml-auto text-gray-600 hover:text-brand-primary"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="lg:hidden absolute top-16 right-0 left-0 bg-white shadow-md z-10 transition-all duration-300 ease-in-out"
        >
          <nav className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
      
      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-4 bg-brand-page">
        {/* Tarjeta principal */}
        <Card className="w-full max-w-md shadow-lg border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary">
              {userName ? `¡Hola ${userName}!` : "¡Bienvenido!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-6 text-gray-600">Aprovecha nuestras funcionalidades:</p>
            <div className="space-y-4">
              <Link href="/reserva" className="block">
                <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white transition-colors duration-300 flex items-center justify-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Reserva tu cancha
                </Button>
              </Link>
              <Link href="/jugar" className="block">
                <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white transition-colors duration-300 flex items-center justify-center">
                  <Users className="w-5 h-5 mr-2" />
                  Unite a un partido
                </Button>
              </Link>
              <Link href="/crear-partido" className="block">
                <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white transition-colors duration-300 flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Crear un partido
                </Button>
              </Link>
              <Link href="/eventos/unirse" className="block">
                <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white transition-colors duration-300 flex items-center justify-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Unite a un evento
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="bg-brand-bg border-t border-brand-border">
            <p className="text-sm text-gray-600 italic">Próximamente más funcionalidades...</p>
          </CardFooter>
        </Card>

        {/* Tarjeta de Feedback */}
        <Card className="w-full max-w-md shadow border-brand-border">
          <CardHeader>
            <CardTitle className="text-lg text-brand-primary">¿Tenés alguna sugerencia?</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackForm />
          </CardContent>
        </Card>
      </main>

      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-4 sm:mb-0">© 2024 JugáHora. Todos los derechos reservados.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-4">
              <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/menu">
                Términos de Servicio
              </Link>
              <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/menu">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

