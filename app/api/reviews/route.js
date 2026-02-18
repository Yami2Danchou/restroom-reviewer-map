import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authMiddleware } from '@/app/lib/middleware'

async function handler(req) {
  try {
    const { placeId, rating, comment, smellLevel } = await req.json()

    if (!placeId || !rating || !smellLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        smellLevel,
        placeId,
        userId: req.user.id,
      },
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

    return NextResponse.json(review)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)