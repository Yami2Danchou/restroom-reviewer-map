import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { comparePassword, generateToken } from '@/app/lib/auth'
import { cookies } from 'next/headers'
import { ensureDefaultUsers } from '@/app/lib/seed'

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

    // Ensure default users exist (this will run once)
    await ensureDefaultUsers()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password
    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(user)
    
    // Set cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Login successful!' 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}