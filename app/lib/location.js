// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    }
  })
}

// Get city name from coordinates (reverse geocoding)
export const getCityFromCoordinates = async (lat, lng) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    )
    const data = await response.json()
    
    const city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 data.address.municipality ||
                 'Unknown'
    
    const country = data.address.country || 'Unknown'
    
    return { city, country }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return { city: 'Unknown', country: 'Unknown' }
  }
}

// Default location (if user denies permission)
export const DEFAULT_LOCATION = {
  lat: 40.7128,
  lng: -74.0060,
  city: 'New York',
  country: 'USA'
}