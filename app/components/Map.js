'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCurrentLocation, getLocationDetails } from '../lib/location'

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Davao City center as default
const DAVAO_CENTER = [7.1907, 125.4553]
const DEFAULT_ZOOM = 13

// Custom marker icons
const createCustomIcon = (type = 'default') => {
  const colors = {
    default: '#ef4444',
    selected: '#3b82f6',
    user: '#10b981',
    search: '#f59e0b' // Orange for search results
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${colors[type] || colors.default};
      width: ${type === 'user' ? '40px' : '30px'};
      height: ${type === 'user' ? '40px' : '30px'};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      animation: ${type === 'user' ? 'pulse 2s infinite' : type === 'selected' ? 'pulse 1.5s infinite' : 'none'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${type === 'user' ? '20px' : '16px'};
    ">${type === 'user' ? '📍' : type === 'search' ? '🔍' : ''}</div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>`,
    iconSize: type === 'user' ? [40, 40] : [30, 30],
    iconAnchor: type === 'user' ? [20, 20] : [15, 15],
    popupAnchor: [0, type === 'user' ? -20 : -15]
  })
}

export default function Map({ 
  places, 
  onMapClick, 
  selectedPosition, 
  userLocation,
  onLocationFound,
  onPlaceSelect,
  onSearchResult,
  height = '600px' 
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const searchMarkerRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Ensure places is always an array
  const placesArray = Array.isArray(places) ? places : []

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map with Davao City center
    mapInstanceRef.current = L.map(mapRef.current).setView(DAVAO_CENTER, DEFAULT_ZOOM)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current)

    // Add click handler
    if (onMapClick) {
      mapInstanceRef.current.on('click', (e) => {
        console.log('Map clicked at:', e.latlng)
        onMapClick(e.latlng)
      })
    }

    setMapReady(true)

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onMapClick])

  // Handle markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add user location marker
    if (userLocation && userLocation.lat && userLocation.lng) {
      const popupContent = `
        <div style="padding: 12px; text-align: center; font-family: system-ui, sans-serif;">
          <strong style="color: #10b981; font-size: 16px;">📍 You are here</strong>
          <p style="margin: 8px 0; font-size: 14px; font-weight: 500; color: #2d3748;">
            ${userLocation.city || 'Current Location'}${userLocation.country ? `, ${userLocation.country}` : ''}
          </p>
          ${userLocation.accuracy ? `
            <p style="margin: 4px 0; font-size: 11px; color: #718096;">
              Accuracy: ±${Math.round(userLocation.accuracy)}m
            </p>
          ` : ''}
        </div>
      `

      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createCustomIcon('user')
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent)

      markersRef.current.push(userMarker)
    }

    // Add markers for each place
    if (placesArray.length > 0) {
      placesArray.forEach(place => {
        if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
          return
        }

        const marker = L.marker([place.latitude, place.longitude], {
          icon: createCustomIcon('default')
        })

        // Create popup content
        const popupContent = document.createElement('div')
        popupContent.style.padding = '12px'
        popupContent.style.minWidth = '250px'
        popupContent.style.fontFamily = 'system-ui, sans-serif'
        
        const nameEl = document.createElement('h3')
        nameEl.style.fontWeight = 'bold'
        nameEl.style.fontSize = '16px'
        nameEl.style.marginBottom = '8px'
        nameEl.style.color = '#2d3748'
        nameEl.textContent = place.name || 'Unnamed'
        popupContent.appendChild(nameEl)
        
        if (place.address) {
          const addressEl = document.createElement('p')
          addressEl.style.margin = '4px 0'
          addressEl.style.fontSize = '13px'
          addressEl.style.color = '#718096'
          addressEl.innerHTML = `📍 ${place.address}`
          popupContent.appendChild(addressEl)
        }
        
        if (place.city) {
          const cityEl = document.createElement('p')
          cityEl.style.margin = '4px 0'
          cityEl.style.fontSize = '12px'
          cityEl.style.color = '#718096'
          cityEl.innerHTML = `🏙️ ${place.city}${place.country ? `, ${place.country}` : ''}`
          popupContent.appendChild(cityEl)
        }
        
        const statsDiv = document.createElement('div')
        statsDiv.style.display = 'flex'
        statsDiv.style.alignItems = 'center'
        statsDiv.style.gap = '8px'
        statsDiv.style.margin = '8px 0'
        
        const ratingSpan = document.createElement('span')
        ratingSpan.style.background = '#fbbf24'
        ratingSpan.style.padding = '4px 8px'
        ratingSpan.style.borderRadius = '20px'
        ratingSpan.style.fontSize = '12px'
        ratingSpan.style.fontWeight = 'bold'
        ratingSpan.textContent = `⭐ ${place.reviews?.length 
          ? (place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length).toFixed(1) 
          : 'No reviews'}`
        statsDiv.appendChild(ratingSpan)
        
        const reviewSpan = document.createElement('span')
        reviewSpan.style.background = '#e2e8f0'
        reviewSpan.style.padding = '4px 8px'
        reviewSpan.style.borderRadius = '20px'
        reviewSpan.style.fontSize = '12px'
        reviewSpan.textContent = `📝 ${place.reviews?.length || 0} reviews`
        statsDiv.appendChild(reviewSpan)
        
        popupContent.appendChild(statsDiv)
        
        const button = document.createElement('button')
        button.textContent = 'View Details'
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        button.style.color = 'white'
        button.style.border = 'none'
        button.style.padding = '8px 16px'
        button.style.borderRadius = '20px'
        button.style.cursor = 'pointer'
        button.style.fontSize = '13px'
        button.style.fontWeight = '600'
        button.style.width = '100%'
        button.style.marginTop = '8px'
        button.style.transition = 'all 0.3s ease'
        
        button.onmouseover = () => {
          button.style.transform = 'translateY(-2px)'
          button.style.boxShadow = '0 4px 12px rgba(102,126,234,0.4)'
        }
        button.onmouseout = () => {
          button.style.transform = 'translateY(0)'
          button.style.boxShadow = 'none'
        }
        
        button.onclick = () => {
          if (onPlaceSelect) {
            onPlaceSelect(place)
          }
          mapInstanceRef.current.closePopup()
        }
        
        popupContent.appendChild(button)
        
        marker.bindPopup(popupContent)
        marker.addTo(mapInstanceRef.current)

        markersRef.current.push(marker)
      })
    }

    // Add marker for selected position
    if (selectedPosition && selectedPosition.lat && selectedPosition.lng) {
      const marker = L.marker([selectedPosition.lat, selectedPosition.lng], {
        icon: createCustomIcon('selected')
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 12px; text-align: center;">
            <strong style="color: #3b82f6; font-size: 16px;">📍 Selected Location</strong>
            <p style="margin: 8px 0; font-size: 13px; color: #4a5568;">
              Click the form below to add/suggest a restroom
            </p>
          </div>
        `)
        .openPopup()

      markersRef.current.push(marker)
      
      mapInstanceRef.current.setView([selectedPosition.lat, selectedPosition.lng], 16)
    }

  }, [placesArray, selectedPosition, userLocation, mapReady, onPlaceSelect])

  // Search function using OpenStreetMap Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setShowSearchResults(false)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Davao City, Philippines')}&limit=5`,
        {
          headers: {
            'User-Agent': 'RestroomReviewer/1.0'
          }
        }
      )
      
      const data = await response.json()
      setSearchResults(data)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search result selection
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    
    // Clear previous search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove()
    }
    
    // Add new search marker
    searchMarkerRef.current = L.marker([lat, lon], {
      icon: createCustomIcon('search')
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <div style="padding: 12px; text-align: center;">
          <strong style="color: #f59e0b; font-size: 16px;">🔍 Search Result</strong>
          <p style="margin: 8px 0; font-size: 13px; color: #4a5568;">
            ${result.display_name}
          </p>
        </div>
      `)
      .openPopup()
    
    // Pan to location
    mapInstanceRef.current.setView([lat, lon], 16)
    
    // Call callback if provided
    if (onSearchResult) {
      onSearchResult({ lat, lng: lon, displayName: result.display_name })
    }
    
    setShowSearchResults(false)
    setSearchQuery('')
  }

  // Go to user location
  const goToUserLocation = () => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16)
      
      // Open user location popup
      markersRef.current.forEach(marker => {
        if (marker._icon && marker._icon.style.backgroundColor === '#10b981') {
          marker.openPopup()
        }
      })
    } else {
      // If no user location, try to get it
      getCurrentLocation()
        .then(location => {
          mapInstanceRef.current.setView([location.lat, location.lng], 16)
          if (onLocationFound) {
            onLocationFound(location)
          }
        })
        .catch(error => {
          alert('Could not get your location. Please enable location services.')
        })
    }
  }

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {/* Search Bar */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: '500px',
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for places in Davao City..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '30px',
              border: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '10px',
              marginTop: '5px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1001
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectSearchResult(result)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #e5e7eb' : 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isSearching}
          style={{
            padding: '12px 20px',
            borderRadius: '30px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isSearching ? 0.7 : 1
          }}
        >
          {isSearching ? '...' : '🔍 Search'}
        </button>
      </div>

      {/* My Location Button */}
      <button
        onClick={goToUserLocation}
        style={{
          position: 'absolute',
          bottom: '30px',
          right: '20px',
          zIndex: 1000,
          padding: '15px',
          borderRadius: '50%',
          border: 'none',
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Go to my location"
      >
        📍
      </button>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '3px solid white',
          cursor: 'crosshair'
        }} 
      />
    </div>
  )
}