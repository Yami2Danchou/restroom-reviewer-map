import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { authMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'

async function handler(req) {
  try {
    const { 
      name, 
      description, 
      latitude, 
      longitude, 
      address, 
      city, 
      district, 
      barangay, 
      category 
    } = await req.json()

    // Validate required fields
    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: name and location are required' },
        { status: 400 }
      )
    }

    // Validate coordinates are within Davao City
    const isInDavao = latitude >= 6.9833 && latitude <= 7.5833 && 
                     longitude >= 125.2333 && longitude <= 125.6833
    
    if (!isInDavao) {
      return NextResponse.json(
        { error: 'Sorry, this app currently only supports restrooms in Davao City.' },
        { status: 400 }
      )
    }

    // Check for duplicate pending suggestions
    const existingPending = await prisma.suggestion.findFirst({
      where: {
        name: name,
        latitude: { gte: latitude - 0.001, lte: latitude + 0.001 },
        longitude: { gte: longitude - 0.001, lte: longitude + 0.001 },
        status: 'pending'
      }
    })

    if (existingPending) {
      return NextResponse.json(
        { error: 'A similar suggestion is already pending approval.' },
        { status: 400 }
      )
    }

    // Create suggestion
    const suggestion = await prisma.suggestion.create({
      data: {
        name,
        description: description || '',
        latitude,
        longitude,
        address: address || '',
        city: city || 'Davao City',
        district: district || null,
        barangay: barangay || null,
        category: category || null,
        status: 'pending',
        userId: req.user.id
      },
      include: {
        user: {
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
      message: 'Your suggestion has been submitted for admin approval!',
      suggestion 
    })
  } catch (error) {
    console.error('Failed to submit suggestion:', error)
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A similar suggestion already exists.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to submit suggestion. Please try again.' },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)