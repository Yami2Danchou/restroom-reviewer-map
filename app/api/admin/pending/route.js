import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { adminMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHandler(req) {
  try {
    const pendingPlaces = await prisma.pendingPlace.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    return NextResponse.json(pendingPlaces)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pending places' },
      { status: 500 }
    )
  }
}

export const GET = adminMiddleware(getHandler)