'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768)
      }
      
      checkMobile()
      window.addEventListener('resize', checkMobile)
      
      const handleScroll = () => {
        setScrolled(window.scrollY > 20)
      }
      window.addEventListener('scroll', handleScroll)
      
      return () => {
        window.removeEventListener('resize', checkMobile)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: scrolled ? 'rgba(255,255,255,0.98)' : 'white',
      backdropFilter: 'blur(10px)',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1400px',
        height: '100%',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ 
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            🚽 <span style={{ display: 'inline-block' }}>Restroom<span style={{ color: '#667eea' }}>Reviewer</span></span>
          </span>
        </Link>

        {/* Desktop Menu - Hidden on mobile */}
        <div style={{ 
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center', 
          gap: '1.5rem' 
        }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem' }}>{user.name || user.email}</span>
              {user.isAdmin && (
                <Link href="/admin" style={{ textDecoration: 'none', color: '#4a5568' }}>
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '2rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: 'none', color: '#4a5568' }}>
                Login
              </Link>
              <Link href="/register" style={{
                background: '#667eea',
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: '2rem'
              }}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Visible only on mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: isMobile ? 'flex' : 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && isMobile && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          background: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 999
        }}>
          {user ? (
            <>
              <div style={{ padding: '0.5rem', color: '#4a5568' }}>
                👤 {user.name || user.email}
              </div>
              {user.isAdmin && (
                <Link 
                  href="/admin" 
                  style={{ textDecoration: 'none', color: '#4a5568', padding: '0.5rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                style={{ textDecoration: 'none', color: '#4a5568', padding: '0.5rem' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                🔐 Login
              </Link>
              <Link 
                href="/register" 
                style={{
                  background: '#667eea',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginTop: '0.5rem'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                ✨ Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}