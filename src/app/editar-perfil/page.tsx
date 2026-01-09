'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface UserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  phoneNumber?: string
  address?: string
  age?: number
  isClub?: boolean
  preferredSide?: string
  strengths?: string
  weaknesses?: string
  nivel?: string
}

export default function EditarPerfilPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUserData({
            ...data.entity,
            isClub: data.isClub
          })
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Enviando solicitud PUT')

    if (!userData) return

    console.log('Data a enviar:', userData)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      })

      if (response.ok) {
        router.push('/perfil')
      } else {
        console.error('Error al actualizar el perfil...')
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando perfil...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">No se pudo cargar el perfil.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-page">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-md">
        <Link className="flex items-center justify-center" href="/menu">
          <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
          <span className="ml-2 text-2xl font-bold">JugáHora</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 bg-brand-page">
        <Card className="w-full max-w-lg shadow-lg border border-brand-border">
          <CardHeader className="bg-white border-b border-brand-border">

            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center">
              <User className="w-6 h-6 mr-2" />
              Editar Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
              />
            </div>

            {userData.isClub ? (
              <div>
                <Label htmlFor="name">
                  Nombre del Club <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={userData.name || ''}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="firstName">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={userData.firstName || ''}
                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={userData.lastName || ''}
                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="phoneNumber">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                value={userData.phoneNumber || ''}
                onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={userData.address || ''}
                onChange={(e) => setUserData({ ...userData, address: e.target.value })}
              />
            </div>

            {!userData.isClub && (
              <>
                <div>
                  <Label htmlFor="age">Edad
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={userData.age || ''}
                    onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || undefined })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="preferredSide">
                    Lado preferido <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="preferredSide"
                    value={userData.preferredSide || ''}
                    onChange={(e) => setUserData({ ...userData, preferredSide: e.target.value })}
                    required
                    className="w-full p-2 border border-brand-border rounded"

                  >
                    <option value="">Selecciona un lado</option>
                    <option value="Revés">Revés</option>
                    <option value="Drive">Drive</option>
                  </select>
                </div>

                {userData.nivel && (
                  <div>
                    <Label htmlFor="nivel">
                      Nivel <span className="text-gray-500 text-sm ml-1">(solo puedes bajar de categoria)</span>
                    </Label>
                    <select
                      id="nivel"
                      value={userData.nivel}
                      onChange={(e) => setUserData({ ...userData, nivel: e.target.value })}
                      className="w-full p-2 border border-brand-border rounded"

                      required
                    >
                      {Array.from({ length: 9 }, (_, i) => (i + 1).toString())
                        .filter((nivel) => parseInt(nivel) >= parseInt(userData.nivel!))
                        .map((nivel) => (
                          <option key={nivel} value={nivel}>
                            {nivel}
                          </option>
                        ))}
                    </select>
                  </div>
                )}


                <div>
                  <Label htmlFor="strengths">Fortalezas</Label>
                  <Input
                    id="strengths"
                    value={userData.strengths || ''}
                    onChange={(e) => setUserData({ ...userData, strengths: e.target.value })}
                    placeholder="Ej: volea, saque, smash"
                  />
                </div>

                <div>
                  <Label htmlFor="weaknesses">Debilidades</Label>
                  <Input
                    id="weaknesses"
                    value={userData.weaknesses || ''}
                    onChange={(e) => setUserData({ ...userData, weaknesses: e.target.value })}
                    placeholder="Ej: movilidad, juego en red"
                  />
                </div>
              </>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push('/perfil')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button type="submit" className="bg-brand-primary hover:bg-brand-hover text-white">
                Guardar cambios
              </Button>
            </div>
          </form>

          </CardContent>
        </Card>
      </main>

      <footer className="py-6 px-4 md:px-6 bg-white border-t border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            © 2024 JugáHora. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4">
            <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/editar-perfil">

              Términos de Servicio
            </Link>
            <Link className="text-xs text-gray-500 hover:text-brand-primary transition-colors" href="/editar-perfil">

              Privacidad
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}