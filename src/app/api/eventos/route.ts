import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import sendgrid from "@sendgrid/mail";
import { generarEmailHTML, formatearFechaDDMMYYYY } from "@/lib/emailUtils"


sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      nombre,
      date,
      startTime,
      endTime,
      clubId,
      categoria,
      genero,
      tipo,
      maxParejas,
      formato,
      price,
    } = data;

    const nuevoEvento = await prisma.evento_club.create({
      data: {
        nombre,
        date: new Date(date),
        startTime,
        endTime,
        categoria,
        genero,
        tipo,
        maxParejas: Number(maxParejas),
        price: parseFloat(price),
        ...(tipo === "torneo" && { formato }),
        Club: {
          connect: { id: clubId }
        }
      },
      include: { Club: true },
    });

    // 🔔 Notificar a jugadores de categoría +/-1
    const cat = parseInt(categoria);
    const niveles = [cat - 1, cat, cat + 1].map(String); // convertimos a string si nivel es string
    const jugadores = await prisma.user.findMany({
      where: {
        nivel: { in: niveles },
      },
      select: { email: true, firstName: true },
    });

    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: {
          name: "JugáHora",
          email: process.env.SENDGRID_FROM_EMAIL as string
        },
        subject: "🎾 ¡Nuevo evento disponible!",
        html: generarEmailHTML({
          titulo: `🎾 ¡Nuevo evento en ${nuevoEvento.Club.name}!`,
          saludo: `Hola <strong>${jugador.firstName || "jugador"}</strong>,`,
          descripcion: `Se ha creado un nuevo evento que podría interesarte.`,
          detalles: [
            { label: "📝 Nombre", valor: nuevoEvento.nombre },
            { label: "📆 Fecha", valor: formatearFechaDDMMYYYY(nuevoEvento.date) },
            { label: "⏰ Horario", valor: `${startTime} - ${endTime}` },
            { label: "🎯 Categoría", valor: categoria },
            { label: "🎭 Género", valor: genero },
            { label: "📌 Tipo", valor: tipo + (tipo === "torneo" && formato ? ` - Formato ${formato}` : "") },
            { label: "💰 Precio", valor: `$${price}` },
          ],
          footer: `Podés unirte desde la plataforma en la sección de eventos. ¡Te esperamos en la cancha!`,
        }),
      });
    }

    return NextResponse.json(nuevoEvento, { status: 201 });
  } catch (error) {
    console.error("Error al crear evento:", error);
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const clubId = searchParams.get("clubId")

  try {
    const eventos = await prisma.evento_club.findMany({
      where: clubId ? { clubId: Number(clubId) } : {},
      include: {
        Club: true,
      },
      orderBy: { date: "asc" },
    })

    // Asegurar que `inscripciones` siempre sea un array
    const eventosConInscripciones = eventos.map(evento => ({
      ...evento,
      inscripciones: evento.inscripciones || [], // Esto previene `undefined`
    }))

    return NextResponse.json(eventosConInscripciones)
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return NextResponse.json({ error: "Error al obtener eventos" }, { status: 500 })
  }
}
