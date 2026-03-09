'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768)
      
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768)
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError(result.data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        maxWidth: '1100px',
        width: '100%',
        background: 'white',
        borderRadius: '2rem',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.5s ease'
      }}>
        {/* Left Side - Branding (Hidden on mobile) */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: isMobile ? '2rem' : '3rem',
          display: isMobile ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* ... rest of your left side content ... */}
          <div style={{
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)',
            animation: 'rotate 20s linear infinite'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center' }}>
            <div style={{
              fontSize: '6rem',
              marginBottom: '1rem',
              animation: 'float 3s ease-in-out infinite'
            }}>🚽</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Welcome Back!
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
              Find the cleanest restrooms near you
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'left',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              padding: '2rem',
              borderRadius: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <span>Real reviews from real people</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🌡️</span>
                <span>Smell level tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🗺️</span>
                <span>Interactive map</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          flex: 1,
          padding: isMobile ? '2rem' : '3rem',
          background: 'white'
        }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* Mobile Header */}
            {isMobile && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '0.5rem'
                }}>🚽</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#667eea' }}>
                  Welcome Back!
                </h2>
              </div>
            )}

            {/* ... rest of your form content ... */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: isMobile ? '2rem' : '2.5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Sign In
              </h1>
              <p style={{ color: '#718096', fontSize: '0.95rem' }}>
                New here?{' '}
                <Link href="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                  Create an account
                </Link>
              </p>
            </div>

            {error && (
              <div style={{
                background: '#fff5f5',
                borderLeft: '4px solid #f56565',
                color: '#c53030',
                padding: '1rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem'
              }}>
                <span> </span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span> </span>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.8rem' : '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#f7fafc',
                    WebkitAppearance: 'none'
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span> </span>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.8rem' : '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#f7fafc',
                    WebkitAppearance: 'none'
                  }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: isMobile ? '0.9rem' : '1rem',
                  border: 'none',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {loading ? (
                  <span style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    <span> </span>
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}