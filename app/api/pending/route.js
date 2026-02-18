import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'

async function handler(req) {
  try {
    const { name, description, latitude, longitude, address } = await req.json()

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const pendingPlace = await prisma.pendingPlace.create({
      data: {
        name,
        description,
        latitude,
        longitude,
        address,
        userId: req.user.id,
      },
    })

    return NextResponse.json(pendingPlace)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit place' },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)