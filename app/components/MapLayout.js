'use client'

import { useAuth } from '../context/AuthContext'

export default function MapLayout({ 
  children, 
  sidebarContent, 
  isSidebarOpen, 
  onToggleSidebar,
  onClose,
  title = "Restroom Finder",
  showCloseButton = false
}) {
  const { user } = useAuth()

  const handleClose = () => {
    if (onClose) {
      onClose() // This will trigger navigation back to main view
    } else {
      onToggleSidebar() // Just close sidebar if no close handler
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '80px', // Height of navbar
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '400px' : '0',
        background: 'white',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '600',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            {title}
          </h2>
          {showCloseButton ? (
            <button
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(239,68,68,0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,68,68,0.4)'
              }}
            >
              <span>✕</span>
              Back to List
            </button>
          ) : (
            <button
              onClick={onToggleSidebar}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)'
              }}
            >
              <span>✕</span>
              Close
            </button>
          )}
        </div>

        {/* Sidebar Content - Scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {sidebarContent}
        </div>

        {/* User Status in Sidebar */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb'
        }}>
          {user ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: user.isAdmin ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                border: user.isAdmin ? '2px solid #10b981' : 'none'
              }}>
                {user.isAdmin ? '👑' : '👤'}
              </div>
              <div>
                <div style={{ fontWeight: '500', color: '#2d3748' }}>
                  {user.name || user.email}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                  {user.isAdmin ? 'Administrator' : 'Guest User'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#718096',
              fontSize: '0.9rem'
            }}>
              Login to add or suggest restrooms
            </div>
          )}
        </div>
      </div>

      {/* Menu Button (visible when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={onToggleSidebar}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>☰</span>
          Menu
        </button>
      )}

      {/* Main Map Area */}
      <div style={{
        flex: 1,
        position: 'relative'
      }}>
        {/* Map Container */}
        {children}
      </div>
    </div>
  )
}