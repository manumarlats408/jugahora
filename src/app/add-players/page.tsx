'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MdArrowBack } from 'react-icons/md'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

const AddPlayers = () => {
  const [profiles, setProfiles] = useState<User[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([])
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth', { credentials: 'include' })
        if (!authRes.ok) throw new Error("No autorizado")
        const userData = await authRes.json()

        const usersRes = await fetch('/api/users')
        const users = await usersRes.json()

        const filteredUsers = users.filter((u: User) => u.id !== userData.entity.id)
        setProfiles(filteredUsers)
        setFilteredProfiles(filteredUsers)

        setIsAuthorized(true)
      } catch {
        router.push('/login')
      } finally {
        setIsVerifying(false)
      }
    }

    fetchData()

    const storedPlayers = sessionStorage.getItem('finalPlayers')
    if (storedPlayers) {
      setSelectedPlayers(JSON.parse(storedPlayers))
    }
  }, [router])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)

    const filtered = profiles.filter((profile) =>
      `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(value)
    )

    setFilteredProfiles(filtered)
  }

  const handleAddPlayer = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId))
    } else {
      setSelectedPlayers([...selectedPlayers, playerId])
    }
  }

  const handleBack = () => {
    sessionStorage.setItem('finalPlayers', JSON.stringify(selectedPlayers))
    router.push('/crear-partido')
  }

  if (isVerifying || !isAuthorized) return null

  return (
    <div className="min-h-screen bg-brand-page p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-md border border-brand-border">
          <CardHeader className="bg-white border-b border-brand-border">
            <CardTitle className="text-xl font-bold text-brand-primary">Añadir Jugadores al Partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center justify-start gap-2 text-brand-primary"
            >
              <MdArrowBack className="h-5 w-5" />
              Volver
            </Button>
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />
            {filteredProfiles.length > 0 ? (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => {
                  const isSelected = selectedPlayers.includes(profile.id)
                  return (
                    <div
                      key={profile.id}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center border p-4 rounded-lg hover:bg-brand-soft transition-colors space-y-2 sm:space-y-0"
                    >
                      <div>
                        <p className="text-lg font-semibold text-gray-800">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                      <Button
                        onClick={() => handleAddPlayer(profile.id)}
                        className={`text-sm w-full sm:w-auto ${
                          isSelected
                            ? 'bg-brand-primary text-white hover:bg-brand-hover'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        } sm:ml-4`}
                      >
                        {isSelected ? 'Añadido' : 'Añadir al partido'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">No se encontraron perfiles.</p>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleBack}
          className="w-full mt-6 bg-brand-primary text-white hover:bg-brand-hover"
        >
          Guardar y Volver
        </Button>
      </div>
    </div>
  )
}

export default AddPlayers
