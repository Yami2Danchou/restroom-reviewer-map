import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { adminMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'

async function handler(req) {
  try {
    const { name, description, latitude, longitude, address, city, district, barangay, category } = await req.json()

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: name and location are required' },
        { status: 400 }
      )
    }

    // Create place directly (admin only)
    const place = await prisma.place.create({
      data: {
        name,
        description: description || '',
        latitude,
        longitude,
        address: address || '',
        city: city || 'Davao City',
        district: district || null,
        barangay: barangay || null,
        category: category || 'Public',
        status: 'active',
        createdById: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Place added successfully',
      place 
    })
  } catch (error) {
    console.error('Failed to add place:', error)
    return NextResponse.json(
      { error: 'Failed to add place: ' + error.message },
      { status: 500 }
    )
  }
}

export const POST = adminMiddleware(handler)