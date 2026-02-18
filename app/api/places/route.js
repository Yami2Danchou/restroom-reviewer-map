import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      include: {
        reviews: true,
      },
    })
    return NextResponse.json(places)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}