'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link href="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
            <span className="logo-icon">🚽</span>
            <span className="logo-text">Restroom<span className="logo-highlight">Reviewer</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="navbar-menu-desktop">
            {user ? (
              <div className="navbar-user-menu">
                <span className="welcome-text">
                  <span className="welcome-emoji">👋</span>
                  {user.name || user.email}
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                </span>
                
                {user.isAdmin && (
                  <Link href="/admin" className="nav-link" style={{ textDecoration: 'none' }}>
                    <span className="nav-icon">📊</span>
                    Dashboard
                  </Link>
                )}
                
                <button onClick={handleLogout} className="btn-logout">
                  <span className="btn-icon">🚪</span>
                  Logout
                </button>
              </div>
            ) : (
              <div className="navbar-auth-menu">
                <Link href="/login" className="nav-link" style={{ textDecoration: 'none' }}>
                  <span className="nav-icon">🔐</span>
                  Login
                </Link>
                <Link href="/register" className="btn-register" style={{ textDecoration: 'none' }}>
                  <span className="btn-icon">✨</span>
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <div className="mobile-menu-content">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {user.name ? user.name[0].toUpperCase() : '👤'}
                </div>
                <div className="mobile-user-details">
                  <span className="mobile-user-name">{user.name || 'User'}</span>
                  <span className="mobile-user-email">{user.email}</span>
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                </div>
              </div>
              
              <div className="mobile-menu-links">
                {user.isAdmin && (
                  <Link href="/admin" className="mobile-link" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <span className="mobile-link-icon">📊</span>
                    Admin Dashboard
                  </Link>
                )}
                
                <button onClick={handleLogout} className="mobile-link logout" style={{ textDecoration: 'none' }}>
                  <span className="mobile-link-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-menu-content">
              <div className="mobile-menu-links">
                <Link href="/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <span className="mobile-link-icon">🔐</span>
                  Login
                </Link>
                <Link href="/register" className="mobile-link register" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <span className="mobile-link-icon">✨</span>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden under navbar */}
      <div className="navbar-spacer"></div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
          padding: 1rem 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .navbar-scrolled {
          padding: 0.5rem 0;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .navbar-spacer {
          height: 80px; /* Same as navbar height */
          width: 100%;
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Logo */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .logo-icon {
          font-size: 2rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .logo-text {
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-left: 0.25rem;
        }

        /* Desktop Menu */
        .navbar-menu-desktop {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .navbar-menu-desktop {
            display: none;
          }
        }

        .navbar-user-menu {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .navbar-auth-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4a5568;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateY(-2px);
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .welcome-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1.5rem;
          border-radius: 2rem;
          font-weight: 500;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .welcome-emoji {
          font-size: 1.2rem;
          animation: wave 2s infinite;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }

        .admin-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.7rem;
          font-weight: 600;
          margin-left: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-register {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.6rem 1.8rem;
          border-radius: 2rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          border: none;
          cursor: pointer;
        }

        .btn-register:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
          color: white;
          padding: 0.6rem 1.5rem;
          border-radius: 2rem;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(245, 101, 101, 0.4);
        }

        .btn-logout:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 101, 101, 0.6);
        }

        .btn-icon {
          font-size: 1.1rem;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 2rem;
          height: 2rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          z-index: 10;
        }

        .mobile-menu-btn span {
          width: 2rem;
          height: 0.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: all 0.3s linear;
          position: relative;
          transform-origin: 1px;
        }

        .mobile-menu-btn.active span:first-child {
          transform: rotate(45deg);
        }

        .mobile-menu-btn.active span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-btn.active span:nth-child(3) {
          transform: rotate(-45deg);
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 999;
          padding: 5rem 2rem 2rem;
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 1.5rem;
        }

        .mobile-user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
        }

        .mobile-user-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-user-name {
          font-weight: 600;
          color: #2d3748;
        }

        .mobile-user-email {
          font-size: 0.85rem;
          color: #718096;
        }

        .mobile-menu-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          color: #4a5568;
          font-weight: 500;
          transition: all 0.3s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 1rem;
        }

        .mobile-link:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateX(10px);
        }

        .mobile-link.register {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .mobile-link.logout:hover {
          background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
        }

        .mobile-link-icon {
          font-size: 1.3rem;
        }
      `}</style>
    </>
  )
}