'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './context/AuthContext'

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
      setPlaces(data)
    } catch (error) {
      console.error('Failed to fetch places:', error)
    }
  }

  const handleMapClick = (latlng) => {
    if (!user) {
      alert('Please login to suggest a new restroom')
      return
    }
    setSelectedPosition(latlng)
    setShowAddForm(true)
    setSelectedPlace(null)
  }

  const handlePlaceSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPosition) return

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
        alert('✅ Restroom submitted for approval!')
        setShowAddForm(false)
        setSelectedPosition(null)
        setFormData({ name: '', description: '', address: '' })
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit restroom')
      }
    } catch (error) {
      console.error('Failed to submit:', error)
      alert('Failed to submit restroom')
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

  const getSmellLevelClass = (level) => {
    if (level <= 3) return 'smell-fresh'
    if (level <= 7) return 'smell-moderate'
    return 'smell-strong'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🚽 Davao City Restroom Finder</h1>
          <p className="card-subtitle">
            Find and review restrooms in Davao City {!user && '(login required to add)'}
          </p>
        </div>
        <div className="stats-badge">
          <span className="stat-badge">{places.length} Restrooms in Davao City</span>
        </div>
      </div>

      {/* Map Container - Bigger height */}
      <div className="card p-4">
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
            📍 Davao City Map
          </h2>
          <span style={{ background: '#e2e8f0', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem' }}>
            Click anywhere to add a restroom
          </span>
        </div>
        <Map
          places={places}
          onMapClick={handleMapClick}
          selectedPosition={selectedPosition}
          height="600px" // Increased map height
        />
      </div>

      {/* Add New Restroom Form */}
      {showAddForm && user && (
        <div className="card">
          <h2 className="card-title text-2xl mb-6">📍 Suggest New Restroom in Davao City</h2>
          <form onSubmit={handlePlaceSubmit} className="space-y-4">
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
                placeholder="Describe the restroom facilities, cleanliness, accessibility, etc."
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Address in Davao City</label>
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
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <h2 className="card-title text-2xl">{selectedPlace.name}</h2>
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

          {/* Reviews Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span style={{ marginRight: '0.5rem' }}>⭐</span> Reviews
              <span className="stat-badge" style={{ marginLeft: '1rem' }}>
                {selectedPlace.reviews?.length || 0} Reviews
              </span>
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

          {/* Add Review Form */}
          {user && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">📝 Add Your Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
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
                    placeholder="Share your experience... Was it clean? Busy? Accessible?"
                  />
                </div>

                <button type="submit" className="btn btn-success">
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}