// app/api/clubs/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true }
    })
    return NextResponse.json(clubs)
  } catch (error) {
    console.error("Error al obtener los clubes:", error)
    return NextResponse.json({ error: "Error fetching clubs" }, { status: 500 })
  }
}
