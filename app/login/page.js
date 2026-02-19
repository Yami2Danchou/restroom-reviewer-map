'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

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
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Illustration */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="floating-icon">🚽</div>
            <h2>Welcome Back!</h2>
            <p>Find the cleanest restrooms near you</p>
            <div className="feature-list">
              <div className="feature-item">
                <span>⭐</span> Real reviews from real people
              </div>
              <div className="feature-item">
                <span>🌡️</span> Smell level tracking
              </div>
              <div className="feature-item">
                <span>🗺️</span> Interactive map
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1 className="auth-title">Sign In</h1>
              <p className="auth-subtitle">
                New here?{' '}
                <Link href="/register" className="auth-link">
                  Create an account
                </Link>
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-submit-btn"
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <span className="btn-icon">🔓</span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Removed demo credentials section */}
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .auth-container {
          display: flex;
          max-width: 1200px;
          width: 100%;
          background: white;
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.5s ease;
        }

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

        /* Left Illustration */
        .auth-illustration {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-illustration::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .illustration-content {
          position: relative;
          z-index: 1;
          color: white;
          text-align: center;
        }

        .floating-icon {
          font-size: 6rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .illustration-content h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .illustration-content p {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1.5rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1rem;
        }

        .feature-item span {
          font-size: 1.3rem;
        }

        /* Right Form */
        .auth-form-container {
          flex: 1;
          padding: 3rem;
          background: white;
        }

        .auth-form-wrapper {
          max-width: 400px;
          margin: 0 auto;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: #718096;
          font-size: 1rem;
        }

        .auth-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .auth-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .auth-error {
          background: #fff5f5;
          border-left: 4px solid #f56565;
          color: #c53030;
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #4a5568;
          font-size: 0.95rem;
        }

        .label-icon {
          font-size: 1.2rem;
        }

        .form-input {
          padding: 1rem 1.2rem;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f7fafc;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
          background: white;
        }

        .auth-submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-icon {
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .auth-illustration {
            display: none;
          }
          
          .auth-form-container {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  )
}