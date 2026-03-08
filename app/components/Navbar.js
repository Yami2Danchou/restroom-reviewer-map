'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1100,
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          display: window.innerWidth <= 768 ? 'flex' : 'none'
        }}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? '80px' : '280px',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1000,
        overflowY: 'auto',
        overflowX: 'hidden',
        '@media (max-width: 768px)': {
          position: 'fixed',
          left: mobileOpen ? 0 : '-100%',
          transition: 'left 0.3s ease',
          width: '280px'
        }
      }}>
        {/* Collapse Button (Desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '20px',
            width: '24px',
            height: '24px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            zIndex: 1001,
            '@media (max-width: 768px)': {
              display: 'none'
            }
          }}
        >
          {collapsed ? '→' : '←'}
        </button>

        {/* Logo */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #eee',
          textAlign: collapsed ? 'center' : 'left'
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: collapsed ? '24px' : '28px' }}>
              🚽
            </span>
            {!collapsed && (
              <span style={{
                marginLeft: '10px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '18px'
              }}>
                Restroom Reviewer
              </span>
            )}
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #eee',
            background: '#f8f9fa'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              {!collapsed && (
                <div>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    {user.email}
                  </div>
                  {user.isAdmin && (
                    <span style={{
                      background: '#d1fae5',
                      color: '#065f46',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      marginTop: '4px',
                      display: 'inline-block'
                    }}>
                      Admin
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          <NavLink href="/" icon="🗺️" label="Map" collapsed={collapsed} />
          <NavLink href="/nearby" icon="📍" label="Nearby" collapsed={collapsed} />
          
          {user?.isAdmin && (
            <NavLink href="/admin" icon="👑" label="Admin Dashboard" collapsed={collapsed} />
          )}
        </div>

        {/* Auth Buttons */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee'
        }}>
          {user ? (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: collapsed ? '12px' : '12px 20px',
                background: '#fee2e2',
                border: 'none',
                borderRadius: '8px',
                color: '#dc2626',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
              onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
            >
              <span>🚪</span>
              {!collapsed && 'Logout'}
            </button>
          ) : (
            <>
              <NavLink href="/login" icon="🔐" label="Login" collapsed={collapsed} />
              <NavLink href="/register" icon="✨" label="Sign Up" collapsed={collapsed} highlight />
            </>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}
    </>
  )
}

// NavLink Component
function NavLink({ href, icon, label, collapsed, highlight }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: collapsed ? '15px 0' : '12px 20px',
        margin: '4px 10px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: highlight ? 'white' : '#4a5568',
        background: highlight ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
        transition: 'all 0.2s',
        justifyContent: collapsed ? 'center' : 'flex-start'
      }}
      onMouseEnter={e => {
        if (!highlight) {
          e.currentTarget.style.background = '#edf2f7'
        }
      }}
      onMouseLeave={e => {
        if (!highlight) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      {!collapsed && <span style={{ fontWeight: '500' }}>{label}</span>}
    </Link>
  )
}