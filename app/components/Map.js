'use client'

import { useEffect, useRef } from 'react'

// Davao City coordinates
const DAVAO_CITY_CENTER = [7.1907, 125.4553]
const DEFAULT_ZOOM = 13

export default function Map({ places, onMapClick, selectedPosition, height = '600px' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const leafletRef = useRef(null)
  const LRef = useRef(null)

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return

      try {
        // Import Leaflet
        const L = (await import('leaflet')).default
        LRef.current = L
        await import('leaflet/dist/leaflet.css')

        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current).setView(DAVAO_CITY_CENTER, DEFAULT_ZOOM)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current)

        // Add click handler
        if (onMapClick) {
          mapInstanceRef.current.on('click', (e) => {
            onMapClick(e.latlng)
          })
        }

        leafletRef.current = L
      } catch (error) {
        console.error('Failed to initialize map:', error)
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onMapClick])

  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return

    const L = leafletRef.current

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Custom marker icon function
    const createCustomIcon = (isSelected = false) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${isSelected ? '#3b82f6' : '#ef4444'};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      })
    }

    // Add markers for each place
    places.forEach(place => {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: createCustomIcon(false)
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 12px; min-width: 250px; font-family: Arial, sans-serif;">
            <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #2d3748;">${place.name}</h3>
            ${place.address ? `<p style="margin: 4px 0; font-size: 13px; color: #718096;">📍 ${place.address}</p>` : ''}
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
              onclick="window.dispatchEvent(new CustomEvent('placeClick', { detail: ${JSON.stringify(place)} }))"
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
                margin-top: 8px;
              "
            >
              View Details
            </button>
          </div>
        `)

      markersRef.current.push(marker)
    })

    // Add marker for selected position
    if (selectedPosition) {
      const marker = L.marker([selectedPosition.lat, selectedPosition.lng], {
        icon: createCustomIcon(true)
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div style="padding: 12px; text-align: center;">
            <strong style="color: #3b82f6;">Selected Location</strong>
            <p style="margin: 4px 0; font-size: 12px; color: #718096;">
              Click the form below to add a restroom
            </p>
          </div>
        `)
        .openPopup()

      markersRef.current.push(marker)
    }

    // Handle place click from popup
    const handlePlaceClick = (e) => {
      const place = e.detail
      window.selectedPlaceCallback?.(place)
    }

    window.addEventListener('placeClick', handlePlaceClick)

    return () => {
      window.removeEventListener('placeClick', handlePlaceClick)
    }
  }, [places, selectedPosition])

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
        backgroundColor: '#f0f0f0'
      }} 
    />
  )
}