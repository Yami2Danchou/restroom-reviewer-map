// Get user's current location with auto-detection
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Default to Davao City center
          resolve({
            lat: 7.1907,
            lng: 125.4553,
            accuracy: 1000,
            isDefault: true
          })
        },
        options
      )
    }
  })
}

// Get location details with Davao City focus
export const getLocationDetails = async (lat, lng) => {
  // Check if coordinates are near Davao City
  const isNearDavao = isInDavaoCity(lat, lng)
  
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (e) {}
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RestroomReviewer/1.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    )
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json()
    const address = data.address || {}
    
    // Extract Davao-specific location details
    const city = isNearDavao ? 'Davao City' : (address.city || address.town || 'Davao City')
    const district = address.suburb || address.neighbourhood || null
    const barangay = address.village || address.hamlet || null
    
    const locationDetails = { 
      city: 'Davao City', // Force Davao City for our app
      district,
      barangay,
      country: 'Philippines',
      displayName: data.display_name || '',
      fullAddress: data.display_name || '',
      lat,
      lng,
      isInDavao: isNearDavao
    }
    
    sessionStorage.setItem(cacheKey, JSON.stringify(locationDetails))
    return locationDetails
  } catch (error) {
    return { 
      city: 'Davao City',
      district: null,
      barangay: null,
      country: 'Philippines',
      displayName: 'Davao City, Philippines',
      fullAddress: 'Davao City, Philippines',
      lat,
      lng,
      isInDavao: isNearDavao
    }
  }
}

// Check if coordinates are within Davao City bounds
export const isInDavaoCity = (lat, lng) => {
  // Rough bounds for Davao City
  const bounds = {
    minLat: 6.9833,
    maxLat: 7.5833,
    minLng: 125.2333,
    maxLng: 125.6833
  }
  return lat >= bounds.minLat && lat <= bounds.maxLat && 
         lng >= bounds.minLng && lng <= bounds.maxLng
}

// Auto-detect and set current location
export const autoDetectLocation = async () => {
  try {
    const location = await getCurrentLocation()
    const details = await getLocationDetails(location.lat, location.lng)
    return {
      ...location,
      ...details
    }
  } catch (error) {
    console.error('Auto-detect failed:', error)
    return {
      lat: 7.1907,
      lng: 125.4553,
      city: 'Davao City',
      country: 'Philippines',
      displayName: 'Davao City Center',
      isDefault: true
    }
  }
}