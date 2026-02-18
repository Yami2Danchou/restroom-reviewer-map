import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { ensureDefaultUsers } from '@/app/lib/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Ensure default users exist
    await ensureDefaultUsers()
    
    return NextResponse.json({ 
      status: 'healthy',
      message: 'Application is ready'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      error: error.message 
    }, { status: 500 })
  }
}