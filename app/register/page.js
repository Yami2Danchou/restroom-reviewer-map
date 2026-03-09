'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await register(formData.email, formData.password, formData.name)
      if (result.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError(result.data.error || 'Registration failed')
      }
    } catch (err) {
      setError('An error occurred during registration')
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
        flexDirection: window.innerWidth > 768 ? 'row' : 'column',
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
          padding: window.innerWidth > 768 ? '3rem' : '2rem',
          display: window.innerWidth > 768 ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
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
            }}>✨</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Join Our Community
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
              Start discovering the best restrooms today
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
                <span style={{ fontSize: '1.5rem' }}>✓</span>
                <span>Free forever</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✓</span>
                <span>Write reviews</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>✓</span>
                <span>Suggest new locations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div style={{
          flex: 1,
          padding: window.innerWidth > 768 ? '3rem' : '2rem',
          background: 'white'
        }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* Mobile Header */}
            {window.innerWidth <= 768 && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '0.5rem'
                }}>✨</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#667eea' }}>
                  Join Our Community
                </h2>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: window.innerWidth > 768 ? '2.5rem' : '2rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Create Account
              </h1>
              <p style={{ color: '#718096', fontSize: '0.95rem' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span> </span>
                  Name (Optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: window.innerWidth > 768 ? '1rem' : '0.8rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#f7fafc',
                    WebkitAppearance: 'none'
                  }}
                  placeholder="John Doe"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.2)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f7fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span> </span>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: window.innerWidth > 768 ? '1rem' : '0.8rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#f7fafc',
                    WebkitAppearance: 'none'
                  }}
                  placeholder="you@example.com"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.2)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f7fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span> </span>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: window.innerWidth > 768 ? '1rem' : '0.8rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#f7fafc',
                    WebkitAppearance: 'none'
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.2)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f7fafc'
                  }}
                />
                <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.25rem' }}>
                  Must be at least 6 characters
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span> </span>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: window.innerWidth > 768 ? '1rem' : '0.8rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: '#f7fafc',
                    WebkitAppearance: 'none'
                  }}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.2)'
                    e.target.style.background = 'white'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = '#f7fafc'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  required 
                  style={{ 
                    width: '1.2rem', 
                    height: '1.2rem',
                    cursor: 'pointer'
                  }} 
                />
                <label htmlFor="terms" style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                  I agree to the{' '}
                  <Link href="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: window.innerWidth > 768 ? '1rem' : '0.9rem',
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
                  marginTop: '0.5rem',
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
                    Create Account
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