'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './context/AuthContext'
import AdminAddPlace from './components/AdminAddPlace'
import PhotoUpload from './components/PhotoUpload'
import { getCurrentLocation, getLocationDetails } from './lib/location'

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
  const [locationError, setLocationError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    category: '',
    district: '',
    barangay: ''
  })
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    smellLevel: 5,
    cleanliness: 5,
    accessibility: 5
  })
  const { user } = useAuth()

  // ===== UTILITY FUNCTIONS - Define these FIRST =====
  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
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

  // THIS MUST BE DEFINED BEFORE IT'S USED IN JSX
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

  const getSmellLevelClass = (level) => {
    if (level <= 3) return '#dcfce7'
    if (level <= 7) return '#fef3c7'
    return '#fee2e2'
  }

  const getSmellLevelText = (level) => {
    if (level <= 3) return 'Fresh'
    if (level <= 7) return 'Moderate'
    return 'Strong'
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
    return icons[category] || '🚽'
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const calculateAverageSmell = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.smellLevel, 0)
    return (sum / reviews.length).toFixed(1)
  }

  // ===== DATA FETCHING FUNCTIONS =====
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

  // ===== EVENT HANDLERS =====
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
      city: details.city || 'Davao City',
      country: details.country || 'Philippines',
      district: details.district,
      barangay: details.barangay,
      displayName: details.displayName
    })
    setShowAddForm(true)
    setSelectedPlace(null)
  }, [user])

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

  const handleNearbyPlaceClick = (place) => {
    console.log('Nearby place clicked:', place)
    
    // Set the selected place to show details
    setSelectedPlace(place)
    setShowAddForm(false)
    
    // Set selected position to highlight on map
    setSelectedPosition({
      lat: place.latitude,
      lng: place.longitude,
      city: place.city,
      district: place.district,
      barangay: place.barangay,
      country: place.country
    })
    
    // Scroll to map
    setTimeout(() => {
      document.getElementById('map-container')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
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
          name: formData.name,
          description: formData.description,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
          address: formData.address,
          city: 'Davao City',
          district: selectedPosition.district || formData.district,
          barangay: selectedPosition.barangay || formData.barangay,
          category: formData.category
        }),
      })

      const data = await res.json()
      
      if (res.ok) {
        alert('✅ Your suggestion has been submitted for admin approval!')
        setShowAddForm(false)
        setSelectedPosition(null)
        setFormData({ 
          name: '', 
          description: '', 
          address: '',
          category: '',
          district: '',
          barangay: ''
        })
      } else {
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
          rating: reviewData.rating,
          comment: reviewData.comment,
          smellLevel: reviewData.smellLevel,
          cleanliness: reviewData.cleanliness,
          accessibility: reviewData.accessibility
        }),
      })

      if (res.ok) {
        alert('✅ Review submitted!')
        setReviewData({ 
          rating: 5, 
          comment: '', 
          smellLevel: 5,
          cleanliness: 5,
          accessibility: 5
        })
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

  // ===== EFFECTS =====
  // Fetch places on mount
  useEffect(() => {
    fetchPlaces()
  }, [])

  // Get user location on mount
  useEffect(() => {
    let isMounted = true

    const getUserLocation = async () => {
      try {
        setLoadingLocation(true)
        setLocationError(null)
        console.log('Attempting to get user location...')
        
        const location = await getCurrentLocation()
        console.log('Got raw location:', location)
        
        // Get detailed location information
        const details = await getLocationDetails(location.lat, location.lng)
        console.log('Location details:', details)
        
        if (isMounted) {
          setUserLocation({
            ...location,
            city: details.city || 'Davao City',
            country: details.country || 'Philippines',
            district: details.district,
            barangay: details.barangay,
            displayName: details.displayName || 'Davao City, Philippines',
            fullAddress: details.fullAddress
          })
          
          console.log(`📍 Located in ${details.city || 'Davao City'}, ${details.country || 'Philippines'}`)
        }
      } catch (error) {
        console.warn('Location detection issue:', error.message)
        
        if (isMounted) {
          // Default to Davao City
          setUserLocation({
            lat: 7.1907,
            lng: 125.4553,
            city: 'Davao City',
            country: 'Philippines',
            district: 'Poblacion',
            displayName: 'Davao City, Philippines',
            fullAddress: 'Davao City, Philippines',
            isDefault: true
          })
          
          setLocationError('Using Davao City as default. Enable location for better results.')
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

  // ===== RENDER =====
  return (
    <div className="space-y-6" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div className="card-header">
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            🚽 Davao City Restroom Finder
          </h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            {!user && 'Login to contribute'}
            {user && !user.isAdmin && 'Click on map to suggest new restrooms'}
            {user?.isAdmin && '👑 Admin: Add places directly or approve suggestions'}
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
            gap: '0.5rem'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e2e8f0',
              borderTop: '2px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Detecting your location...</span>
          </div>
        ) : userLocation && (
          <div style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            padding: '1rem 1.5rem',
            borderRadius: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid #7dd3fc',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '2rem' }}>📍</span>
            <div>
              <span style={{ fontWeight: '600', color: '#0369a1' }}>
                {userLocation.city || 'Davao City'}
              </span>
              {userLocation.district && (
                <span style={{ color: '#0284c7', marginLeft: '0.25rem' }}>
                  , {userLocation.district}
                </span>
              )}
              {userLocation.accuracy && (
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: '#0284c7',
                  marginLeft: '1rem',
                  background: 'white',
                  padding: '0.2rem 0.8rem',
                  borderRadius: '1rem'
                }}>
                  ±{Math.round(userLocation.accuracy)}m accuracy
                </span>
              )}
            </div>
            {locationError && (
              <span style={{
                fontSize: '0.9rem',
                color: '#b45309',
                background: '#fffbeb',
                padding: '0.3rem 1rem',
                borderRadius: '2rem'
              }}>
                ⚠️ {locationError}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nearby Places Stats - UPDATED VERSION */}
      {userLocation && nearbyPlaces.length > 0 && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '1px solid #6ee7b7',
          borderRadius: '1rem',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>🏪</span>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#065f46' }}>
                {nearbyPlaces.length} Restroom{nearbyPlaces.length !== 1 ? 's' : ''} Near You
              </h3>
              <p style={{ color: '#047857', fontSize: '0.9rem' }}>
                Click any to view on map
              </p>
            </div>
            <div style={{ 
              marginLeft: 'auto', 
              display: 'flex', 
              gap: '0.75rem', 
              flexWrap: 'wrap',
              maxWidth: '70%',
              justifyContent: 'flex-end'
            }}>
              {nearbyPlaces.slice(0, 5).map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNearbyPlaceClick(place)}
                  style={{
                    background: 'white',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '2rem',
                    fontSize: '0.9rem',
                    color: '#065f46',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    maxWidth: '280px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <span>{getCategoryIcon(place.category)}</span>
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    maxWidth: '150px'
                  }}>
                    {place.name.length > 25 ? place.name.substring(0, 25) + '...' : place.name}
                  </span>
                  <span style={{ 
                    background: '#d1fae5', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginLeft: '0.25rem'
                  }}>
                    {getDistanceFromUser(place.latitude, place.longitude)}km
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div id="map-container" className="card p-4" style={{
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          marginBottom: '1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748' }}>
            🗺️ Davao City Map
          </h2>
          {user ? (
            user.isAdmin ? (
              <span style={{ 
                background: '#d1fae5', 
                padding: '0.5rem 1.2rem', 
                borderRadius: '2rem', 
                fontSize: '0.9rem',
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
                padding: '0.5rem 1.2rem', 
                borderRadius: '2rem', 
                fontSize: '0.9rem',
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
              padding: '0.5rem 1.2rem', 
              borderRadius: '2rem', 
              fontSize: '0.9rem',
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
          <div className="card" style={{ 
            border: '3px solid #fbbf24',
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📝 Suggest Restroom for Approval
            </h2>
            <div style={{
              background: '#fef3c7',
              padding: '1.2rem',
              borderRadius: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '2rem' }}>📍</span>
              <div>
                <p style={{ fontWeight: '600', color: '#92400e' }}>Selected Location:</p>
                <p style={{ fontSize: '0.95rem', color: '#b45309' }}>
                  {selectedPosition.city || 'Davao City'}, {selectedPosition.country || 'Philippines'}
                </p>
                {selectedPosition.district && (
                  <p style={{ fontSize: '0.9rem', color: '#b45309' }}>
                    District: {selectedPosition.district}
                  </p>
                )}
              </div>
            </div>
            <form onSubmit={handleGuestPlaceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                  Restroom Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                  placeholder="e.g., SM Lanang Premier Restroom"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select category</option>
                  <option value="Mall">🏬 Mall</option>
                  <option value="Park">🌳 Park</option>
                  <option value="Market">🏪 Market</option>
                  <option value="Airport">✈️ Airport</option>
                  <option value="Terminal">🚌 Terminal</option>
                  <option value="Restaurant">🍽️ Restaurant</option>
                  <option value="Hotel">🏨 Hotel</option>
                  <option value="Hospital">🏥 Hospital</option>
                  <option value="Public">🚾 Public</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    minHeight: '100px'
                  }}
                  placeholder="Describe the restroom facilities, cleanliness, accessibility, etc."
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                  placeholder="Street address, building name, etc."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                      fontSize: '1rem'
                    }}
                    placeholder="e.g., Buhangin, Poblacion"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                    Barangay
                  </label>
                  <input
                    type="text"
                    value={formData.barangay}
                    onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                      fontSize: '1rem'
                    }}
                    placeholder="Barangay name"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '2rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Submit for Approval
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setSelectedPosition(null)
                  }}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    padding: '0.8rem 2rem',
                    borderRadius: '2rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
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
        <div id="selected-place-details" className="card" style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {getCategoryIcon(selectedPlace.category)} {selectedPlace.name}
              </h2>
              {selectedPlace.city && (
                <p style={{ color: '#718096', fontSize: '1rem' }}>
                  📍 {selectedPlace.city}
                  {selectedPlace.district && `, ${selectedPlace.district}`}
                  {selectedPlace.barangay && `, ${selectedPlace.barangay}`}
                </p>
              )}
              {userLocation && (
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: '#059669',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📏</span>
                  {getDistanceFromUser(selectedPlace.latitude, selectedPlace.longitude)} km from your location
                </p>
              )}
              {selectedPlace.createdBy?.isAdmin && (
                <span style={{
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '0.3rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.85rem',
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
              style={{
                background: '#e5e7eb',
                color: '#374151',
                padding: '0.5rem 1.5rem',
                borderRadius: '2rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ✕ Close
            </button>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            {selectedPlace.address && (
              <p style={{ color: '#4a5568', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📍</span> {selectedPlace.address}
              </p>
            )}
            {selectedPlace.description && (
              <p style={{ 
                color: '#2d3748', 
                background: '#f7fafc', 
                padding: '1.5rem', 
                borderRadius: '1rem',
                lineHeight: '1.6'
              }}>
                {selectedPlace.description}
              </p>
            )}
          </div>

          {/* Photos Section */}
          {selectedPlace.photos && selectedPlace.photos.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>📸 Photos</h3>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            background: '#f7fafc',
            padding: '1.5rem',
            borderRadius: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', color: '#fbbf24' }}>⭐</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {calculateAverageRating(selectedPlace.reviews)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                Average Rating
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', color: '#48bb78' }}>👃</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {calculateAverageSmell(selectedPlace.reviews)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                Avg Smell Level
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', color: '#9f7aea' }}>📝</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {selectedPlace.reviews?.length || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                Total Reviews
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💬</span> Reviews
            </h3>
            
            {selectedPlace.reviews && selectedPlace.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedPlace.reviews.map((review) => (
                  <div key={review.id} style={{
                    background: '#f9fafb',
                    padding: '1.2rem',
                    borderRadius: '1rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{
                            color: i < review.rating ? '#fbbf24' : '#d1d5db',
                            fontSize: '1.2rem'
                          }}>
                            ★
                          </span>
                        ))}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '2rem',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: getSmellLevelClass(review.smellLevel),
                          color: review.smellLevel <= 3 ? '#166534' : review.smellLevel <= 7 ? '#92400e' : '#991b1b'
                        }}>
                          Smell: {review.smellLevel}/10
                        </span>
                        {review.cleanliness && (
                          <span style={{
                            background: '#e2e8f0',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '2rem',
                            fontSize: '0.85rem'
                          }}>
                            Clean: {review.cleanliness}/5
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p style={{ color: '#2d3748', marginBottom: '0.8rem', lineHeight: '1.5' }}>
                        {review.comment}
                      </p>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span style={{ color: '#718096' }}>
                        By: {review.user?.name || review.user?.email || 'Anonymous'}
                      </span>
                      <span style={{ color: '#a0aec0' }}>
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
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                No reviews yet. Be the first to review this restroom!
              </div>
            )}
          </div>

          {/* Add Review and Photo Section */}
          {user && (
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                📝 Add Your Review
              </h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>Rating</label>
                    <select
                      value={reviewData.rating}
                      onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db'
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} ⭐
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                      Smell Level: {reviewData.smellLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewData.smellLevel}
                      onChange={(e) => setReviewData({ ...reviewData, smellLevel: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
                      Cleanliness
                    </label>
                    <select
                      value={reviewData.cleanliness}
                      onChange={(e) => setReviewData({ ...reviewData, cleanliness: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db'
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}/5
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d1d5db',
                      minHeight: '100px'
                    }}
                    placeholder="Share your experience..."
                  />
                </div>

                <button type="submit" style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.8rem 2rem',
                  borderRadius: '2rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: 'fit-content'
                }}>
                  Submit Review
                </button>
              </form>

              {/* Photo Upload Section */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>📸 Add Photos</h3>
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