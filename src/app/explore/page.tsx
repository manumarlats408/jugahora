'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

type FriendRequest = {
  id: number
  userId: number
  friendId: number
  status: 'pending' | 'accepted' | 'rejected'
}

export default function ExploreProfiles() {
  const [profiles, setProfiles] = useState<User[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [friends, setFriends] = useState<User[]>([])
  const [pendingIds, setPendingIds] = useState<number[]>([])
  const [receivedRequestIds, setReceivedRequestIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isSendingId, setIsSendingId] = useState<number | null>(null)

  const router = useRouter()

  const getVisibleProfiles = (
    users: User[],
    myId: number,
    friendsData: User[],
    received: number[]
  ) => {
    const friendIds = new Set(friendsData.map((f) => f.id))
    return users.filter(
      (profile) =>
        !friendIds.has(profile.id) &&
        !received.includes(profile.id) &&
        profile.id !== myId
    )
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth', { credentials: 'include' })
        if (!authRes.ok) throw new Error('No autorizado')
        const userData = await authRes.json()
        const myId = userData.entity.id
        setCurrentUserId(myId)

        const [usersRes, friendsRes, pendingRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/friends/list-friends', { credentials: 'include' }),
          fetch('/api/friends/requests', { credentials: 'include' }),
        ])

        const users: User[] = await usersRes.json()
        const friendsData: User[] = await friendsRes.json()
        const pendingData: FriendRequest[] = await pendingRes.json()

        setProfiles(users)
        setFriends(friendsData)

        const pending = pendingData
          .filter((r) => r.userId === myId && r.status === 'pending')
          .map((r) => r.friendId)
        setPendingIds(pending)

        const received = pendingData
          .filter((r) => r.friendId === myId && r.status === 'pending')
          .map((r) => r.userId)

        setReceivedRequestIds(received)

        const filtered = getVisibleProfiles(users, myId, friendsData, received) // ✅ usar la variable ya armada

        setFilteredProfiles(filtered)

        setIsAuthorized(true)
      } catch {
        router.push('/login')
      } finally {
        setIsVerifying(false)
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSendRequest = async (friendId: number) => {
    setIsSendingId(friendId)
    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Solicitud enviada exitosamente')
        setPendingIds((prev) => [...prev, friendId])
      } else {
        toast.error(result.message || 'Error al enviar solicitud')
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setIsSendingId(null)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setSearchTerm(value)

    if (!currentUserId) return

    const visible = getVisibleProfiles(profiles, currentUserId, friends, receivedRequestIds)
    const filtered = visible.filter((profile) =>
      `${profile.firstName} ${profile.lastName}`.toLowerCase().includes(value)
    )
    setFilteredProfiles(filtered)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando perfiles...</p>
      </div>
    )
  }

  if (isVerifying || !isAuthorized) return null

  return (
    <div className="min-h-screen bg-brand-page p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/perfil')}>
            Volver al Perfil
          </Button>
          <Link
            href="/requests"
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            Ver Solicitudes de Amistad ({receivedRequestIds.length})
          </Link>
        </div>

        <Card className="shadow-md border border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-xl font-bold text-brand-primary">
              Explorar Perfiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full"
            />

            {filteredProfiles.length > 0 ? (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-brand-border p-4 rounded-lg hover:bg-brand-bg transition-colors space-y-2 sm:space-y-0"
                  >
                    <div>
                      <p className="text-lg font-semibold text-gray-800">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                    {pendingIds.includes(profile.id) ? (
                      <Button disabled variant="outline" className="sm:ml-4 w-full sm:w-auto">
                        Pending
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSendRequest(profile.id)}
                        className="text-sm w-full sm:w-auto sm:ml-4"
                        disabled={isSendingId === profile.id}
                      >
                        {isSendingId === profile.id ? 'Enviando...' : 'Enviar Solicitud'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No se encontraron perfiles.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
