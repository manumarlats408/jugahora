'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from 'lucide-react'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function PaginaRegistro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [nivel, setNivel] = useState('')
  const [genero, setGenero] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  const [preferredSide, setPreferredSide] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')

  const manejarEnvio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsRegistering(true)

    try {
      if (currentStep === 1) {
        const respuesta = await fetch('/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName, phoneNumber, address, age, genero }),
        })

        if (respuesta.ok) {
          setCurrentStep(2)
        } else {
          const datos = await respuesta.json()
          setError(datos.error || 'Ocurrió un error durante el registro')
        }
      } else if (currentStep === 2) {
        setCurrentStep(3)
      } else {
        const respuesta = await fetch('/api/registro', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nivel, preferredSide, strengths, weaknesses }),
        })

        if (respuesta.ok) {
          router.push('/onboarding')
        } else {
          const datos = await respuesta.json()
          setError(datos.error || 'Ocurrió un error al completar el registro')
        }
      }
    } catch (error) {
      console.error('Error de registro:', error)
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.')
    } finally {
      setIsRegistering(false)
    }
  }

  const RequiredFieldTooltip = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-red-500 ml-1">*</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Este campo es obligatorio</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-page p-4">
      <Link href="/" className="mb-8 text-2xl font-bold flex items-center text-black">
        <Image src='/logo.svg' alt="JugáHora Logo" width={32} height={32} className="mr-2" />
        JugáHora
      </Link>
      <Card className="w-full max-w-md shadow-lg border border-brand-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-brand-primary">
            {currentStep === 1 ? 'Crear una cuenta' : currentStep === 2 ? 'Preferencias de juego' : 'Selecciona tu categoría'}
          </CardTitle>
          <p className="text-center text-gray-500">
            {currentStep === 1
              ? 'Ingresa tus datos para registrarte'
              : currentStep === 2
              ? 'Cuéntanos sobre tu estilo de juego'
              : 'A continuación, selecciona tu categoría'}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 ? (
            <form onSubmit={manejarEnvio} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">Correo electrónico <RequiredFieldTooltip /></Label>
                <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">Contraseña <RequiredFieldTooltip /></Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center">Nombre <RequiredFieldTooltip /></Label>
                  <Input id="firstName" type="text" placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center">Apellido <RequiredFieldTooltip /></Label>
                  <Input id="lastName" type="text" placeholder="Pérez" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero" className="flex items-center">Género <RequiredFieldTooltip /></Label>
                <select
                  id="genero"
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  required
                  className="w-full p-2 border border-brand-border rounded"
                >
                  <option value="">Selecciona tu género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center">Edad <RequiredFieldTooltip /></Label>
                <Input id="age" type="number" placeholder="Ej: 30" value={age} onChange={(e) => setAge(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center">Número de teléfono <RequiredFieldTooltip /></Label>
                <Input id="phoneNumber" type="tel" placeholder="+5491160381888" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" type="text" placeholder="Opcional: Av. Siempreviva 123" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-brand-primary text-white hover:bg-brand-hover" disabled={isRegistering}>
                {isRegistering ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registrando...</>) : (<><UserPlus className="mr-2 h-4 w-4" /> Siguiente</>)}
              </Button>
            </form>
          ) : currentStep === 2 ? (
            <form onSubmit={manejarEnvio} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredSide">Lado preferido de la cancha</Label>
                <select id="preferredSide" value={preferredSide} onChange={(e) => setPreferredSide(e.target.value)} className="w-full p-2 border border-brand-border rounded" required>
                  <option value="">Selecciona un lado</option>
                  <option value="Revés">Revés</option>
                  <option value="Drive">Drive</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="strengths">Fortalezas (separa con comas)</Label>
                <Input id="strengths" type="text" placeholder="Ej: Saque, Volea, Smash" value={strengths} onChange={(e) => setStrengths(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weaknesses">Debilidades (separa con comas)</Label>
                <Input id="weaknesses" type="text" placeholder="Ej: Revés, Globo, Defensa" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} />
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-brand-primary text-white hover:bg-brand-hover" disabled={isRegistering}>
                {isRegistering ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>) : (<>Siguiente</>)}
              </Button>
            </form>
          ) : (
            <form onSubmit={manejarEnvio} className="space-y-4">
              <p className="text-gray-500">
                A continuación, selecciona la categoría que mejor describe tu experiencia:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                <li><strong>Categoría 9 (Principiante):</strong> Maneja golpes básicos con poca precisión y control, especialmente en situaciones de juego lento. Suelen preferir los golpes de derecha y están empezando a entender el posicionamiento en la cancha.</li>
                <li><strong>Categoría 8 (Principiante):</strong> Tiene algo de experiencia y ha comenzado a desarrollar habilidades básicas. Se enfoca en mejorar la consistencia de sus golpes, controlar mejor la pelota, y manejar su posicionamiento en la cancha con mayor efectividad.</li>
                <li><strong>Categoría 7 (Principiante Intermedio):</strong> Posee técnica refinada para ejecutar todos los golpes con consistencia. Tiene buen control y adaptabilidad en la cancha, logrando manejar la velocidad media de la pelota, aunque puede tener dificultades con golpes rápidos.</li>
                <li><strong>Categoría 6 (Intermedio):</strong> Maneja golpes con velocidad y juego constante. Además, muestra habilidad para variar la estrategia en el juego y para identificar los puntos débiles del oponente.</li>
                <li><strong>Categoría 5 (Intermedio):</strong> Combina una técnica excelente con una comprensión táctica del juego. Se adapta rápidamente a diferentes estilos y estrategias, explotando las debilidades del rival con efectividad y manejando con confianza la velocidad alta de la pelota.</li>
                <li><strong>Categoría 4 (Avanzado):</strong> Alto nivel de competitividad y dominio completo de la técnica, así como una comprensión táctica avanzada. Puede variar constantemente las estrategias, anticiparse a las jugadas del rival y controlar tanto la velocidad como la dirección de la pelota con precisión.</li>
                <li><strong>Categoría 3 (Avanzado):</strong> Control excepcional de la pelota, ejecutando golpes complejos como bandejas y víboras con consistencia. El uso estratégico de las paredes y los ángulos forma parte integral de su juego, permitiéndole construir puntos elaborados.</li>
                <li><strong>Categorías 2 y 1 (Profesional):</strong> En estas categorías, los jugadores suelen dedicarse de manera profesional al padel, aunque el nivel de profesionalización puede variar entre ambas categorías. Tienen un dominio avanzado y juegan con gran habilidad y experiencia.</li>
              </ul>
              <div className="space-y-2">
                <Label htmlFor="nivel">Selecciona tu categoría</Label>
                <Input id="nivel" type="text" placeholder="Ejemplo: 4" value={nivel} onChange={(e) => setNivel(e.target.value)} required />
              </div>
              {error && <p className="text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-brand-primary text-white hover:bg-brand-hover" disabled={isRegistering}>
                {isRegistering ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registrando...</>) : (<>Finalizar Registro</>)}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-gray-500 text-center">
            Al registrarte, aceptás nuestros
            <Link href="/terminos" className="text-brand-primary hover:underline"> términos de servicio</Link> y
            <Link href="/privacidad" className="text-brand-primary hover:underline"> política de privacidad</Link>.
          </p>
          <p className="text-sm text-gray-500 text-center">
            ¿Ya tenés una cuenta?
            <Link href="/login" className="text-brand-primary hover:underline"> Iniciá sesión</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
