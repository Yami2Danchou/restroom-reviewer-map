import { verifyToken } from './auth'
import cookie from 'cookie'

export const authMiddleware = (handler) => {
  return async (req, res) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || '')
      const token = cookies.token

      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const user = verifyToken(token)
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' })
    }
  }
}

export const adminMiddleware = (handler) => {
  return async (req, res) => {
    try {
      const cookies = cookie.parse(req.headers.cookie || '')
      const token = cookies.token

      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const user = verifyToken(token)
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' })
      }

      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Authentication failed' })
    }
  }
}