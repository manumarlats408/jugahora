// app/api/matches/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import sendgrid from "@sendgrid/mail";
import { generarEmailHTML, formatearFechaDDMMYYYY } from "@/lib/emailUtils";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

// Define the interface to include the new fields
interface Match {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  court: string;
  players: number;
  maxPlayers: number;
  price: number;
  clubId: number;
  userId: number | null; // Nueva columna userId
  Club: {
    name: string;
    address: string | null;
  };
}

// POST: Create a new match

export async function POST(request: Request) {
  try {
    const { date, startTime, endTime, court, price, clubId, userId, players } = await request.json()

    if (!date || !startTime || !endTime || !court || !clubId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const matchPrice = price !== undefined ? price : 0
    const jugadores = userId ? [userId, ...(Array.isArray(players) ? players : [])] : []

    const baseData: Prisma.Partidos_clubCreateInput = {
      date: new Date(date),
      startTime,
      endTime,
      court,
      players: jugadores.length,
      maxPlayers: 4,
      price: matchPrice,
      usuarios: jugadores,
      mail24h: false,
      mail12h: false,
      Club: { connect: { id: parseInt(clubId) } },
    }

    if (userId) {
      // Verificar si el jugador está abonado al club
      const esAbonado = await prisma.jugadorAbonado.findFirst({
        where: {
          userId,
          clubId: parseInt(clubId),
        },
      });

      if (!esAbonado) {
        return NextResponse.json(
          { error: 'Solo podés crear partidos en clubes donde estés abonado. Si realmente tenes abono, hablá con el club para que te habilite.' },
          { status: 403 }
        );
      }

      // Obtener nivel del jugador
      const jugador = await prisma.user.findUnique({
        where: { id: userId },
        select: { nivel: true, genero: true },
      });

      if (!jugador?.nivel) {
        return NextResponse.json(
          { error: 'Tu perfil no tiene un nivel asignado. Por favor actualizalo antes de crear un partido.' },
          { status: 400 }
        );
      }

      baseData.User = { connect: { id: userId } };
      baseData.categoria = jugador.nivel.toString();
      if (jugador.genero) {
        baseData.genero = jugador.genero;
      }
    }

    const newMatch = await prisma.partidos_club.create({ data: baseData });

    // 🔔 Notificar si el partido arranca con 3 jugadores
    if (newMatch.players === 3 && newMatch.categoria ) {
      try {
        const usuariosNivel = await prisma.user.findMany({
          where: {
            nivel: newMatch.categoria,
            NOT: { id: { in: newMatch.usuarios } },
          },
          select: { email: true, firstName: true },
        });

        const club = await prisma.club.findUnique({
          where: { id: newMatch.clubId },
          select: { name: true },
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
              titulo: `🎾 ¡Un partido de categoría ${newMatch.categoria} necesita un jugador!`,
              saludo: `Hola <strong>${user.firstName || "jugador"}</strong>,`,
              descripcion: "Hay un lugar disponible en un partido que coincide con tu nivel.",
              detalles: [
                { label: "📍 Club", valor: club?.name || "Club" },
                { label: "📆 Día", valor: formatearFechaDDMMYYYY(newMatch.date) },
                { label: "⏰ Hora", valor: `${newMatch.startTime} - ${newMatch.endTime}` },
                { label: "🏟️ Cancha", valor: newMatch.court },
              ],
              footer: "¡Unite desde la plataforma antes de que se llene!",
            }),
          });
        }
      } catch (error) {
        console.error("Error al enviar notificaciones de partido con 3 jugadores:", error);
      }
    }

    return NextResponse.json(newMatch)
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Error creating match' }, { status: 500 })
  }
}

// GET: Retrieve matches
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get('clubId');

  const userId = searchParams.get('userId')

  if (userId) {
    const matches = await prisma.partidos_club.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        Club: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  
    const formattedMatches = matches.map((match) => ({
      ...match,
      nombreClub: match.Club?.name || 'Club',
      direccionClub: match.Club?.address || '',
      clubId: match.clubId,
    }));
  
    return NextResponse.json(formattedMatches);
  }  

  try {
    if (clubId) {
      const matches = await prisma.partidos_club.findMany({
        where: {
          clubId: parseInt(clubId),
        },
        orderBy: {
          date: 'asc',
        },
      });
      return NextResponse.json(matches);
    } else {
      const matches = await prisma.partidos_club.findMany({
        include: {
          Club: {
            select: {
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      const formattedMatches = matches.map((match: Match) => ({
        ...match,
        nombreClub: match.Club.name,
        direccionClub: match.Club.address,
      }));

      return NextResponse.json(formattedMatches);
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Error fetching matches' }, { status: 500 });
  }
}
