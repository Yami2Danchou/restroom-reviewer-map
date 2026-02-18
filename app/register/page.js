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
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Illustration */}
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="floating-icon">✨</div>
            <h2>Join Our Community</h2>
            <p>Start discovering the best restrooms today</p>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Free forever</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Write reviews</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Suggest new locations</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-check">✓</span>
                <span>Track smell levels</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">
                Already have an account?{' '}
                <Link href="/login" className="auth-link">
                  Sign in
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
                  <span className="label-icon">👤</span>
                  Name (Optional)
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                />
                <div className="password-hint">
                  Must be at least 6 characters
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">✓</span>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="terms-agreement">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the{' '}
                  <Link href="/terms" className="terms-link">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="terms-link">Privacy Policy</Link>
                </label>
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
                    <span className="btn-icon">✨</span>
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="social-register">
              <p className="social-divider">
                <span>Or continue with</span>
              </p>
              <div className="social-buttons">
                <button className="social-btn google">
                  <span className="social-icon">G</span>
                  Google
                </button>
                <button className="social-btn github">
                  <span className="social-icon">GH</span>
                  GitHub
                </button>
              </div>
            </div>
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

        .benefits-list {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 1.5rem;
          text-align: left;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
          font-size: 1.1rem;
        }

        .benefit-check {
          background: rgba(255, 255, 255, 0.2);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
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

        .password-hint {
          font-size: 0.8rem;
          color: #a0aec0;
          margin-top: 0.25rem;
        }

        .terms-agreement {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .terms-agreement input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
        }

        .terms-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .terms-link:hover {
          text-decoration: underline;
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

        .social-register {
          margin-top: 2rem;
        }

        .social-divider {
          position: relative;
          text-align: center;
          margin: 1rem 0;
          color: #a0aec0;
          font-size: 0.9rem;
        }

        .social-divider::before,
        .social-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background: #e2e8f0;
        }

        .social-divider::before {
          left: 0;
        }

        .social-divider::after {
          right: 0;
        }

        .social-divider span {
          background: white;
          padding: 0 1rem;
        }

        .social-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          background: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .social-btn:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .social-icon {
          font-weight: bold;
        }

        .google:hover {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }

        .github:hover {
          background: #333;
          color: white;
          border-color: #333;
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