import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { hashPassword, generateToken } from '@/app/lib/auth'
import { cookies } from 'next/headers'
import { ensureDefaultUsers } from '@/app/lib/seed'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Check if trying to register with default admin/guest emails
    const defaultEmails = ['admin@example.com', 'guest@example.com']
    if (defaultEmails.includes(email)) {
      return NextResponse.json(
        { error: 'This email is reserved for demo accounts. Please use a different email.' },
        { status: 400 }
      )
    }

    // Ensure default users exist (this will run once)
    await ensureDefaultUsers()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        isAdmin: false
      },
    })

    // Generate token and set cookie
    const token = generateToken(user)
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Registration successful!' 
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}