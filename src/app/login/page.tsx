'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LogIn } from 'lucide-react'
import Image from 'next/image'

export default function PaginaInicioSesion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const respuesta = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (respuesta.ok) {
        const data = await respuesta.json()
        if (data.isClub) {
          router.replace('/club-dashboard')
        } else {
          router.replace('/menu')
        }
      } else {
        const datos = await respuesta.json()
        setError(datos.error || 'Ocurrió un error durante el inicio de sesión')
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error)
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-page p-4">
      <Link href="/" className="mb-8 text-2xl font-bold flex items-center text-black">
        <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} className="mr-2" />
        JugáHora
      </Link>
      <Card className="w-full max-w-md shadow-lg border border-brand-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-brand-primary">Iniciar sesión</CardTitle>
          <p className="text-center text-gray-500">Ingresa tus credenciales para acceder</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={manejarEnvio} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="tu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-brand-primary text-white hover:bg-brand-hover"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Iniciando sesión...</>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Iniciar sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/recuperar-contrasena" className="text-sm text-brand-primary hover:underline text-center">
            ¿Olvidaste tu contraseña?
          </Link>
          <p className="text-sm text-gray-500 text-center">
            ¿No tienes una cuenta? 
            <Link href="/registro" className="text-brand-primary hover:underline"> Regístrate</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
