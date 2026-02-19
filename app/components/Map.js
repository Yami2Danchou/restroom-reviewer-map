'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getCurrentLocation, DEFAULT_LOCATION } from '../lib/location'

// Fix for default markers in Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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
    if (!locationAttempted) {
      getCurrentLocation()
        .then(location => {
          console.log('User location:', location)
          onLocationFound?.(location)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([location.lat, location.lng], 15)
          }
        })
        .catch(error => {
          console.log('Using default location:', error.message)
          onLocationFound?.(DEFAULT_LOCATION)
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng], 13)
          }
        })
        .finally(() => {
          setLocationAttempted(true)
        })
    }
  }, [locationAttempted, onLocationFound])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map with default view (will be updated when location is found)
    mapInstanceRef.current = L.map(mapRef.current).setView(
      [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng], 
      13
    )

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
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createCustomIcon('user')
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 12px; text-align: center;">
            <strong style="color: #10b981; font-size: 16px;">📍 You are here</strong>
            <p style="margin: 8px 0; font-size: 13px; color: #4a5568;">
              ${userLocation.city || 'Current Location'}, ${userLocation.country || ''}
            </p>
            ${userLocation.accuracy ? `
              <p style="margin: 4px 0; font-size: 11px; color: #718096;">
                Accuracy: ±${Math.round(userLocation.accuracy)}m
              </p>
            ` : ''}
          </div>
        `)
        .openPopup()

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
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 12px; min-width: 250px; font-family: system-ui, sans-serif;">
              <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #2d3748;">
                ${place.name || 'Unnamed'}
              </h3>
              ${place.address ? `
                <p style="margin: 4px 0; font-size: 13px; color: #718096;">
                  📍 ${place.address}
                </p>
              ` : ''}
              ${place.city ? `
                <p style="margin: 4px 0; font-size: 12px; color: #718096;">
                  🏙️ ${place.city}, ${place.country || ''}
                </p>
              ` : ''}
              <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                <span style="background: #fbbf24; padding: 4px 8px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  ⭐ ${place.reviews?.length 
                    ? (place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length).toFixed(1) 
                    : 'No reviews'}
                </span>
                <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 20px; font-size: 12px;">
                  📝 ${place.reviews?.length || 0} reviews
                </span>
              </div>
              <button 
                onclick="(function() { 
                  window.dispatchEvent(new CustomEvent('placeClick', { 
                    detail: ${JSON.stringify(place).replace(/"/g, '&quot;')} 
                  }))
                })()"
                style="
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 20px;
                  cursor: pointer;
                  font-size: 13px;
                  font-weight: 600;
                  width: 100%;
                  transition: all 0.3s ease;
                  margin-top: 8px;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
              >
                View Details
              </button>
            </div>
          `)

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
      
      // Pan to the selected position
      mapInstanceRef.current.setView([selectedPosition.lat, selectedPosition.lng], 16)
    }

    // Handle place click from popup
    const handlePlaceClick = (e) => {
      const place = e.detail
      if (window.selectedPlaceCallback) {
        window.selectedPlaceCallback(place)
      }
    }

    window.addEventListener('placeClick', handlePlaceClick)

    return () => {
      window.removeEventListener('placeClick', handlePlaceClick)
    }
  }, [placesArray, selectedPosition, userLocation, mapReady])

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