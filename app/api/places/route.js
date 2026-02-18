import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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