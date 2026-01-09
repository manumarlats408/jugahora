"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, Users, Calendar, Trophy, FileText, Bell, UserCircle, ChevronDown, ChevronUp, Mail } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

const Twitter = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const Linkedin = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const Instagram = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.017 0C8.396 0 7.989.016 6.756.072 5.526.127 4.718.302 4.008.57c-.738.292-1.363.682-1.988 1.307C1.395 2.502 1.005 3.127.713 3.865c-.268.71-.443 1.518-.498 2.748C.159 7.847.143 8.254.143 11.875s.016 4.028.072 5.261c.055 1.23.23 2.038.498 2.748.292.738.682 1.363 1.988 1.307.625.625 1.25 1.015 1.988 1.307.71.268 1.518.443 2.748.498 1.233.056 1.64.072 5.261.072s4.028-.016 5.261-.072c1.23-.055 2.038-.23 2.748-.498.738-.292 1.363-.682 1.988-1.307.625-.625 1.015-1.25 1.307-1.988.268-.71.443-1.518.498-2.748.056-1.233.072-1.64.072-5.261s-.016-4.028-.072-5.261c-.055-1.23-.23-2.038-.498-2.748-.292-.738-.682-1.363-1.307-1.988C19.502 1.395 18.877 1.005 18.139.713c-.71-.268-1.518-.443-2.748-.498C14.158.159 13.751.143 12.017.143zM12.017 2.2c3.556 0 3.978.016 5.38.072 1.299.059 2.006.277 2.476.461.622.242 1.066.532 1.532.998.466.466.756.91.998 1.532.184.47.402 1.177.461 2.476.056 1.402.072 1.824.072 5.38s-.016 3.978-.072 5.38c-.059 1.299-.277 2.006-.461 2.476-.242.622-.532 1.066-.998 1.532-.466.466-.91.756-1.532.998-.47.184-1.177.402-2.476.461-1.402.056-1.824.072-5.38.072s-3.978-.016-5.38-.072c-1.299-.059-2.006-.277-2.476-.461-.622-.242-1.066-.532-1.532-.998-.466.466-.91.756-1.532.998-.47-.184-1.177.402-2.476.461-1.402.056-1.824.072-5.38-.072z" />
    <path d="M12.017 5.838c-3.361 0-6.037 2.676-6.037 6.037s2.676 6.037 6.037 6.037 6.037-2.676 6.037-6.037-2.676-6.037-6.037-6.037zm0 9.963c-2.168 0-3.926-1.758-3.926-3.926s1.758-3.926 3.926-3.926 3.926 1.758 3.926 3.926-1.758 3.926-3.926 3.926z" />
    <circle cx="18.406" cy="5.594" r="1.44" />
  </svg>
)

// Componente FAQ personalizado
function CustomFaq() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const faqItems = [
    {
      question: "¿Cómo funciona JugáHora?",
      answer:
        "JugáHora es una plataforma que facilita la organización de partidos. Los jugadores pueden unirse fácilmente a partidos o eventos según su nivel. Los clubes pueden publicar sus canchas vacías y JugáHora se encarga de llenarlas.",
    },
    {
      question: "¿Cuánto cuesta usar JugáHora?",
      answer:
        "Para jugadores, cobramos una pequeña comisión por el servicio al momento de confirmar el partido. Para clubes, el primer mes es gratuito. Luego, se cobra por cada cancha que JugáHora organiza.",
    },
    {
      question: "¿Qué deportes están disponibles?",
      answer: "Nos enfocamos 100% en pádel para ofrecer una experiencia de calidad, actualizada y especializada.",
    },
    {
      question: "¿Cómo puedo registrar mi club?",
      answer: "Contactanos directamente y nos encargaremos de crear y configurar tu cuenta en poco tiempo.",
    },
    {
      question: "¿Puedo cancelar una reserva?",
      answer:
        "Sí. Podés cancelar hasta 12 horas antes del inicio del partido sin penalización. Cancelaciones posteriores pueden generar sanciones.",
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqItems.map((item, index) => (
        <div key={index} className="border-b border-brand-border last:border-b-0">
          <button
            className="w-full flex justify-between items-center py-6 text-left focus:outline-none"
            onClick={() => toggleItem(index)}
          >
            <h3 className="text-lg font-medium text-foreground">{item.question}</h3>
            {openItem === index ? (
              <ChevronUp className="h-5 w-5 text-brand-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-brand-primary" />
            )}
          </button>
          {openItem === index && (
            <div className="pb-6 text-muted-foreground animate-accordion-down">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Tipos para el componente FeatureCard
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color?: "blue" | "green" | "red" | "purple"
}

// Componente de tarjeta de característica
function FeatureCard({ title, description, icon, color = "blue" }: FeatureCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-brand-primary",
    green: "bg-green-50 text-green-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
  }

  return (
    <div className="bg-white rounded-lg border border-brand-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className={`${colorClasses[color]} p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white">
        <div className="container flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 h-auto sm:h-16 py-2 sm:py-0">
          <Link className="flex items-center justify-center" href="/">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} className="max-w-[32px]" />
            <span className="text-xl font-bold text-foreground">JugáHora</span>
          </Link>
          {/* <nav className="hidden md:flex gap-6">
            <Link
              href="#jugadores"
              className="text-sm font-medium text-muted-foreground hover:text-brand-primary transition-colors duration-200"
            >
              Jugadores
            </Link>
            <Link
              href="#clubes"
              className="text-sm font-medium text-muted-foreground hover:text-brand-primary transition-colors duration-200"
            >
              Clubes
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-brand-primary transition-colors duration-200"
            >
              FAQ
            </Link>
          </nav> */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-brand-primary transition-colors duration-200"
            >
              Iniciar Sesión
            </Link>
            <Link href="/registro">
              <Button className="bg-brand-primary hover:bg-brand-hover transition-colors duration-200">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-fit md:min-h-screen bg-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-screen">
            {/* Left side - Content */}
            <motion.div
              className="flex items-start md:items-center justify-center px-6 md:px-12 lg:px-16 py-6 md:py-0 pt-8 md:pt-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6 max-w-lg">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  La plataforma creada para jugadores y clubes de pádel
                </h1>
                <p className="text-xl text-muted-foreground">
                  JugáHora es la plataforma donde los jugadores encuentran partidos fácilmente y los clubes se
                  despreocupan por llenar sus horarios.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/registro" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto px-6 py-3 text-base bg-brand-primary text-white hover:bg-brand-hover transition-colors duration-200"
                    >
                      Registrarse
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-6 py-3 text-base border-brand-border text-muted-foreground hover:bg-brand-bg transition-colors duration-200"
                    >
                      Iniciar sesión
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right side - Image covering full area */}
            <motion.div
              className="relative hidden md:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image
                src="/foto_pelota.webp"
                alt="Cancha de pádel con pelota - JugáHora"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>
        </section>

        {/* Jugadores Section */}
        <section id="jugadores" className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Para Jugadores</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Encontrá partidos, conocé jugadores y disfrutá del pádel sin complicaciones.
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Feature cards in 2x2 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Clock className="h-6 w-6" />,
                      title: "Unite a partidos",
                      description: "Encontrá partidos según tu nivel y disponibilidad.",
                      color: "blue" as const,
                    },
                    {
                      icon: <Users className="h-6 w-6" />,
                      title: "Comunidad activa",
                      description: "Conocé jugadores y hacé amigos.",
                      color: "green" as const,
                    },
                    {
                      icon: <UserCircle className="h-6 w-6" />,
                      title: "Perfil personalizado",
                      description: "Configurá tu nivel y preferencias.",
                      color: "purple" as const,
                    },
                    {
                      icon: <Bell className="h-6 w-6" />,
                      title: "Notificaciones",
                      description: "Recibí alertas de partidos y cambios.",
                      color: "red" as const,
                    },
                  ].map((item, index) => (
                    <FeatureCard
                      key={index}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                      color={item.color}
                    />
                  ))}
                </div>

                {/* Right side - Mobile mockups */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Image src="/celulares3.png" alt="Mockup JugáHora" className="w-full max-w-2xl h-auto" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Clubes Section */}
        <section id="clubes" className="py-16 bg-brand-page">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Para Clubes</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Gestioná tus canchas, organizá eventos y maximizá tus ingresos.
              </p>
            </div>

            <div className="space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Laptop mockup */}
                <motion.div
                  className="flex justify-center order-2 lg:order-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Image src="/laptop.png" alt="Dashboard de JugáHora" className="w-full max-w-2xl h-auto" />
                </motion.div>

                {/* Right side - Feature cards in 2x2 grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-1 lg:order-2">
                  {[
                    {
                      icon: <Calendar className="h-6 w-6" />,
                      title: "Gestión de canchas",
                      description: "Publicá tus canchas y JugáHora las llena.",
                      color: "blue" as const,
                    },
                    {
                      icon: <Trophy className="h-6 w-6" />,
                      title: "Creación de eventos",
                      description: "Organizá torneos y eventos especiales.",
                      color: "green" as const,
                    },
                    {
                      icon: <FileText className="h-6 w-6" />,
                      title: "Estadísticas",
                      description: "Accedé a datos de uso y rendimiento.",
                      color: "purple" as const,
                    },
                    {
                      icon: <Bell className="h-6 w-6" />,
                      title: "Notificaciones",
                      description: "Recibí alertas de reservas y cambios.",
                      color: "red" as const,
                    },
                  ].map((item, index) => (
                    <FeatureCard
                      key={index}
                      icon={item.icon}
                      title={item.title}
                      description={item.description}
                      color={item.color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 bg-white rounded-lg border border-brand-border p-8 shadow-sm max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">¿Sos un club?</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Los botones de registro e inicio de sesión son exclusivamente para jugadores. Si sos un club y querés
                formar parte de JugáHora, contactanos directamente y nos encargaremos de crear y configurar tu cuenta en
                poco tiempo.
              </p>

              <Button
                size="lg"
                className="px-6 py-3 text-base bg-brand-primary text-white hover:bg-brand-hover transition-colors duration-200"
                onClick={() => {
                  const subject = encodeURIComponent("Registro de Club en JugáHora")
                  const body = encodeURIComponent(
                    "Hola equipo de JugáHora,\n\nSoy representante de un club y me interesa formar parte de la plataforma. Me gustaría obtener más información sobre:\n\n- Proceso de registro\n- Costos y comisiones\n- Funcionalidades disponibles\n- Tiempo de implementación\n\nDatos de nuestro club:\n- Nombre del club: \n- Ubicación: \n- Cantidad de canchas: \n- Teléfono de contacto: \n\nQuedo a la espera de su respuesta.\n\nSaludos cordiales.",
                  )
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=jugahora.contacto@gmail.com&su=${subject}&body=${body}`
                  window.open(gmailUrl, "_blank")
                }}
              >
                <Mail className="mr-2 h-5 w-5" />
                Contactar por Gmail
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Preguntas Frecuentes</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Respondemos tus dudas sobre JugáHora.</p>
            </div>
            <motion.div
              className="max-w-3xl mx-auto bg-white rounded-lg border border-brand-border p-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <CustomFaq />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-primary">
          <div className="container text-center">
            <motion.h2
              className="text-3xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Sumate a la comunidad JugáHora
            </motion.h2>
            <motion.p
              className="text-xl text-brand-soft max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Unite a una comunidad que te permite encontrar partidos con facilidad si sos jugador, y olvidarte de
              llenar tus horarios si sos club.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/registro" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-6 py-3 text-base bg-white text-brand-primary hover:bg-brand-bg transition-colors duration-200"
                >
                  Comenzar ahora
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white text-muted-foreground py-12 border-t border-brand-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Image src="/logo.svg" alt="Logo" width={32} height={32} className="max-w-[32px]" />
                  <span className="text-xl font-semibold text-foreground">JugáHora</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                La plataforma que conecta jugadores con clubes deportivos.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="#jugadores"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    Jugadores
                  </Link>
                </li>
                <li>
                  <Link
                    href="#clubes"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    Clubes
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200 text-sm"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Email: jugahora.contacto@gmail.com</p>
                <p className="text-muted-foreground">Teléfono: +54 9 11 6373 0035</p>
                <div className="flex space-x-3 mt-4">
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200"
                  >
                    <Twitter />
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200"
                  >
                    <Linkedin />
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-brand-primary transition-colors duration-200"
                  >
                    <Instagram />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-brand-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">© 2025 JugáHora. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
