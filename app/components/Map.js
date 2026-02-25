// Handle markers - FIXED VERSION
useEffect(() => {
  if (!mapInstanceRef.current || !mapReady) return

  console.log('Rendering markers for places:', placesArray.length) // Debug log

  // Clear existing markers
  markersRef.current.forEach(marker => marker.remove())
  markersRef.current = []

  // Add user location marker
  if (userLocation && userLocation.lat && userLocation.lng) {
    console.log('Adding user marker at:', userLocation.lat, userLocation.lng)
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

  // Add markers for each place - FIXED SECTION
  if (placesArray && placesArray.length > 0) {
    console.log('Adding markers for', placesArray.length, 'places')
    
    placesArray.forEach((place, index) => {
      // Validate place coordinates
      if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
        console.warn('Invalid place data at index', index, ':', place)
        return
      }

      console.log(`Adding marker for ${place.name} at:`, place.latitude, place.longitude)

      // Create marker with custom icon
      const marker = L.marker([place.latitude, place.longitude], {
        icon: createCustomIcon('default')
      })

      // Create popup content
      const popupDiv = document.createElement('div')
      popupDiv.style.padding = '12px'
      popupDiv.style.minWidth = '250px'
      popupDiv.style.fontFamily = 'system-ui, sans-serif'
      
      // Place name
      const nameEl = document.createElement('h3')
      nameEl.style.fontWeight = 'bold'
      nameEl.style.fontSize = '16px'
      nameEl.style.marginBottom = '8px'
      nameEl.style.color = '#2d3748'
      nameEl.textContent = place.name || 'Unnamed Restroom'
      popupDiv.appendChild(nameEl)
      
      // Address
      if (place.address) {
        const addressEl = document.createElement('p')
        addressEl.style.margin = '4px 0'
        addressEl.style.fontSize = '13px'
        addressEl.style.color = '#718096'
        addressEl.innerHTML = `📍 ${place.address}`
        popupDiv.appendChild(addressEl)
      }
      
      // City
      if (place.city) {
        const cityEl = document.createElement('p')
        cityEl.style.margin = '4px 0'
        cityEl.style.fontSize = '12px'
        cityEl.style.color = '#718096'
        cityEl.innerHTML = `🏙️ ${place.city}${place.country ? `, ${place.country}` : ''}`
        popupDiv.appendChild(cityEl)
      }
      
      // Stats
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
      
      if (place.reviews && place.reviews.length > 0) {
        const avgRating = (place.reviews.reduce((acc, r) => acc + r.rating, 0) / place.reviews.length).toFixed(1)
        ratingSpan.textContent = `⭐ ${avgRating}`
      } else {
        ratingSpan.textContent = '⭐ No reviews'
      }
      statsDiv.appendChild(ratingSpan)
      
      const reviewSpan = document.createElement('span')
      reviewSpan.style.background = '#e2e8f0'
      reviewSpan.style.padding = '4px 8px'
      reviewSpan.style.borderRadius = '20px'
      reviewSpan.style.fontSize = '12px'
      reviewSpan.textContent = `📝 ${place.reviews?.length || 0} reviews`
      statsDiv.appendChild(reviewSpan)
      
      popupDiv.appendChild(statsDiv)
      
      // View Details button
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
      
      popupDiv.appendChild(button)
      
      // Bind popup and add marker
      marker.bindPopup(popupDiv)
      marker.addTo(mapInstanceRef.current)

      markersRef.current.push(marker)
    })
  } else {
    console.log('No places to display')
  }

  // Add marker for selected position
  if (selectedPosition && selectedPosition.lat && selectedPosition.lng) {
    console.log('Adding selected position marker at:', selectedPosition.lat, selectedPosition.lng)
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

}, [placesArray, selectedPosition, userLocation, mapReady, onPlaceSelect])