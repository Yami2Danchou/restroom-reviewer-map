import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { comparePassword, generateToken } from '@/app/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for:', email)

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      console.log('Invalid password for:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(user)
    
    // Set cookie - make sure settings work for both local and production
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    const { password: _, ...userWithoutPassword } = user
    console.log('Login successful for:', email)
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login successful!' 
    })
  } catch (error) {
    console.error('Login error details:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}