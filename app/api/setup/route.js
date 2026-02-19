import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { hashPassword } from '@/app/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if we're in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Setup only available in production' }, { status: 403 })
    }

    const results = []

    // Create admin user
    const adminEmail = 'admin@example.com'
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })
    
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: await hashPassword('admin123'),
          name: 'Admin User',
          isAdmin: true
        }
      })
      results.push('Admin user created')
    }

    // Create guest user
    const guestEmail = 'guest@example.com'
    let guest = await prisma.user.findUnique({ where: { email: guestEmail } })
    
    if (!guest) {
      guest = await prisma.user.create({
        data: {
          email: guestEmail,
          password: await hashPassword('guest123'),
          name: 'Guest User',
          isAdmin: false
        }
      })
      results.push('Guest user created')
    }

    return NextResponse.json({
      success: true,
      message: 'Setup completed',
      results,
      users: {
        admin: admin ? 'exists/created' : 'failed',
        guest: guest ? 'exists/created' : 'failed'
      }
    })
  } catch (error) {
    console.error('Setup failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}