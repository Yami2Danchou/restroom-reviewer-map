// Get user's current location with better error handling
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      // Options for better accuracy
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
          // Provide more specific error messages
          let errorMessage = 'Failed to get your location'
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Using default location.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Using default location.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Using default location.'
              break
          }
          reject(new Error(errorMessage))
        },
        options
      )
    }
  })
}

// Get location details from coordinates (reverse geocoding)
export const getLocationDetails = async (lat, lng) => {
  // First try to get from cache
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (e) {
      // Ignore cache errors
    }
  }

  try {
    // Using OpenStreetMap Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RestroomReviewer/1.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extract location details
    const address = data.address || {}
    
    const city = address.city || 
                 address.town || 
                 address.village || 
                 address.municipality ||
                 address.suburb ||
                 address.county ||
                 'Unknown'
    
    const country = address.country || 'Unknown'
    const displayName = data.display_name || ''
    
    const locationDetails = { 
      city, 
      country,
      displayName,
      fullAddress: displayName,
      lat,
      lng
    }
    
    // Cache the result
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(locationDetails))
    } catch (e) {
      // Ignore cache errors
    }
    
    return locationDetails
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    
    // Return coordinates-based location
    return { 
      city: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      country: '',
      displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      fullAddress: '',
      lat,
      lng
    }
  }
}

// Get city name from coordinates
export const getCityFromCoordinates = async (lat, lng) => {
  const details = await getLocationDetails(lat, lng)
  return {
    city: details.city,
    country: details.country
  }
}

// No default location - we'll use the user's actual location or show a prompt
export const DEFAULT_LOCATION = null