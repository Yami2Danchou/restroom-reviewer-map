'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from './context/AuthContext'
import { getCurrentLocation, getLocationDetails } from './lib/location'

// Dynamically import map with no SSR
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
      fontSize: '1.2rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid white',
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
})

export default function Home() {
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    category: ''
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchPlaces()
  }, [])

  useEffect(() => {
    let isMounted = true

    const getUserLocation = async () => {
      try {
        const location = await getCurrentLocation()
        const details = await getLocationDetails(location.lat, location.lng)
        
        if (isMounted) {
          setUserLocation({
            ...location,
            city: details.city || 'Davao City',
            country: details.country || 'Philippines',
            displayName: details.displayName
          })
        }
      } catch (error) {
        console.log('Using default location')
        if (isMounted) {
          setUserLocation({
            lat: 7.1907,
            lng: 125.4553,
            city: 'Davao City',
            country: 'Philippines',
            displayName: 'Davao City, Philippines'
          })
        }
      }
    }

    getUserLocation()
    return () => { isMounted = false }
  }, [])

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/places')
      const data = await res.json()
      setPlaces(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch places:', error)
      setPlaces([])
    }
  }

  const handleMapClick = useCallback(async (latlng) => {
    if (!user) {
      alert('Please login to add restrooms')
      return
    }
    
    const details = await getLocationDetails(latlng.lat, latlng.lng)
    setSelectedPosition({
      ...latlng,
      city: details.city,
      country: details.country
    })
    setShowSidePanel(true)
    setSelectedPlace(null)
  }, [user])

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place)
    setShowSidePanel(true)
    setSelectedPosition(null)
  }

  const handlePlaceAdded = (newPlace) => {
    fetchPlaces()
    setShowSidePanel(false)
    setSelectedPosition(null)
    setSelectedPlace(newPlace)
  }

  const handleSearchResult = (location) => {
    setSelectedPosition(location)
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {/* Full-screen Map */}
      <Map
        places={places}
        onMapClick={handleMapClick}
        selectedPosition={selectedPosition}
        userLocation={userLocation}
        onPlaceSelect={handlePlaceSelect}
        onSearchResult={handleSearchResult}
        height="100vh"
      />

      {/* Floating Action Button */}
      <button
        onClick={() => setShowSidePanel(!showSidePanel)}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '320px',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          '@media (max-width: 768px)': {
            left: '20px',
            bottom: '20px'
          }
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102,126,234,0.4)'
        }}
      >
        {showSidePanel ? '✕' : '+'}
      </button>

      {/* Floating Side Panel */}
      {(showSidePanel || selectedPlace || selectedPosition) && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '320px',
          right: '20px',
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          zIndex: 1000,
          padding: '24px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          transition: 'all 0.3s ease',
          '@media (max-width: 768px)': {
            left: '20px',
            right: '20px',
            maxWidth: 'none'
          }
        }}>
          {/* Location Info */}
          {userLocation && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              padding: '12px',
              background: '#e0f2fe',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>📍</span>
              <div>
                <div style={{ fontWeight: '600', color: '#0369a1' }}>
                  {userLocation.city || 'Davao City'}
                </div>
                <div style={{ fontSize: '12px', color: '#0284c7' }}>
                  {userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m accuracy` : ''}
                </div>
              </div>
            </div>
          )}

          {/* Selected Place Details */}
          {selectedPlace && (
            <PlaceDetails 
              place={selectedPlace} 
              onClose={() => setSelectedPlace(null)}
              userLocation={userLocation}
            />
          )}

          {/* Add Place Form */}
          {selectedPosition && !selectedPlace && user && (
            <AddPlaceForm
              position={selectedPosition}
              user={user}
              onPlaceAdded={handlePlaceAdded}
              onCancel={() => {
                setShowSidePanel(false)
                setSelectedPosition(null)
              }}
            />
          )}

          {/* Login Prompt */}
          {selectedPosition && !user && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Please login to add a restroom
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Place Details Component
function PlaceDetails({ place, onClose, userLocation }) {
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1)
  }

  const distance = userLocation ? 
    calculateDistance(userLocation.lat, userLocation.lng, place.latitude, place.longitude) : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
          {place.name}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          ✕
        </button>
      </div>

      {place.address && (
        <p style={{ color: '#666', marginBottom: '8px' }}>
          📍 {place.address}
        </p>
      )}

      {distance && (
        <p style={{ color: '#059669', fontSize: '14px', marginBottom: '12px' }}>
          📏 {distance} km from your location
        </p>
      )}

      {place.description && (
        <p style={{ 
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {place.description}
        </p>
      )}

      {place.photos && place.photos.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Photos</h3>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {place.photos.map(photo => (
              <img
                key={photo.id}
                src={photo.url}
                alt="Restroom"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(photo.url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button
          style={{
            flex: 1,
            padding: '10px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Add Review
        </button>
        <button
          style={{
            flex: 1,
            padding: '10px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Get Directions
        </button>
      </div>
    </div>
  )
}

// Add Place Form Component
function AddPlaceForm({ position, user, onPlaceAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    category: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: position.lat,
          longitude: position.lng,
          city: 'Davao City'
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        alert('✅ Place added successfully!')
        onPlaceAdded(data.place)
      } else {
        alert(data.error || 'Failed to add place')
      }
    } catch (error) {
      alert('Failed to add place')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Add New Restroom
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Restroom Name *"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="">Select Category</option>
          <option value="Mall">🏬 Mall</option>
          <option value="Park">🌳 Park</option>
          <option value="Market">🏪 Market</option>
          <option value="Restaurant">🍽️ Restaurant</option>
          <option value="Public">🚾 Public</option>
        </select>

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '80px'
          }}
        />

        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 2,
              padding: '12px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding...' : 'Add Place'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
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
}