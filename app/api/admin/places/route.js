import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { adminMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'

async function handler(req) {
  try {
    const { name, description, latitude, longitude, address, city, country } = await req.json()

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Admin can directly create places without approval
    const place = await prisma.place.create({
      data: {
        name,
        description,
        latitude,
        longitude,
        address,
        city,
        country,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Place created successfully',
      place 
    })
  } catch (error) {
    console.error('Failed to create place:', error)
    return NextResponse.json(
      { error: 'Failed to create place' },
      { status: 500 }
    )
  }
}

export const POST = adminMiddleware(handler)