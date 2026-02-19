import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Count users to verify data exists
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      users: userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}