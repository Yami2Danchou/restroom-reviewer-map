import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { adminMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function handler(req, { params }) {
  try {
    const { id } = params
    const { action } = await req.json()

    const pendingPlace = await prisma.pendingPlace.findUnique({
      where: { id },
    })

    if (!pendingPlace) {
      return NextResponse.json(
        { error: 'Pending place not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Create actual place
      const place = await prisma.place.create({
        data: {
          name: pendingPlace.name,
          description: pendingPlace.description,
          latitude: pendingPlace.latitude,
          longitude: pendingPlace.longitude,
          address: pendingPlace.address,
        },
      })

      // Update pending place status
      await prisma.pendingPlace.update({
        where: { id },
        data: { status: 'approved' },
      })

      return NextResponse.json({ message: 'Place approved', place })
    } else if (action === 'reject') {
      await prisma.pendingPlace.update({
        where: { id },
        data: { status: 'rejected' },
      })

      return NextResponse.json({ message: 'Place rejected' })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export const POST = adminMiddleware(handler)