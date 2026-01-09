import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // Validar los datos
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 })
    }

    // Verificar que tenemos las variables de entorno necesarias
    if (!process.env.SENDGRID_API_KEY) {
      console.error("Error: SENDGRID_API_KEY no está configurada")
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 })
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error("Error: SENDGRID_FROM_EMAIL no está configurada")
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 })
    }

    // Configuración para SendGrid
    const sendgridUrl = "https://api.sendgrid.com/v3/mail/send"

    // Crear el cuerpo del email con formato HTML para mejor presentación
    const emailBody = `
      <h2>Nuevo feedback de JugáHora</h2>
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <p><em>Este feedback fue enviado anónimamente desde la aplicación JugáHora.</em></p>
    `

    // Preparar la solicitud a SendGrid
    const sendgridData = {
      personalizations: [
        {
          to: [{ email: "jugahora.contacto@gmail.com" }], // destino fijo
          subject: "Nuevo feedback anónimo de JugáHora",
        },
      ],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL, // sigue usando el remitente confiable
        name: "JugáHora Feedback",
      },
      content: [
        {
          type: "text/html",
          value: emailBody,
        },
      ],
    }
    

    console.log("Enviando email con feedback anónimo")

    // Enviar la solicitud a SendGrid
    const response = await fetch(sendgridUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(sendgridData),
    })

    // Obtener la respuesta completa para depuración
    const responseText = await response.text()

    if (!response.ok) {
      console.error("Error al enviar email con SendGrid:", responseText)
      return NextResponse.json({ error: `Error al enviar el feedback: ${responseText}` }, { status: 500 })
    }

    console.log("Email enviado correctamente")
    return NextResponse.json({
      success: true,
      message: "Feedback enviado correctamente",
    })
  } catch (error) {
    console.error("Error en el servidor:", error)
    return NextResponse.json({ error: "Error en el servidor al procesar la solicitud" }, { status: 500 })
  }
}

