"use client"

import Link from "next/link"
import Image from "next/image"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  onLogout: () => Promise<void>
}

export function AppHeader({ onLogout }: AppHeaderProps) {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b bg-white">
      <Link className="flex items-center justify-center" href="/">
        <Image src="/logo.svg" alt="JugáHora Logo" width={32} height={32} />
        <span className="ml-2 text-xl font-bold">JugáHora</span>
      </Link>
      <nav className="flex gap-4 sm:gap-6 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificaciones</span>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div className="font-medium">Notificaciones</div>
            </div>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Nuevo partido creado</span>
                <span className="text-sm text-gray-500">Cancha 1, hoy a las 18:00</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Recordatorio: Mantenimiento</span>
                <span className="text-sm text-gray-500">Cancha 3, mañana a las 10:00</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Partido cancelado</span>
                <span className="text-sm text-gray-500">Cancha 2, 20/03 a las 19:00</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button className="text-sm font-medium hover:underline underline-offset-4" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  )
}

