'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './context/AuthContext'
import AdminAddPlace from './components/AdminAddPlace'
import PhotoUpload from './components/PhotoUpload'
import { getCurrentLocation, getLocationDetails, DEFAULT_LOCATION } from './lib/location'

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
      fontSize: '1.2rem',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner" style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div>Loading map...</div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
})

export default function Home() {
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [loadingLocation, setLoadingLocation] = useState(true)
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

  // Fetch places on mount
  useEffect(() => {
    fetchPlaces()
  }, [])

  // Replace the useEffect for location with this improved version
useEffect(() => {
  let isMounted = true

  const getUserLocation = async () => {
    try {
      setLoadingLocation(true)
      console.log('Attempting to get user location...')
      
      const location = await getCurrentLocation()
      console.log('Got raw location:', location)
      
      // Get detailed location information
      const details = await getLocationDetails(location.lat, location.lng)
      console.log('Location details:', details)
      
      if (isMounted) {
        setUserLocation({
          ...location,
          city: details.city,
          country: details.country,
          displayName: details.displayName,
          fullAddress: details.fullAddress
        })
        
        // Show success message
        console.log(`📍 Located in ${details.city}, ${details.country}`)
      }
    } catch (error) {
      console.warn('Location detection issue:', error.message)
      
      if (isMounted) {
        // Show a prompt or use a more intelligent default
        // For demo, we'll use a default but show a message
        setUserLocation({
          lat: 7.1907,
          lng: 125.4553,
          city: 'Davao City',
          country: 'Philippines',
          displayName: 'Davao City, Philippines',
          fullAddress: 'Davao City, Philippines'
        })
        
        // You could also show a toast notification here
        alert('📍 Using USA as default location. Please enable location services for better results.')
      }
    } finally {
      if (isMounted) {
        setLoadingLocation(false)
      }
    }
  }

  getUserLocation()

  return () => {
    isMounted = false
  }
}, [])

  // Find nearby places when location or places change
  useEffect(() => {
    if (userLocation && places.length > 0) {
      findNearbyPlaces()
    }
  }, [userLocation, places])

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/places')
      const data = await res.json()
      console.log('Fetched places:', data)
      setPlaces(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch places:', error)
      setPlaces([])
    }
  }

  const findNearbyPlaces = () => {
    if (!userLocation || !places.length) return

    const nearby = places.filter(place => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.latitude,
        place.longitude
      )
      return distance <= 5 // Within 5km
    }).sort((a, b) => {
      const distA = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        a.latitude,
        a.longitude
      )
      const distB = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        b.latitude,
        b.longitude
      )
      return distA - distB
    })

    setNearbyPlaces(nearby)
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c // Distance in km
    return d
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }

  const handleMapClick = useCallback(async (latlng) => {
    console.log('Map click handler called:', latlng)
    if (!user) {
      alert('Please login to add or suggest restrooms')
      return
    }
    
    // Get location details for the clicked point
    const details = await getLocationDetails(latlng.lat, latlng.lng)
    
    setSelectedPosition({
      ...latlng,
      city: details.city,
      country: details.country,
      displayName: details.displayName
    })
    setShowAddForm(true)
    setSelectedPlace(null)
  }, [user])

  // Handle place selection from map popup
  const handlePlaceSelect = (place) => {
    console.log('Place selected from map:', place)
    setSelectedPlace(place)
    setShowAddForm(false)
    setSelectedPosition(null)
    
    // Scroll to the place details
    setTimeout(() => {
      document.getElementById('selected-place-details')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }, 100)
  }

  const handleLocationFound = (location) => {
    setUserLocation(location)
  }

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
          city: selectedPosition.city,
          country: selectedPosition.country
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

  const getDistanceFromUser = (placeLat, placeLng) => {
    if (!userLocation) return null
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      placeLat,
      placeLng
    )
    return distance.toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">🚽 Global Restroom Finder</h1>
          <p className="card-subtitle">
            {!user && 'Login to contribute'}
            {user && !user.isAdmin && 'Click on map to suggest restrooms'}
            {user?.isAdmin && 'Admin: Add places directly or approve suggestions'}
          </p>
        </div>
        
        {/* Location Display */}
        {loadingLocation ? (
          <div style={{
            background: '#f3f4f6',
            padding: '0.75rem 1.5rem',
            borderRadius: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}>
            <div className="spinner-small" style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e2e8f0',
              borderTop: '2px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: '#4a5568' }}>Detecting your location...</span>
          </div>
        ) : userLocation && (
          <div style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            padding: '0.75rem 1.5rem',
            borderRadius: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.5rem',
            border: '1px solid #7dd3fc',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📍</span>
            <div>
              <span style={{ fontWeight: '600', color: '#0369a1' }}>
                {userLocation.city}
              </span>
              {userLocation.country && userLocation.country !== 'Unknown' && (
                <span style={{ color: '#0284c7', marginLeft: '0.25rem' }}>
                  , {userLocation.country}
                </span>
              )}
              {userLocation.accuracy && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#0284c7',
                  marginLeft: '0.5rem',
                  background: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '1rem'
                }}>
                  ±{Math.round(userLocation.accuracy)}m accuracy
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nearby Places Stats */}
      {userLocation && nearbyPlaces.length > 0 && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '1px solid #6ee7b7'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>🏪</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#065f46' }}>
                {nearbyPlaces.length} Restroom{nearbyPlaces.length !== 1 ? 's' : ''} Near You
              </h3>
              <p style={{ color: '#047857', fontSize: '0.9rem' }}>
                Within 5km of your location
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {nearbyPlaces.slice(0, 3).map((place, idx) => (
                <span 
                  key={idx} 
                  style={{
                    background: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.8rem',
                    color: '#065f46',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePlaceSelect(place)}
                >
                  {getDistanceFromUser(place.latitude, place.longitude)}km
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

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
            🗺️ Interactive Map
          </h2>
          {user ? (
            user.isAdmin ? (
              <span style={{ 
                background: '#d1fae5', 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.85rem',
                color: '#065f46',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>👑</span>
                Admin Mode - Click to add places directly
              </span>
            ) : (
              <span style={{ 
                background: '#e2e8f0', 
                padding: '0.5rem 1rem', 
                borderRadius: '2rem', 
                fontSize: '0.85rem',
                color: '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>👆</span>
                Click anywhere to suggest a restroom
              </span>
            )
          ) : (
            <span style={{ 
              background: '#fed7d7', 
              padding: '0.5rem 1rem', 
              borderRadius: '2rem', 
              fontSize: '0.85rem',
              color: '#c53030',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>🔒</span>
              Login to add or suggest restrooms
            </span>
          )}
        </div>
        <Map
          places={places}
          onMapClick={handleMapClick}
          selectedPosition={selectedPosition}
          userLocation={userLocation}
          onLocationFound={handleLocationFound}
          onPlaceSelect={handlePlaceSelect}
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
                  {selectedPosition.city || 'Unknown'}, {selectedPosition.country || 'Unknown'}
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
                  placeholder="e.g., Central Park Restroom"
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
                  placeholder="Street address, city, etc."
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
        <div id="selected-place-details" className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="card-title text-2xl">{selectedPlace.name}</h2>
              {selectedPlace.city && selectedPlace.city !== 'Unknown' && (
                <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  🏙️ {selectedPlace.city}, {selectedPlace.country || ''}
                </p>
              )}
              {userLocation && (
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#059669',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>📏</span>
                  {getDistanceFromUser(selectedPlace.latitude, selectedPlace.longitude)} km from your location
                </p>
              )}
              {selectedPlace.createdBy?.isAdmin && (
                <span style={{
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginTop: '0.5rem'
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
                  <div 
                    key={photo.id} 
                    style={{
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      aspectRatio: '1',
                      cursor: 'pointer',
                      transition: 'transform 0.2s'
                    }}
                    onClick={() => window.open(photo.url, '_blank')}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img 
                      src={photo.url} 
                      alt="Restroom" 
                      style={{
                        width: '100%',
                        height: '100%',
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
                  <div key={review.id} className="review-item" style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{
                            color: i < review.rating ? '#fbbf24' : '#d1d5db',
                            fontSize: '1.2rem',
                            marginRight: '0.1rem'
                          }}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '2rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: review.smellLevel <= 3 ? '#dcfce7' : review.smellLevel <= 7 ? '#fef3c7' : '#fee2e2',
                        color: review.smellLevel <= 3 ? '#166534' : review.smellLevel <= 7 ? '#92400e' : '#991b1b'
                      }}>
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
              <div className="alert alert-info" style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                padding: '1rem',
                borderRadius: '0.5rem'
              }}>
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
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db'
                    }}
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
                    style={{ width: '100%' }}
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
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db'
                    }}
                  />
                </div>

                <button type="submit" className="btn btn-success" style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  Submit Review
                </button>
              </form>

              {/* Photo Upload Section */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">📸 Add Photos</h3>
                <PhotoUpload 
                  placeId={selectedPlace.id} 
                  onUploadComplete={(photo) => {
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