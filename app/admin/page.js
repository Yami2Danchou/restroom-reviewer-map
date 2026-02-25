'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  })
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    fetchPendingPlaces()
  }, [])

  const fetchPendingPlaces = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/pending')
      const data = await res.json()
      
      console.log('Fetched pending places:', data)
      
      // Ensure data is an array
      const placesArray = Array.isArray(data) ? data : []
      setPendingPlaces(placesArray)
      
      // Calculate stats
      setStats({
        total: placesArray.length,
        pending: placesArray.filter(p => p.status === 'pending').length,
        approved: placesArray.filter(p => p.status === 'approved').length,
        rejected: placesArray.filter(p => p.status === 'rejected').length
      })
    } catch (error) {
      console.error('Failed to fetch pending places:', error)
      setError('Failed to load suggestions. Please try again.')
      setPendingPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action) => {
  try {
    const res = await fetch(`/api/admin/pending/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })

    const data = await res.json()
    
    if (res.ok && data.success) {
      alert(`✅ Suggestion ${action}ed successfully!`)
      fetchPendingPlaces()
    } else {
      alert(data.error || `Failed to ${action} suggestion`)
    }
  } catch (error) {
    console.error(`Failed to ${action} suggestion:`, error)
    alert(`Failed to ${action} suggestion: ${error.message}`)
  }
}
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
        <button
          onClick={fetchPendingPlaces}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        👑 Admin Dashboard
      </h1>
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: '#fef3c7',
          padding: '1.5rem',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '0.5rem' }}>
            ⏳ Pending
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#92400e' }}>
            {stats.pending}
          </p>
        </div>
        <div style={{
          background: '#d1fae5',
          padding: '1.5rem',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '0.5rem' }}>
            ✅ Approved
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#065f46' }}>
            {stats.approved}
          </p>
        </div>
        <div style={{
          background: '#fee2e2',
          padding: '1.5rem',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#991b1b', marginBottom: '0.5rem' }}>
            ❌ Rejected
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#991b1b' }}>
            {stats.rejected}
          </p>
        </div>
        <div style={{
          background: '#e2e8f0',
          padding: '1.5rem',
          borderRadius: '1rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '0.9rem', color: '#2d3748', marginBottom: '0.5rem' }}>
            📊 Total
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d3748' }}>
            {stats.total}
          </p>
        </div>
      </div>

      {/* Pending Approvals */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          📝 Guest Suggestions Pending Approval
        </h2>
        
        {stats.pending === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
            No pending suggestions to review
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingPlaces
              .filter(p => p.status === 'pending')
              .map((place) => (
                <div 
                  key={place.id} 
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    background: '#f9fafb'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        marginBottom: '0.5rem',
                        color: '#2d3748'
                      }}>
                        {place.name}
                      </h3>
                      
                      {place.description && (
                        <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
                          {place.description}
                        </p>
                      )}
                      
                      <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '500' }}>📍 Address:</span> {place.address || 'No address provided'}
                      </p>
                      
                      <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '500' }}>🗺️ Location:</span> {place.city || 'Davao City'}
                        {place.district && `, ${place.district}`}
                        {place.barangay && `, ${place.barangay}`}
                      </p>
                      
                      <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '500' }}>📐 Coordinates:</span> {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '0.75rem',
                        fontSize: '0.85rem',
                        color: '#718096'
                      }}>
                        <span>
                          👤 By: {place.user?.name || place.user?.email || 'Anonymous'}
                        </span>
                        <span>
                          📅 {new Date(place.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleAction(place.id, 'approve')}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '0.6rem 1.5rem',
                          borderRadius: '2rem',
                          border: 'none',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#059669'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#10b981'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleAction(place.id, 'reject')}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          padding: '0.6rem 1.5rem',
                          borderRadius: '2rem',
                          border: 'none',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#dc2626'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#ef4444'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* History */}
      {(stats.approved > 0 || stats.rejected > 0) && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            📋 History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingPlaces
              .filter(p => p.status !== 'pending')
              .map((place) => (
                <div 
                  key={place.id} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '500', color: '#2d3748' }}>
                      {place.name}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#718096', marginLeft: '0.5rem' }}>
                      by {place.user?.name || place.user?.email || 'Anonymous'}
                    </span>
                  </div>
                  <span style={{
                    padding: '0.25rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: place.status === 'approved' ? '#d1fae5' : '#fee2e2',
                    color: place.status === 'approved' ? '#065f46' : '#991b1b'
                  }}>
                    {place.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}