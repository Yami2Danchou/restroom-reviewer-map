'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Default center (New York City as fallback)
const DEFAULT_CENTER = [40.7128, -74.0060]
const DEFAULT_ZOOM = 13

// Custom marker icons
const createCustomIcon = (type = 'default') => {
  const colors = {
    default: '#ef4444',
    selected: '#3b82f6',
    user: '#10b981'
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
    ">${type === 'user' ? '📍' : ''}</div>
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
  height = '600px' 
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [locationAttempted, setLocationAttempted] = useState(false)

  // Ensure places is always an array
  const placesArray = Array.isArray(places) ? places : []

  // Get user location on mount
  useEffect(() => {
    if (!locationAttempted && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          console.log('User location:', location)
          onLocationFound?.(location)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 15)
          }
        },
        (error) => {
          console.log('Using default location:', error.message)
          onLocationFound?.({
            lat: DEFAULT_CENTER[0],
            lng: DEFAULT_CENTER[1],
            city: 'New York',
            country: 'USA'
          })
        }
      )
      setLocationAttempted(true)
    }
  }, [locationAttempted, onLocationFound])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map with default view
    mapInstanceRef.current = L.map(mapRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

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
      console.log('Adding markers for', placesArray.length, 'places')
      placesArray.forEach(place => {
        if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
          console.warn('Invalid place data:', place)
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
        
        // Add place name
        const nameEl = document.createElement('h3')
        nameEl.style.fontWeight = 'bold'
        nameEl.style.fontSize = '16px'
        nameEl.style.marginBottom = '8px'
        nameEl.style.color = '#2d3748'
        nameEl.textContent = place.name || 'Unnamed'
        popupContent.appendChild(nameEl)
        
        // Add address if exists
        if (place.address) {
          const addressEl = document.createElement('p')
          addressEl.style.margin = '4px 0'
          addressEl.style.fontSize = '13px'
          addressEl.style.color = '#718096'
          addressEl.innerHTML = `📍 ${place.address}`
          popupContent.appendChild(addressEl)
        }
        
        // Add city if exists
        if (place.city) {
          const cityEl = document.createElement('p')
          cityEl.style.margin = '4px 0'
          cityEl.style.fontSize = '12px'
          cityEl.style.color = '#718096'
          cityEl.innerHTML = `🏙️ ${place.city}${place.country ? `, ${place.country}` : ''}`
          popupContent.appendChild(cityEl)
        }
        
        // Add stats
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
        
        // Add button
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
        
        // Add click handler directly
        button.onclick = () => {
          console.log('Button clicked for place:', place)
          if (onPlaceSelect) {
            onPlaceSelect(place)
          }
          // Close the popup
          mapInstanceRef.current.closePopup()
        }
        
        popupContent.appendChild(button)
        
        // Bind popup with the created content
        marker.bindPopup(popupContent)
        marker.addTo(mapInstanceRef.current)

        markersRef.current.push(marker)
      })
    }

    // Add marker for selected position - WITH NULL CHECK
    if (selectedPosition && selectedPosition.lat && selectedPosition.lng) {
      console.log('Adding selected position marker:', selectedPosition)
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
      
      // Pan to the selected position
      mapInstanceRef.current.setView([selectedPosition.lat, selectedPosition.lng], 16)
    }

    // Add click event listeners to the buttons after popup is opened
    mapInstanceRef.current.on('popupopen', function(e) {
      setTimeout(() => {
        placesArray.forEach(place => {
          // This is handled by the direct button onclick above
        })
      }, 100)
    })

  }, [placesArray, selectedPosition, userLocation, mapReady, onPlaceSelect])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height, 
        width: '100%',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '3px solid white',
        cursor: 'crosshair'
      }} 
    />
  )
}