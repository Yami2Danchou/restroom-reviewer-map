import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { adminMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'

// GET a single place
async function getHandler(req, { params }) {
  try {
    const id = params.id

    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        photos: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true
          }
        }
      }
    })

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(place)
  } catch (error) {
    console.error('Failed to fetch place:', error)
    return NextResponse.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    )
  }
}

// UPDATE a place
async function putHandler(req, { params }) {
  try {
    const id = params.id
    const { name, description, address, latitude, longitude, city, district, barangay, category } = await req.json()

    const place = await prisma.place.update({
      where: { id },
      data: {
        name,
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        city,
        district,
        barangay,
        category,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Place updated successfully',
      place 
    })
  } catch (error) {
    console.error('Failed to update place:', error)
    return NextResponse.json(
      { error: 'Failed to update place' },
      { status: 500 }
    )
  }
}

// DELETE a place
async function deleteHandler(req, { params }) {
  try {
    const id = params.id
    console.log('Attempting to delete place with ID:', id)

    // Delete related photos first
    await prisma.photo.deleteMany({
      where: { placeId: id }
    })

    // Delete related reviews
    await prisma.review.deleteMany({
      where: { placeId: id }
    })

    // Delete the place
    await prisma.place.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Place deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete place:', error)
    return NextResponse.json(
      { error: 'Failed to delete place: ' + error.message },
      { status: 500 }
    )
  }
}

// Export the handlers with the correct signature for Next.js App Router
export const GET = adminMiddleware(getHandler)
export const PUT = adminMiddleware(putHandler)
export const DELETE = adminMiddleware(deleteHandler)