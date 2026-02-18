import { NextResponse } from 'next/server'
import { verifyToken } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = cookies().get('token')?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}