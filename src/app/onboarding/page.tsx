'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-page p-4">
      
      {/* Logo + JugáHora como en login */}
      <Link href="/" className="mb-4 text-2xl font-bold flex items-center">
        <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} />
        <span className="ml-2">JugáHora</span>
      </Link>

      <Card className="w-full max-w-md shadow-lg border border-brand-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center text-brand-primary">
            Bienvenido a JugáHora
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 flex flex-col items-center">
          <div className="w-full border border-gray-300 rounded-md overflow-hidden">
            <video
              controls
              className="w-full max-h-[360px] object-contain bg-black"
            >
              <source src="/videos/Jugahora_celular.mp4" type="video/mp4" />
              Tu navegador no soporta el video.
            </video>
          </div>

          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white font-semibold"
          >
            Saltar tutorial
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
