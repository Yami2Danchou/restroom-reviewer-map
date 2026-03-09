'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import EditPlaceModal from '../components/EditPlaceModal'

export default function AdminPage() {
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [allPlaces, setAllPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('pending') // 'pending', 'all', 'stats'
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byCategory: {},
    byDistrict: {}
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
    fetchAllPlaces()
  }, [])

  const fetchPendingPlaces = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/pending')
      const data = await res.json()
      
      const placesArray = Array.isArray(data) ? data : []
      setPendingPlaces(placesArray)
      
      setStats(prev => ({
        ...prev,
        pending: placesArray.filter(p => p.status === 'pending').length,
        approved: placesArray.filter(p => p.status === 'approved').length,
        rejected: placesArray.filter(p => p.status === 'rejected').length
      }))
    } catch (error) {
      console.error('Failed to fetch pending places:', error)
      setError('Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPlaces = async () => {
    try {
      const res = await fetch('/api/places')
      const data = await res.json()
      
      const placesArray = Array.isArray(data) ? data : []
      setAllPlaces(placesArray)
      
      // Calculate category stats
      const byCategory = {}
      const byDistrict = {}
      
      placesArray.forEach(place => {
        const category = place.category || 'Uncategorized'
        byCategory[category] = (byCategory[category] || 0) + 1
        
        const district = place.district || 'Unknown'
        byDistrict[district] = (byDistrict[district] || 0) + 1
      })
      
      setStats(prev => ({
        ...prev,
        total: placesArray.length,
        byCategory,
        byDistrict
      }))
    } catch (error) {
      console.error('Failed to fetch places:', error)
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
        fetchAllPlaces() // Refresh all places list
      } else {
        alert(data.error || `Failed to ${action} suggestion`)
      }
    } catch (error) {
      console.error(`Failed to ${action} suggestion:`, error)
      alert(`Failed to ${action} suggestion`)
    }
  }

  const handleEditPlace = (place) => {
    setSelectedPlace(place)
    setShowEditModal(true)
  }

  const handlePlaceUpdated = (updatedPlace) => {
    if (updatedPlace === null) {
      // Place was deleted
      fetchAllPlaces()
    } else {
      // Place was updated
      setAllPlaces(prev => 
        prev.map(p => p.id === updatedPlace.id ? updatedPlace : p)
      )
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Mall': '🏬',
      'Park': '🌳',
      'Market': '🏪',
      'Airport': '✈️',
      'Terminal': '🚌',
      'Restaurant': '🍽️',
      'Hotel': '🏨',
      'Hospital': '🏥',
      'Public': '🚾'
    }
    return icons[category] || '📍'
  }

  if (loading && activeTab !== 'all') {
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
          borderTop: '3px solid #667eea',
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

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: window.innerWidth <= 768 ? '1rem' : '2rem' 
    }}>
      <h1 style={{ 
        fontSize: window.innerWidth <= 768 ? '1.8rem' : '2rem', 
        fontWeight: 'bold', 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        👑 Admin Dashboard
      </h1>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '2rem',
            border: 'none',
            background: activeTab === 'pending' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
            color: activeTab === 'pending' ? 'white' : '#374151',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
          }}
        >
          ⏳ Pending ({stats.pending})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '2rem',
            border: 'none',
            background: activeTab === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
            color: activeTab === 'all' ? 'white' : '#374151',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
          }}
        >
          🗺️ All Places ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '2rem',
            border: 'none',
            background: activeTab === 'stats' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
            color: activeTab === 'stats' ? 'white' : '#374151',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem'
          }}
        >
          📊 Statistics
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {error}
          <button
            onClick={fetchPendingPlaces}
            style={{
              marginLeft: '1rem',
              background: '#991b1b',
              color: 'white',
              border: 'none',
              padding: '0.3rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: window.innerWidth <= 768 ? '1rem' : '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
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
                      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                      justifyContent: 'space-between', 
                      alignItems: window.innerWidth <= 768 ? 'stretch' : 'flex-start',
                      gap: '1rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: '600', 
                          marginBottom: '0.5rem',
                          color: '#2d3748'
                        }}>
                          {getCategoryIcon(place.category)} {place.name}
                        </h3>
                        
                        {place.description && (
                          <p style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
                            {place.description}
                          </p>
                        )}
                        
                        <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>📍</span> {place.address || 'No address'}
                        </p>
                        
                        <p style={{ color: '#718096', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '500' }}>🗺️</span> {place.city || 'Davao City'}
                          {place.district && `, ${place.district}`}
                          {place.barangay && `, ${place.barangay}`}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          marginTop: '0.75rem',
                          fontSize: '0.85rem',
                          color: '#718096',
                          flexWrap: 'wrap'
                        }}>
                          <span>👤 By: {place.user?.name || place.user?.email || 'Anonymous'}</span>
                          <span>📅 {new Date(place.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.75rem',
                        flexDirection: window.innerWidth <= 768 ? 'row' : 'column',
                        justifyContent: window.innerWidth <= 768 ? 'space-between' : 'flex-start'
                      }}>
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
                            width: window.innerWidth <= 768 ? '48%' : '100%'
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
                            width: window.innerWidth <= 768 ? '48%' : '100%'
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
      )}

      {/* All Places Tab */}
      {activeTab === 'all' && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: window.innerWidth <= 768 ? '1rem' : '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            🗺️ All Restrooms ({stats.total})
          </h2>
          
          {allPlaces.length === 0 ? (
            <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
              No restrooms found
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {allPlaces.map((place) => (
                <div 
                  key={place.id} 
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    display: 'flex',
                    flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.25rem'
                    }}>
                      <h3 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        margin: 0
                      }}>
                        {getCategoryIcon(place.category)} {place.name}
                      </h3>
                      {place.createdBy?.isAdmin && (
                        <span style={{
                          background: '#d1fae5',
                          color: '#065f46',
                          padding: '0.2rem 0.8rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Admin
                        </span>
                      )}
                    </div>
                    
                    <p style={{ color: '#718096', fontSize: '0.9rem', margin: '0.25rem 0' }}>
                      📍 {place.address || 'No address'} • ⭐ {place.reviews?.length > 0 
                        ? (place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length).toFixed(1)
                        : 'No reviews'}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.8rem',
                      color: '#718096',
                      marginTop: '0.25rem'
                    }}>
                      <span>📝 {place.reviews?.length || 0} reviews</span>
                      <span>📸 {place.photos?.length || 0} photos</span>
                      <span>📅 {new Date(place.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEditPlace(place)}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '2rem',
                      border: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      width: window.innerWidth <= 768 ? '100%' : 'auto',
                      alignSelf: window.innerWidth <= 768 ? 'stretch' : 'center'
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: window.innerWidth <= 768 ? '1rem' : '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            📊 System Statistics
          </h2>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '1px solid #fbbf24'
            }}>
              <h3 style={{ fontSize: '0.9rem', color: '#92400e', marginBottom: '0.5rem' }}>
                ⏳ Pending
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                {stats.pending}
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              padding: '1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '1px solid #6ee7b7'
            }}>
              <h3 style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '0.5rem' }}>
                ✅ Approved
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>
                {stats.approved}
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              padding: '1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '1px solid #fca5a5'
            }}>
              <h3 style={{ fontSize: '0.9rem', color: '#991b1b', marginBottom: '0.5rem' }}>
                ❌ Rejected
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }}>
                {stats.rejected}
              </p>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
              padding: '1.5rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '1px solid #94a3b8'
            }}>
              <h3 style={{ fontSize: '0.9rem', color: '#2d3748', marginBottom: '0.5rem' }}>
                📊 Total
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748' }}>
                {stats.total}
              </p>
            </div>
          </div>

          {/* Category Distribution */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
              🏷️ Category Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{ width: '120px', fontWeight: 500 }}>{getCategoryIcon(category)} {category}</span>
                  <div style={{
                    flex: 1,
                    height: '30px',
                    background: '#e2e8f0',
                    borderRadius: '15px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(count / stats.total) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '10px',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {pendingPlaces.filter(p => p.status !== 'pending').length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>
                📋 Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pendingPlaces
                  .filter(p => p.status !== 'pending')
                  .slice(0, 5)
                  .map((place) => (
                    <div 
                      key={place.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.8rem',
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
                          by {place.user?.name || 'Anonymous'}
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
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPlace && (
        <EditPlaceModal
          place={selectedPlace}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPlace(null)
          }}
          onSave={handlePlaceUpdated}
        />
      )}
    </div>
  )
}