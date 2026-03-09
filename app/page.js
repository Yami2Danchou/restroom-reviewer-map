'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './context/AuthContext'
import AdminAddPlace from './components/AdminAddPlace'
import PhotoUpload from './components/PhotoUpload'
import MapLayout from './components/MapLayout'
import IoTDashboard from './components/IoTDashboard'
import { getCurrentLocation, getLocationDetails } from './lib/location'

const Map = dynamic(() => import('./components/Map'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '100%',
      width: '100%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.2rem',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white',
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('places') // 'places', 'add', 'details'
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
        }
      } catch (error) {
        console.warn('Location detection issue:', error.message)
        
        if (isMounted) {
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

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/places')
      const data = await res.json()
      console.log('Fetched places:', data.length)
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
      return distance <= 5
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
    const R = 6371
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const d = R * c
    return d
  }

  const deg2rad = (deg) => {
    return deg * (Math.PI/180)
  }

  const handleMapClick = useCallback(async (latlng) => {
    if (!user) {
      alert('Please login to add or suggest restrooms')
      return
    }
    
    const details = await getLocationDetails(latlng.lat, latlng.lng)
    
    setSelectedPosition({
      ...latlng,
      city: details.city || 'Davao City',
      country: details.country || 'Philippines',
      district: details.district,
      barangay: details.barangay,
      displayName: details.displayName
    })
    setActiveView('add')
    setIsSidebarOpen(true)
    setSelectedPlace(null)
  }, [user])

  // Handle place selection from list or map popup
  const handlePlaceSelect = (place) => {
    console.log('Place selected from list:', place)
    
    // Set the selected place to show details
    setSelectedPlace(place)
    setActiveView('details')
    setIsSidebarOpen(true)
    setShowAddForm(false)
    
    // Set selected position to highlight on map and center view
    setSelectedPosition({
      lat: place.latitude,
      lng: place.longitude,
      city: place.city,
      district: place.district,
      barangay: place.barangay,
      country: place.country
    })
  }

  // Handle nearby place click
  const handleNearbyPlaceClick = (place) => {
    console.log('Nearby place clicked:', place)
    
    // Set the selected place to show details
    setSelectedPlace(place)
    setActiveView('details')
    setIsSidebarOpen(true)
    setShowAddForm(false)
    
    // Set selected position to highlight on map and center view
    setSelectedPosition({
      lat: place.latitude,
      lng: place.longitude,
      city: place.city,
      district: place.district,
      barangay: place.barangay,
      country: place.country
    })
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
        setActiveView('places')
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
    setActiveView('places')
    setSelectedPosition(null)
    setSelectedPlace(newPlace)
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

  // Render sidebar content based on active view
  const renderSidebarContent = () => {
    if (activeView === 'add' && user) {
      if (user.isAdmin) {
        return (
          <AdminAddPlace
            selectedPosition={selectedPosition}
            onPlaceAdded={handlePlaceAdded}
            onCancel={() => {
              setActiveView('places')
              setSelectedPosition(null)
            }}
          />
        )
      } else {
        return (
          <div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              📝 Suggest Restroom
            </h3>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '1.2rem',
              borderRadius: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid #fbbf24'
            }}>
              <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.3rem' }}>📍 Selected Location:</p>
              <p style={{ fontSize: '0.95rem', color: '#b45309' }}>
                {selectedPosition?.city || 'Davao City'}, {selectedPosition?.country || 'Philippines'}
              </p>
              {selectedPosition?.district && (
                <p style={{ fontSize: '0.9rem', color: '#b45309' }}>District: {selectedPosition.district}</p>
              )}
            </div>
            <form onSubmit={handleGuestPlaceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Restroom Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., SM Lanang Restroom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea'
                    e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.2)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select category</option>
                  <option value="Mall">🏬 Mall</option>
                  <option value="Park">🌳 Park</option>
                  <option value="Market">🏪 Market</option>
                  <option value="Public">🚾 Public</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe the restroom facilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    minHeight: '100px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street address, building name..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Buhangin"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '0.5rem',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                    Barangay
                  </label>
                  <input
                    type="text"
                    placeholder="Barangay name"
                    value={formData.barangay}
                    onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      borderRadius: '0.5rem',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: '2rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
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
                  Submit for Approval
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveView('places')}
                  style={{
                    background: '#e5e7eb',
                    color: '#374151',
                    padding: '0.8rem 2rem',
                    borderRadius: '2rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )
      }
    }

    if (activeView === 'details' && selectedPlace) {
      return (
        <div>
          {/* IoT Dashboard at the top */}
          <IoTDashboard placeId={selectedPlace.id} placeName={selectedPlace.name} />

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {getCategoryIcon(selectedPlace.category)} {selectedPlace.name}
            </h2>
            <p style={{ color: '#718096', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>📍</span> {selectedPlace.address || 'No address'}
            </p>
            {userLocation && (
              <p style={{ 
                color: '#059669', 
                fontSize: '0.9rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: '#d1fae5',
                padding: '0.3rem 0.8rem',
                borderRadius: '2rem',
                width: 'fit-content'
              }}>
                <span>📏</span> {getDistanceFromUser(selectedPlace.latitude, selectedPlace.longitude)} km away
              </p>
            )}
          </div>

          {/* Photos Section */}
          {selectedPlace.photos && selectedPlace.photos.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                📸 Photos
              </h3>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                padding: '0.5rem 0'
              }}>
                {selectedPlace.photos.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => window.open(photo.url, '_blank')}
                    style={{
                      flex: '0 0 auto',
                      width: '100px',
                      height: '100px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid #e2e8f0',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.borderColor = '#667eea'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    <img
                      src={photo.url}
                      alt="Restroom"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', photo.url)
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '1rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '1px solid #fbbf24'
            }}>
              <div style={{ fontSize: '2rem', color: '#fbbf24' }}>⭐</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {calculateAverageRating(selectedPlace.reviews)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309' }}>Average Rating</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              padding: '1rem',
              borderRadius: '1rem',
              textAlign: 'center',
              border: '1px solid #6ee7b7'
            }}>
              <div style={{ fontSize: '2rem', color: '#10b981' }}>📝</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#065f46' }}>
                {selectedPlace.reviews?.length || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#047857' }}>Total Reviews</div>
            </div>
          </div>

          {selectedPlace.description && (
            <div style={{ 
              marginBottom: '2rem',
              background: '#f7fafc',
              padding: '1rem',
              borderRadius: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                📝 Description
              </h3>
              <p style={{ color: '#4a5568', lineHeight: '1.6' }}>{selectedPlace.description}</p>
            </div>
          )}

          {/* Reviews Section */}
          {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#2d3748'
              }}>
                💬 Reviews ({selectedPlace.reviews.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {selectedPlace.reviews.map((review) => (
                  <div key={review.id} style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '0.8rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ color: '#fbbf24' }}>
                        {'⭐'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                      </div>
                      <span style={{ 
                        background: review.smellLevel <= 3 ? '#dcfce7' : review.smellLevel <= 7 ? '#fef3c7' : '#fee2e2',
                        color: review.smellLevel <= 3 ? '#166534' : review.smellLevel <= 7 ? '#92400e' : '#991b1b',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        Smell: {review.smellLevel}/10
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#2d3748' }}>{review.comment}</p>
                    <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
                      By: {review.user?.name || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Review Section */}
          {user && (
            <div>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📝 Add Your Review
              </h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                </select>
                
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
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

                <textarea
                  placeholder="Share your experience..."
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    minHeight: '80px'
                  }}
                />

                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: '2rem',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16,185,129,0.3)'
                  }}
                >
                  Submit Review
                </button>
              </form>

              {/* Photo Upload Section */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📸 Add Photos
                </h3>
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
      )
    }

    // Default places list view
    return (
      <div>
        {/* Location Status */}
        {locationError && (
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fbbf24',
            padding: '1rem',
            borderRadius: '1rem',
            marginBottom: '1.5rem',
            color: '#92400e',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            {locationError}
          </div>
        )}

        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Worldwide Restrooms
          </h2>
          <p style={{ opacity: 0.9 }}>
            {places.length} restrooms available • {nearbyPlaces.length} near you
          </p>
        </div>

        {/* Nearby Places */}
        {nearbyPlaces.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              🏪 Nearby ({nearbyPlaces.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {nearbyPlaces.slice(0, 5).map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleNearbyPlaceClick(place)}
                  style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '0.8rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(102,126,234,0.2)'
                    e.currentTarget.style.borderColor = '#667eea'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>
                      {getCategoryIcon(place.category)} {place.name}
                    </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                      padding: '0.2rem 0.8rem',
                      borderRadius: '1rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#065f46'
                    }}>
                      {getDistanceFromUser(place.latitude, place.longitude)}km
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>
                    ⭐ {calculateAverageRating(place.reviews)} • 📝 {place.reviews?.length || 0}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Places */}
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🗺️ All Restrooms ({places.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {places.map((place) => (
            <button
              key={place.id}
              onClick={() => handlePlaceSelect(place)}
              style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '0.8rem',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(102,126,234,0.2)'
                e.currentTarget.style.borderColor = '#667eea'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {getCategoryIcon(place.category)} {place.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.25rem' }}>
                📍 {place.address?.substring(0, 50) || 'No address'} • ⭐ {calculateAverageRating(place.reviews)}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <MapLayout
        sidebarContent={renderSidebarContent()}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onClose={() => {
          setActiveView('places')
          setSelectedPlace(null)
          setSelectedPosition(null)
        }}
        showCloseButton={activeView === 'details' || activeView === 'add'}
        title={activeView === 'add' ? 'Add Restroom' : activeView === 'details' ? 'Restroom Details' : 'Restroom Finder'}
      >
        <Map
          places={places}
          onMapClick={handleMapClick}
          selectedPosition={selectedPosition}
          userLocation={userLocation}
          onLocationFound={setUserLocation}
          onPlaceSelect={handlePlaceSelect}
          height="100%"
        />
      </MapLayout>
    </>
  )
}