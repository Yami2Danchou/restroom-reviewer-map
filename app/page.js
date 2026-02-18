'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './context/AuthContext'
import AdminAddPlace from './components/AdminAddPlace'
import PhotoUpload from './components/PhotoUpload'

const Map = dynamic(() => import('./components/Map'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '600px', 
      width: '100%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      <div className="spinner"></div>
    </div>
  )
})

export default function Home() {
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
  })
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    smellLevel: 5,
  })
  const { user } = useAuth()

  // Set up callback for map popup
  useEffect(() => {
    window.selectedPlaceCallback = (place) => {
      console.log('Place selected from popup:', place)
      setSelectedPlace(place)
      setShowAddForm(false)
      setSelectedPosition(null)
    }
    return () => {
      window.selectedPlaceCallback = null
    }
  }, [])

  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
  try {
    const res = await fetch('/api/places')
    const data = await res.json()
    console.log('Fetched places:', data)
    // Ensure data is an array
    setPlaces(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Failed to fetch places:', error)
    setPlaces([]) // Set empty array on error
  }
}

  const handleMapClick = useCallback((latlng) => {
    console.log('Map click handler called:', latlng)
    if (!user) {
      alert('Please login to add or suggest restrooms')
      return
    }
    setSelectedPosition(latlng)
    setShowAddForm(true)
    setSelectedPlace(null)
  }, [user])

  const handleGuestPlaceSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPosition) {
      alert('Please select a location on the map first')
      return
    }

    try {
      const res = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
        }),
      })

      if (res.ok) {
        alert('✅ Your suggestion has been submitted for admin approval!')
        setShowAddForm(false)
        setSelectedPosition(null)
        setFormData({ name: '', description: '', address: '' })
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit suggestion')
      }
    } catch (error) {
      console.error('Failed to submit:', error)
      alert('Failed to submit suggestion')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPlace) return

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: selectedPlace.id,
          ...reviewData,
        }),
      })

      if (res.ok) {
        alert('✅ Review submitted!')
        setReviewData({ rating: 5, comment: '', smellLevel: 5 })
        fetchPlaces()
        setSelectedPlace(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      alert('Failed to submit review')
    }
  }

  const handlePlaceAdded = (newPlace) => {
    fetchPlaces()
    setShowAddForm(false)
    setSelectedPosition(null)
    setSelectedPlace(newPlace)
  }

  const getSmellLevelClass = (level) => {
    if (level <= 3) return 'smell-fresh'
    if (level <= 7) return 'smell-moderate'
    return 'smell-strong'
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🚽 Davao City Restroom Finder</h1>
          <p className="card-subtitle">
            {!user && 'Login to contribute'}
            {user && !user.isAdmin && 'Suggest restrooms for admin approval'}
            {user?.isAdmin && 'Admin: You can add places directly or approve suggestions'}
          </p>
        </div>
        <div className="stats-badge">
          <span className="stat-badge">{places.length} Restrooms in Davao City</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="card p-4">
        <div style={{ 
          marginBottom: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '0.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
            📍 Davao City Map
          </h2>
          {user ? (
            user.isAdmin ? (
              <span style={{ 
                background: '#d1fae5', 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.85rem',
                color: '#065f46',
                fontWeight: '600'
              }}>
                👑 Admin Mode - Click to add places directly
              </span>
            ) : (
              <span style={{ 
                background: '#e2e8f0', 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.85rem',
                color: '#4a5568'
              }}>
                👆 Click anywhere to suggest a restroom
              </span>
            )
          ) : (
            <span style={{ 
              background: '#fed7d7', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.85rem',
              color: '#c53030'
            }}>
              🔒 Login to add or suggest restrooms
            </span>
          )}
        </div>
        <Map
          places={places}
          onMapClick={handleMapClick}
          selectedPosition={selectedPosition}
          height="600px"
        />
      </div>

      {/* Add Form - Different for Admin vs Guest */}
      {showAddForm && user && selectedPosition && (
        user.isAdmin ? (
          <AdminAddPlace
            selectedPosition={selectedPosition}
            onPlaceAdded={handlePlaceAdded}
            onCancel={() => {
              setShowAddForm(false)
              setSelectedPosition(null)
            }}
          />
        ) : (
          <div className="card" style={{ border: '3px solid #fbbf24' }}>
            <h2 className="card-title text-2xl mb-6">📝 Suggest Restroom for Approval</h2>
            <div style={{
              background: '#fef3c7',
              padding: '1rem',
              borderRadius: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '2rem' }}>📍</span>
              <div>
                <p style={{ fontWeight: '600', color: '#92400e' }}>Selected Location:</p>
                <p style={{ fontSize: '0.9rem', color: '#b45309' }}>
                  Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
                </p>
              </div>
            </div>
            <form onSubmit={handleGuestPlaceSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Restroom Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g., SM Lanang Restroom"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Describe the restroom facilities..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-input"
                  placeholder="e.g., SM Lanang, Davao City"
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary">
                  Submit for Approval
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedPosition(null)
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="card-title text-2xl">{selectedPlace.name}</h2>
              {selectedPlace.createdBy?.isAdmin && (
                <span style={{
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginLeft: '0.5rem'
                }}>
                  👑 Added by Admin
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedPlace(null)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              ✕ Close
            </button>
          </div>
          
          <div className="mb-6">
            {selectedPlace.address && (
              <p className="text-gray-600 mb-2 flex items-center">
                <span style={{ marginRight: '0.5rem' }}>📍</span> {selectedPlace.address}
              </p>
            )}
            {selectedPlace.description && (
              <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedPlace.description}</p>
            )}
          </div>

          {/* Photos Section */}
          {selectedPlace.photos && selectedPlace.photos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">📸 Photos</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {selectedPlace.photos.map(photo => (
                  <div key={photo.id} style={{
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <img 
                      src={photo.url} 
                      alt="Restroom" 
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="mb-6" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            background: '#f7fafc',
            padding: '1rem',
            borderRadius: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#fbbf24' }}>⭐</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {calculateAverageRating(selectedPlace.reviews)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                Average Rating
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#48bb78' }}>👃</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {selectedPlace.reviews?.length > 0 
                  ? (selectedPlace.reviews.reduce((acc, r) => acc + r.smellLevel, 0) / selectedPlace.reviews.length).toFixed(1)
                  : 'N/A'
                }
              </div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                Avg Smell Level
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#9f7aea' }}>📝</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {selectedPlace.reviews?.length || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                Total Reviews
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span style={{ marginRight: '0.5rem' }}>💬</span> Reviews
            </h3>
            
            {selectedPlace.reviews && selectedPlace.reviews.length > 0 ? (
              <div className="space-y-4">
                {selectedPlace.reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="flex justify-between items-start mb-2">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'star-filled' : 'star-empty'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className={`smell-indicator ${getSmellLevelClass(review.smellLevel)}`}>
                        Smell: {review.smellLevel}/10
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        By: {review.user?.name || review.user?.email || 'Anonymous'}
                      </span>
                      <span className="text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                No reviews yet. Be the first to review this restroom!
              </div>
            )}
          </div>

          {/* Add Review and Photo Section */}
          {user && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">📝 Add Your Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4 mb-6">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} Star{num !== 1 ? 's' : ''} ⭐
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Smell Level: {reviewData.smellLevel}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reviewData.smellLevel}
                    onChange={(e) => setReviewData({ ...reviewData, smellLevel: parseInt(e.target.value) })}
                    className="form-range"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>🌿 Fresh</span>
                    <span>😤 Strong</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    className="form-textarea"
                    placeholder="Share your experience..."
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn btn-success">
                  Submit Review
                </button>
              </form>

              {/* Photo Upload Section */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">📸 Add Photos</h3>
                <PhotoUpload 
                  placeId={selectedPlace.id} 
                  onUploadComplete={(photo) => {
                    // Update the selected place with the new photo
                    setSelectedPlace({
                      ...selectedPlace,
                      photos: [...(selectedPlace.photos || []), photo]
                    })
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}