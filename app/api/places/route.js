import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const places = await prisma.place.findMany({
      include: {
        reviews: {
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
        },
        photos: {
          select: {
            id: true,
            url: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(places || [])
  } catch (error) {
    console.error('Failed to fetch places:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}