'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Friend {
  id: string
  firstName: string
  lastName: string
  nivel?: string
  progress?: number
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/friends/ranking')
        const data = await response.json()
        // Ordenamos: menor nivel (1) es mejor, luego mayor progreso
        const sorted = data.sort((a: Friend, b: Friend) => {
          const nivelA = parseInt(a.nivel || '8')
          const nivelB = parseInt(b.nivel || '8')
          if (nivelA !== nivelB) return nivelA - nivelB
          return (b.progress || 0) - (a.progress || 0)
        })
        setRanking(sorted)
      } catch (error) {
        console.error('Error al cargar ranking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  return (
    <div className="min-h-screen bg-brand-page">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/perfil')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Perfil
          </Button>
        </div>

        <Card className="shadow-md border-brand-border">
          <CardHeader className="bg-brand-bg border-b border-brand-border">
            <CardTitle className="text-2xl font-bold text-brand-primary flex items-center">
              <User className="w-6 h-6 mr-2" />
              Ranking entre Amigos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center text-brand-primary">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Cargando ranking...
              </div>
            ) : ranking.length > 0 ? (
              <ul className="space-y-4">
                {ranking.map((friend, index) => (
                  <li
                    key={friend.id}
                    className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        #{index + 1}. {friend.firstName} {friend.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Nivel {friend.nivel || '-'} - Progreso {friend.progress ?? 0}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">No tienes amigos para comparar aún.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
