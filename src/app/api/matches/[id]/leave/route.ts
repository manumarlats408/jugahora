// app/api/matches/[id]/leave/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import sendgrid from "@sendgrid/mail";
import { generarEmailHTML, formatearFechaDDMMYYYY } from "@/lib/emailUtils";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Iniciando POST request para retirarse de un partido');
  try {
    const matchId = parseInt(params.id);
    console.log('ID del partido:', matchId);

    // Extraer token y verificar autenticación
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token);

    if (!userId) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Transacción para retirar al usuario del partido
    const result = await prisma.$transaction(async (prisma) => {
      console.log('Buscando partido...');
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Club: true }, // Incluir datos del club
      });

      if (!match) {
        console.log('Partido no encontrado');
        throw new Error('Partido no encontrado');
      }

      if (!match.usuarios.includes(userId)) {
        console.log('Usuario no está unido al partido');
        throw new Error('No estás unido a este partido');
      }

      console.log('Actualizando el partido para remover el usuario');

      // Actualiza el partido para remover al usuario
      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players - 1,
          usuarios: {
            set: match.usuarios.filter((id) => id !== userId), // Remueve el userId
          },
        },
      });

      // ✅ Si el partido quedó vacío, reseteamos la categoría
      if (updatedMatch.players === 0) {
        await prisma.partidos_club.update({
          where: { id: matchId },
          data: { categoria: null },
        });
      }

      // Actualiza el usuario para remover el `matchId` de su array `partidosUnidos`
      await prisma.user.update({
        where: { id: userId },
        data: {
          partidosUnidos: {
            set: (await prisma.user.findUnique({
              where: { id: userId },
              select: { partidosUnidos: true },
            }))?.partidosUnidos.filter((id) => id !== matchId) || [],
          },
        },
      });

      console.log('Partido actualizado:', updatedMatch);

      // 👇 Verificar si la cancelación fue con menos de 12 horas
      const fechaPartido = match.date.toISOString().split("T")[0]
      const partidoDateTime = new Date(`${fechaPartido}T${match.startTime}:00`)
      const ahora = new Date(new Date().getTime() - 3 * 60 * 60 * 1000) // UTC-3

      const diferenciaMs = partidoDateTime.getTime() - ahora.getTime()
      const diferenciaHoras = diferenciaMs / (1000 * 60 * 60)

      if (match.players === 4 && diferenciaHoras < 12) {
        await prisma.jugadorCancelado.upsert({
          where: {
            userId_clubId: {
              userId,
              clubId: match.Club.id
            }
          },
          update: {
            cantidadCancelaciones: { increment: 1 },
            ultimaCancelacion: new Date()
          },
          create: {
            userId,
            clubId: match.Club.id,
            cantidadCancelaciones: 1,
            ultimaCancelacion: new Date()
          }
        })
        console.log(`🚫 Jugador ${userId} canceló con menos de 12h`)
      }


      // ✅ Si el partido tenía 4 jugadores y ahora tiene 3, enviar notificaciones
      if (match.players === 4 && updatedMatch.players === 3) {
        console.log('El partido ha pasado de 4 a 3 jugadores, enviando notificaciones...');

        // 🔹 Obtener detalles de los jugadores restantes
        const jugadoresRestantes = await prisma.user.findMany({
          where: { id: { in: updatedMatch.usuarios } },
          select: { firstName: true, email: true },
        });

        // 🔹 Enviar email al club avisando que el partido se abrió nuevamente
        await sendgrid.send({
          to: match.Club.email,
          from: {
            name: "JugáHora",
            email: process.env.SENDGRID_FROM_EMAIL as string
          },
          subject: "🎾 Partido Abierto Nuevamente",
          html: generarEmailHTML({
            titulo: "🎾 Partido Abierto Nuevamente",
            saludo: `Hola ${match.Club.name},`,
            descripcion: "Un jugador se ha retirado y el partido ahora tiene 3 jugadores.",
            detalles: [
              { label: "📍 Club", valor: match.Club.name },
              { label: "📆 Día", valor: formatearFechaDDMMYYYY(match.date) },
              { label: "⏰ Hora", valor: `${match.startTime} - ${match.endTime}` },
              { label: "🏟️ Cancha", valor: match.court },
            ],
            footer: "Ahora hay un lugar disponible en este partido.",
          }),
        });
        

        // 🔹 Enviar email a los jugadores restantes avisando que hay un lugar libre
        for (const jugador of jugadoresRestantes) {
          await sendgrid.send({
            to: jugador.email,
            from: {
              name: "JugáHora",
              email: process.env.SENDGRID_FROM_EMAIL as string
            },
            subject: "🎾 Un jugador se ha retirado del partido",
            html: generarEmailHTML({
              titulo: "🎾 Un jugador se ha retirado del partido",
              saludo: `Hola ${jugador.firstName || "jugador"},`,
              descripcion: "Ahora hay un lugar disponible en tu partido de pádel.",
              detalles: [
                { label: "📍 Club", valor: match.Club.name },
                { label: "📆 Día", valor: formatearFechaDDMMYYYY(match.date) },
                { label: "⏰ Hora", valor: `${match.startTime} - ${match.endTime}` },
                { label: "🏟️ Cancha", valor: match.court },
              ],
              footer: "Revisá la plataforma para ver si hay nuevos jugadores disponibles.",
            }),
          });
          
        }
      }

      // 🔔 Notificar si quedó con 3 jugadores
      if (match.players === 4 && updatedMatch.players === 3 && match.categoria !== null) {
        const usuariosNivel = await prisma.user.findMany({
          where: {
            nivel: match.categoria,
            NOT: { id: { in: updatedMatch.usuarios } },
          },
          select: { email: true, firstName: true },
        });

        for (const user of usuariosNivel) {
          await sendgrid.send({
            to: user.email,
            from: {
              name: "JugáHora",
              email: process.env.SENDGRID_FROM_EMAIL as string
            },
            subject: "🎾 ¡Unite a este partido de tu nivel!",
            html: generarEmailHTML({
              titulo: `🎾 ¡Un partido de categoria ${match.categoria} necesita un jugador!`,
              saludo: `Hola ${user.firstName || "jugador"},`,
              descripcion: "Un jugador se retiró de un partido que coincide con tu nivel:",
              detalles: [
                { label: "📍 Club", valor: match.Club.name },
                { label: "📆 Día", valor: formatearFechaDDMMYYYY(match.date) },
                { label: "⏰ Hora", valor: `${match.startTime} - ${match.endTime}` },
                { label: "🏟️ Cancha", valor: match.court },
              ],
              footer: "¡Unite desde la plataforma antes de que se llene!",
            }),
          });
          
        }
      }

      return updatedMatch;
    });

    console.log('Transacción completada exitosamente');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al retirarse del partido:', error);
    return NextResponse.json({ error: 'Error al retirarse del partido' }, { status: 400 });
  }
}
