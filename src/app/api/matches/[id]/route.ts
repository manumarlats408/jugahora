import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import sendgrid from "@sendgrid/mail";
import { generarEmailHTML, formatearFechaDDMMYYYY } from "@/lib/emailUtils";


sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

/**
 * 🔴 DELETE - Cuando un club elimina un partido
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    // 🔹 Obtener detalles del partido antes de eliminarlo
    const match = await prisma.partidos_club.findUnique({
      where: { id: matchId },
      select: { usuarios: true, Club: true, date: true, startTime: true, endTime: true, court: true },
    });

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // 🔹 Obtener los emails de los jugadores inscritos
    const jugadores = await prisma.user.findMany({
      where: { id: { in: match.usuarios } },
      select: { email: true, firstName: true },
    });

    // 🔹 Eliminar el partido
    await prisma.partidos_club.delete({ where: { id: matchId } });

    // 🔹 Enviar email a los jugadores avisando que el partido fue cancelado
    for (const jugador of jugadores) {
      await sendgrid.send({
        to: jugador.email,
        from: {
          name: "JugáHora",
          email: process.env.SENDGRID_FROM_EMAIL as string
        },
        subject: "⚠️ Partido Cancelado",
        html: generarEmailHTML({
          titulo: "⚠️ Partido Cancelado",
          saludo: `Hola ${jugador.firstName || "jugador"},`,
          descripcion: `Te informamos que el partido en ${match.Club?.name || "tu club"} ha sido cancelado.`,
          detalles: [
            { label: "📆 Día", valor: formatearFechaDDMMYYYY(match.date) },
            { label: "⏰ Hora", valor: `${match.startTime} - ${match.endTime}` },
            { label: "🏟️ Cancha", valor: match.court },
          ],
          footer: "Lamentamos los inconvenientes. Esperamos verte en otro partido pronto.",
        }),
      });
      
    }

    console.log("Notificaciones enviadas a los jugadores.");
    return NextResponse.json({ message: 'Partido eliminado correctamente y jugadores notificados' });

  } catch (error) {
    console.error('Error al eliminar el partido:', error);
    return NextResponse.json({ error: 'Error al eliminar el partido' }, { status: 500 });
  }
}

/**
 * ✏️ PATCH - Cuando un club edita un partido
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const matchId = parseInt(params.id);

  try {
    // 🔹 Obtener datos antes de la actualización
    const oldMatch = await prisma.partidos_club.findUnique({
      where: { id: matchId },
      select: { date: true, startTime: true, endTime: true, court: true, price: true, usuarios: true, Club: true },
    });

    if (!oldMatch) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // 🔹 Obtener los nuevos datos
    const { date, startTime, endTime, court, price } = await request.json();
    console.log("Datos recibidos para actualización:", { date, startTime, endTime, court, price });

    // 🔹 Actualizar partido
    const updatedMatch = await prisma.partidos_club.update({
      where: { id: matchId },
      data: {
        date: new Date(date),
        startTime,
        endTime,
        court,
        price,
      },
    });

    console.log("Partido actualizado:", updatedMatch);

    // 🔹 Determinar qué datos han cambiado
    const cambios: string[] = [];
    if (oldMatch.date.toISOString().split("T")[0] !== new Date(date).toISOString().split("T")[0]) {
      cambios.push(`<strong>Fecha:</strong> ${formatearFechaDDMMYYYY(oldMatch.date)} ➝ ${formatearFechaDDMMYYYY(new Date(date))}`);
    }

    if (oldMatch.startTime !== startTime || oldMatch.endTime !== endTime) {
      cambios.push(`<strong>Hora:</strong> ${oldMatch.startTime} - ${oldMatch.endTime} ➝ ${startTime} - ${endTime}`);
    }
    if (oldMatch.court !== court) {
      cambios.push(`<strong>Cancha:</strong> ${oldMatch.court} ➝ ${court}`);
    }
    if (oldMatch.price !== price) {
      cambios.push(`<strong>Precio:</strong> $${oldMatch.price} ➝ $${price}`);
    }

    // 🔹 Obtener los emails de los jugadores inscritos
    const jugadores = await prisma.user.findMany({
      where: { id: { in: oldMatch.usuarios } },
      select: { email: true, firstName: true },
    });

    // 🔹 Enviar email a los jugadores con los cambios
    for (const jugador of jugadores) {
      console.log("Enviando mail desde:", process.env.SENDGRID_FROM_EMAIL);
      await sendgrid.send({
        to: jugador.email,
        from: {
          name: "JugáHora",
          email: process.env.SENDGRID_FROM_EMAIL as string
        },
        subject: "📢 Partido Actualizado",
        html: generarEmailHTML({
          titulo: "📢 Partido Modificado",
          saludo: `Hola ${jugador.firstName || "jugador"},`,
          descripcion: `El partido en ${oldMatch.Club?.name || "tu club"} ha sido actualizado.`,
          detalles: [
            { label: "📆 Fecha", valor: formatearFechaDDMMYYYY(date) },
            { label: "⏰ Hora", valor: `${startTime} - ${endTime}` },
            { label: "🏟️ Cancha", valor: court },
            ...(cambios.length > 0
              ? [{ label: "📝 Cambios", valor: cambios.map(c => c.replace(/<\/?strong>/g, "")).join(" / ") }]
              : []),
          ],
          footer:
            "Lamentamos cualquier inconveniente que esta modificación pueda causar. Esperamos que aún puedas participar en el partido. En caso de que no puedas asistir, tenés la opción de cancelar tu inscripción desde la plataforma.",
        }),
      });
    }

    console.log("Notificaciones enviadas a los jugadores.");
    return NextResponse.json(updatedMatch);

  } catch (error) {
    console.error('Error al actualizar el partido:', error);
    return NextResponse.json({ error: 'Error al actualizar el partido' }, { status: 500 });
  }
}
