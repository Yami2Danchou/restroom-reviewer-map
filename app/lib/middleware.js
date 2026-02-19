import { verifyToken } from './auth'
import { NextResponse } from 'next/server'
import cookie from 'cookie'

export const authMiddleware = (handler) => {
  return async (req) => {
    try {
      const cookies = cookie.parse(req.headers.get('cookie') || '')
      const token = cookies.token

      if (!token) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      // Add user to request
      req.user = user
      return handler(req)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

export const adminMiddleware = (handler) => {
  return async (req) => {
    try {
      const cookies = cookie.parse(req.headers.get('cookie') || '')
      const token = cookies.token

      if (!token) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }

      if (!user.isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      req.user = user
      return handler(req)
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}