import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request, { params }) {
  try {
    // Get the id from params
    const id = params.id
    const { action } = await request.json()

    console.log('Processing suggestion:', { id, action })

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find the suggestion
    const suggestion = await prisma.suggestion.findUnique({
      where: { id }
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Create place from suggestion
      const place = await prisma.place.create({
        data: {
          name: suggestion.name,
          description: suggestion.description || '',
          latitude: suggestion.latitude,
          longitude: suggestion.longitude,
          address: suggestion.address || '',
          city: suggestion.city || 'Davao City',
          district: suggestion.district,
          barangay: suggestion.barangay,
          category: suggestion.category || 'Public',
          status: 'active'
        }
      })

      // Update suggestion status
      await prisma.suggestion.update({
        where: { id },
        data: { status: 'approved' }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Suggestion approved',
        place 
      })
    } 
    
    if (action === 'reject') {
      await prisma.suggestion.update({
        where: { id },
        data: { status: 'rejected' }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Suggestion rejected' 
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error processing suggestion:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}