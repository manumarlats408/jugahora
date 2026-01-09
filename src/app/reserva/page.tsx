'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, X, Home, User, Calendar, Users, LogOut, Phone, Trophy, Plus } from 'lucide-react'

const clubs = [
  { name: 'Lasaigues Club - Martinez', phone: '+54 9 11 3013-0664' },
  { name: 'Lasaigues Club - Canning', phone: '+ 54 9 11 6052-0467' },
  { name: 'Lasaigues Club - Retiro', phone: '+54 9 11 6567-7240' },
  { name: 'Lasaigues Club - Saavedra', phone: '+54 9 11 5980-8262' },
  { name: 'Lasaigues Club - Caballito', phone: '+54 9 11 3016-3584' },
  { name: 'Lasaigues Club - Nordelta', phone: '+54 9 11 6175-7025' },
  { name: 'Lasaigues Club - Santa Bárbara', phone: '+54 9 11 6567-7240' },
  { name: 'Lasaigues Club - Tigre', phone: '+54 9 11 6688-0953' },
  { name: 'Lasaigues Club - Parque Leloir', phone: '+54 9 11 3435-2020' },

]

const menuItems = [
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/reserva', label: 'Reservar', icon: Calendar },
  { href: '/jugar', label: 'Unirme a un partido', icon: Users },
  { href: "/crear-partido", label: "Crear un partido", icon: Plus },
  { href: '/eventos/unirse', label: 'Unirme a un evento', icon: Trophy },
  
]

export default function ReservaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const router = useRouter()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const res = await fetch("/api/auth", { credentials: "include" })
        if (!res.ok) throw new Error("No autorizado")
        setIsAuthorized(true)
      } catch {
        router.push("/login")
      } finally {
        setIsVerifying(false)
      }
    }
  
    verificarAuth()
  }, [router])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  // Función para generar el enlace de WhatsApp
  const getWhatsAppLink = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '') // Elimina caracteres no numéricos
    return `https://wa.me/${formattedPhone}`
  }

  if (isVerifying || !isAuthorized) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-brand-page">
      <p className="text-gray-600 text-lg">Cargando reservas...</p>
    </div>
  )
} 

  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      <header className="px-4 lg:px-6 h-16 flex items-center relative bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <span className="sr-only">JugáHora</span>
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} /> 
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

      <main className="flex-1 p-4 bg-brand-page">
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Reserva tu pista
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-gray-600">Explora todos los clubes disponibles!</p>
            <div className="space-y-4">
              {clubs.map((club, index) => (
                <Link
                  key={index}
                  href={getWhatsAppLink(club.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex items-center space-x-4 p-4 border border-brand-border rounded-lg hover:bg-brand-bg transition-colors duration-300 cursor-pointer">
                    <Image src="/club.svg" alt={club.name} width={50} height={50} className="rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-800">{club.name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {club.phone}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
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
            <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/reserva">
              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/reserva">
              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
