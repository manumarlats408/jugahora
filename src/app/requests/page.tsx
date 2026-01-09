'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface Request {
  id: number
  sender: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)


  const router = useRouter()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/friends/list-requests', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setRequests(data)
        } else {
          console.error('Error al obtener las solicitudes:', await response.json())
        }
      } catch (error) {
        console.error('Error general:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const getTokenFromCookies = () => {
    const cookieHeader = document.cookie
    return cookieHeader
      ?.split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]
  }

  const handleAccept = async (requestId: number) => {
    setAcceptingId(requestId)
    const token = getTokenFromCookies()
    try {
      const response = await fetch('/api/friends/accept-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      })
  
      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== requestId))
      }
    } catch (error) {
      console.error('Error al aceptar solicitud:', error)
    } finally {
      setAcceptingId(null)
    }
  }
  
  const handleReject = async (requestId: number) => {
    setRejectingId(requestId)
    const token = getTokenFromCookies()
    try {
      const response = await fetch('/api/friends/reject-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      })
  
      if (response.ok) {
        setRequests((prev) => prev.filter((req) => req.id !== requestId))
      }
    } catch (error) {
      console.error('Error al rechazar solicitud:', error)
    } finally {
      setRejectingId(null)
    }
  }
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-brand-page">
        <p className="text-lg text-gray-600">Cargando solicitudes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-page">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-start">
          <Button variant="outline" onClick={() => router.push('/explore')}>
            Volver al Explorar
          </Button>
        </div>

        <Card className="shadow-md border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-xl font-bold text-brand-primary">
              Solicitudes de Amistad
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border p-4 rounded-lg hover:bg-brand-bg transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.sender.firstName} {request.sender.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{request.sender.email}</p>
                  </div>
                  <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAccept(request.id)}
                    disabled={acceptingId === request.id}
                    className="bg-brand-primary hover:bg-brand-hover text-white"
                  >
                    {acceptingId === request.id ? 'Aceptando...' : 'Aceptar'}
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={rejectingId === request.id}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    {rejectingId === request.id ? 'Rechazando...' : 'Rechazar'}
                  </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No tienes solicitudes pendientes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
