"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare } from "lucide-react"

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (response.ok) {
        setStatusMessage({
          type: "success",
          message: "¡Gracias por tu feedback! Hemos recibido tu mensaje correctamente.",
        })
        setMessage("")
        setTimeout(() => {
          setIsOpen(false)
          setStatusMessage(null)
        }, 2000)
      } else {
        const data = await response.json()
        throw new Error(data.error || "Error al enviar el feedback")
      }
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Hubo un problema al enviar tu feedback. Inténtalo de nuevo.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-md px-4 py-2 text-xs flex items-center"
        >
          <MessageSquare className="w-3 h-3 mr-1" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-brand-primary">Enviar Feedback</DialogTitle>
          <DialogDescription>
            Comparte tus sugerencias para mejorar JugáHora. Tu opinión es importante para nosotros.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-md ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {statusMessage.message}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Tu recomendación
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={handleChange}
              required
              placeholder="Escribe aquí tu sugerencia o recomendación..."
              className="min-h-[150px] border-brand-border focus:border-brand-primary focus:ring-brand-primary"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-primary hover:bg-brand-hover text-white">
              {isSubmitting ? "Enviando..." : "Enviar feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

