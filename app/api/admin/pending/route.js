import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { adminMiddleware } from '@/app/lib/middleware'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getHandler(req) {
  try {
    const pendingPlaces = await prisma.suggestion.findMany({
      where: { 
        status: 'pending' 
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
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Always return an array
    return NextResponse.json(pendingPlaces || [])
  } catch (error) {
    console.error('Failed to fetch pending places:', error)
    return NextResponse.json({ error: 'Failed to fetch pending places' }, { status: 500 })
  }
}

export const GET = adminMiddleware(getHandler)