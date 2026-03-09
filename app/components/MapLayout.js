'use client'

import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      onToggleSidebar()
    }
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed',
        top: '60px',
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}>
        {/* Floating Action Button for Menu */}
        <button
          onClick={onToggleSidebar}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
            color: 'white',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          ☰
        </button>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={onToggleSidebar}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1001,
                animation: 'fadeIn 0.3s ease'
              }}
            />
            
            {/* Sidebar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '85%',
              maxWidth: '350px',
              height: '100%',
              background: 'white',
              boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
              zIndex: 1002,
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease'
            }}>
              {/* Sidebar Header */}
              <div style={{
                padding: '20px 15px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'white'
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
                <button
                  onClick={handleClose}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none'
                  }}
                >
                  <span>✕</span>
                  {showCloseButton ? 'Back' : 'Close'}
                </button>
              </div>

              {/* Sidebar Content - Scrollable */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '15px',
                background: '#f9fafb'
              }}>
                {sidebarContent}
              </div>

              {/* User Status in Sidebar */}
              <div style={{
                padding: '15px',
                borderTop: '1px solid #e5e7eb',
                background: 'white'
              }}>
                {user ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      background: user.isAdmin ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      border: user.isAdmin ? '2px solid #10b981' : 'none'
                    }}>
                      {user.isAdmin ? '👑' : '👤'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {user.name || user.email}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                        {user.isAdmin ? 'Administrator' : 'Guest User'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#718096',
                    fontSize: '0.9rem',
                    padding: '5px'
                  }}>
                    Login to add or suggest restrooms
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Map Area */}
        <div style={{
          width: '100%',
          height: '100%'
        }}>
          {children}
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    )
  }

  // Desktop layout
  return (
    <div style={{
      position: 'fixed',
      top: '60px',
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
              Back
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

      {/* Desktop Toggle Button */}
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
        {children}
      </div>
    </div>
  )
}