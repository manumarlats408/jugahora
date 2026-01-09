import { NextResponse } from "next/server"
import sendgrid from "@sendgrid/mail"

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string)

interface EmailRequest {
  partidoId: string
  clubEmail: string
}

export async function POST(req: Request) {
  try {
    const body: EmailRequest = await req.json()

    if (!body.partidoId || !body.clubEmail) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    await sendgrid.send({
      to: body.clubEmail,
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject: "🎾 Partido Completo - Notificación",
      html: `
        <h2>🎾 El partido ${body.partidoId} se ha llenado!</h2>
        <p>Este partido ya cuenta con 4 jugadores.</p>
        <p>Por favor, revisa la plataforma para gestionar la reserva de la pista.</p>
      `
    })

    return NextResponse.json({ success: true, message: "Email enviado correctamente!" })
  } catch (error) {
    console.error("Error enviando email:", error)
    return NextResponse.json({ error: "Error enviando email" }, { status: 500 })
  }
}
