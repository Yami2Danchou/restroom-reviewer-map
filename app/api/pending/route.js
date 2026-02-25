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

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: name and location are required' },
        { status: 400 }
      )
    }

    // Check if coordinates are within Davao City (rough bounds)
    const isInDavao = latitude >= 6.9 && latitude <= 7.6 && 
                     longitude >= 125.2 && longitude <= 125.7
    
    if (!isInDavao) {
      return NextResponse.json(
        { error: 'Sorry, this app currently only supports restrooms in Davao City.' },
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
        userId: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Your suggestion has been submitted for admin approval!',
      suggestion 
    })
  } catch (error) {
    console.error('Failed to submit suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to submit suggestion: ' + error.message },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handler)