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
  try {
    const matchId = parseInt(params.id);
    const token = cookies().get('token')?.value;
    const userId = await verifyAuth(token);

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const jugador = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nivel: true, genero: true, firstName: true, email: true },
    });

    if (!jugador || jugador.nivel == null || jugador.genero == null) {
      return NextResponse.json({ error: 'El jugador no tiene nivel o género asignado' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const match = await prisma.partidos_club.findUnique({
        where: { id: matchId },
        include: { Club: true },
      });

      if (!match) throw new Error('Partido no encontrado');
      if (match.players >= match.maxPlayers) throw new Error('El partido está completo');
      if (match.usuarios.includes(userId)) throw new Error('Ya estás unido a este partido');

      // Si es el primer jugador, guarda género y categoría
      if (match.players === 0) {
        await prisma.partidos_club.update({
          where: { id: matchId },
          data: {
            categoria: jugador.nivel,
            genero: jugador.genero,
          },
        });
      } else {
        if (match.categoria == null || match.genero == null) {
          throw new Error('Este partido no tiene categoría o género definidos.');
        }

        // Validar género y nivel contra el partido
        if (jugador.genero !== match.genero) {
          throw new Error(`Este partido es para género ${match.genero}. Tu género es ${jugador.genero}.`);
        }

        if (jugador.nivel !== match.categoria) {
          throw new Error(`Este partido es para categoría ${match.categoria}. Tu categoría actual es ${jugador.nivel}.`);
        }
      }

      const updatedMatch = await prisma.partidos_club.update({
        where: { id: matchId },
        data: {
          players: match.players + 1,
          usuarios: { push: userId },
        },
      });

      // 🔔 Notificación si se llenó el partido
      if (updatedMatch.players === updatedMatch.maxPlayers && match.Club?.email) {
        const jugadores = await prisma.user.findMany({
          where: { id: { in: updatedMatch.usuarios } },
          select: { firstName: true, lastName: true, email: true },
        });

        const jugadoresLista = jugadores
        .map(j => `${(j.firstName || 'Jugador')} ${(j.lastName || '')} (${j.email})`)
        .join("<br>");

        // Email al club
        await sendgrid.send({
          to: match.Club.email,
          from: {
            name: "JugáHora",
            email: process.env.SENDGRID_FROM_EMAIL as string
          },
          subject: "✅ Partido completo",
          html: generarEmailHTML({
            titulo: "✅ Partido completo",
            saludo: `Hola ${match.Club.name},`,
            descripcion: "Se han unido 4 jugadores al partido programado.",
            detalles: [
              { label: "📆 Día", valor: formatearFechaDDMMYYYY(match.date) },
              { label: "⏰ Hora", valor: `${match.startTime} - ${match.endTime}` },
              { label: "🏟️ Cancha", valor: match.court },
            ],
            footer: `Jugadores inscritos:<br>${jugadoresLista}`,
          }),
        });
        
        // Email a los jugadores
        for (const jugador of jugadores) {
          await sendgrid.send({
            to: jugador.email,
            from: {
              name: "JugáHora",
              email: process.env.SENDGRID_FROM_EMAIL as string
            },
            subject: "✅ Tu partido ha sido confirmado",
            html: generarEmailHTML({
              titulo: "🎾 ¡Partido confirmado!",
              saludo: `Hola <strong>${jugador.firstName || "jugador"}</strong>,`,
              descripcion: `El partido en <strong>${match.Club.name}</strong> ya se encuentra completo.`,
              detalles: [
                { label: "📆 Día", valor: formatearFechaDDMMYYYY(match.date) },
                { label: "⏰ Hora", valor: `${match.startTime} - ${match.endTime}` },
                { label: "🏟️ Cancha", valor: match.court },
              ],
              footer: "¡Nos vemos en la cancha!",
            }),
          });
        }
        
      }

      // 🔔 Notificación si el partido queda con 3 jugadores
      if (updatedMatch.players === 3 && match.categoria !== null) {
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
              saludo: `Hola <strong>${user.firstName || "jugador"}</strong>,`,
              descripcion: `Hay un lugar disponible en un partido que coincide con tu nivel.`,
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

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al unirse al partido:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
