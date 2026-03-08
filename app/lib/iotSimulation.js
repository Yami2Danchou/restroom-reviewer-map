// IoT Hardware Simulation for Smell Sensor
// Simulates a real-time smell sensor with values from 1-100
// 1 = Fresh air, 100 = Extremely bad smell

class IoTSimulation {
  constructor() {
    this.sensors = new Map() // Store sensors for each place
    this.listeners = new Map() // Store callback listeners
    this.interval = null
    this.baseValues = new Map() // Base values for each sensor
    this.trends = new Map() // Current trend for each sensor
  }

  // Initialize a sensor for a place
  registerSensor(placeId) {
    if (!this.sensors.has(placeId)) {
      // Create realistic initial values based on place characteristics
      const baseValue = Math.floor(Math.random() * 40) + 20 // 20-60 range
      this.baseValues.set(placeId, baseValue)
      this.trends.set(placeId, {
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: Math.random() * 0.5 + 0.1,
        volatility: Math.random() * 0.3 + 0.1
      })
      
      const sensor = {
        placeId,
        currentValue: baseValue,
        history: [],
        lastUpdate: Date.now(),
        status: 'active'
      }
      this.sensors.set(placeId, sensor)
      
      console.log(`🔄 IoT Sensor registered for place ${placeId} with base value ${baseValue}`)
    }
    return this.sensors.get(placeId)
  }

  // Get current smell value for a place
  getSmellValue(placeId) {
    const sensor = this.sensors.get(placeId)
    if (!sensor) {
      this.registerSensor(placeId)
      return this.sensors.get(placeId).currentValue
    }
    return sensor.currentValue
  }

  // Update all sensors with realistic fluctuations
  updateSensors() {
    const now = Date.now()
    
    for (const [placeId, sensor] of this.sensors) {
      const trend = this.trends.get(placeId)
      const baseValue = this.baseValues.get(placeId)
      
      // Calculate time-based fluctuation
      const timeOfDay = new Date().getHours()
      const dayFactor = this.getTimeOfDayFactor(timeOfDay)
      
      // Add realistic patterns
      const fluctuation = Math.sin(now * 0.001 * trend.speed) * 5 * trend.volatility
      const randomNoise = (Math.random() - 0.5) * 3
      const trendMovement = trend.direction * 2
      
      // Combine all factors
      let newValue = baseValue + fluctuation + randomNoise + trendMovement + dayFactor
      
      // Occasionally change trend direction
      if (Math.random() < 0.01) { // 1% chance per update
        trend.direction *= -1
      }
      
      // Ensure value stays within 1-100 range
      newValue = Math.max(1, Math.min(100, Math.round(newValue)))
      
      // Update sensor
      sensor.currentValue = newValue
      sensor.history.push({ value: newValue, timestamp: now })
      
      // Keep history at last 100 readings
      if (sensor.history.length > 100) {
        sensor.history.shift()
      }
      
      // Notify listeners for this place
      if (this.listeners.has(placeId)) {
        this.listeners.get(placeId).forEach(callback => {
          callback({
            placeId,
            value: newValue,
            timestamp: now,
            quality: this.getQualityLevel(newValue)
          })
        })
      }
    }
  }

  // Get factor based on time of day (busier times = worse smell)
  getTimeOfDayFactor(hour) {
    // Peak hours: 12-2 PM, 6-8 PM
    if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      return Math.random() * 10 + 5 // +5-15 during peak hours
    }
    // Off hours: 12 AM - 5 AM
    if (hour >= 0 && hour <= 5) {
      return -Math.random() * 10 - 5 // -5-15 during off hours
    }
    return 0
  }

  // Get color based on smell value with smooth gradient
  getSmellColor(value) {
    // Ensure value is within range
    value = Math.max(1, Math.min(100, value))
    
    // Convert 1-100 scale to RGB with smooth transitions
    // Green (good) -> Yellow (average) -> Orange -> Red (bad)
    
    let r, g, b
    
    if (value <= 50) {
      // Green to Yellow transition (1-50)
      const ratio = (value - 1) / 49 // 0 to 1
      r = Math.floor(0 + 255 * ratio) // 0 to 255
      g = 255
      b = 0
    } else {
      // Yellow to Orange to Red transition (51-100)
      const ratio = (value - 51) / 49 // 0 to 1
      if (value <= 75) {
        // Yellow to Orange (51-75)
        r = 255
        g = Math.floor(255 - (255 * (ratio * 2))) // 255 to 165
        b = 0
      } else {
        // Orange to Red (76-100)
        r = 255
        g = Math.floor(165 - (165 * (ratio - 0.5) * 2)) // 165 to 0
        b = 0
      }
    }
    
    return `rgb(${r}, ${g}, ${b})`
  }

  // Get quality level description
  getQualityLevel(value) {
    if (value <= 20) return 'Excellent'
    if (value <= 40) return 'Good'
    if (value <= 60) return 'Average'
    if (value <= 80) return 'Poor'
    return 'Very Poor'
  }

  // Get status icon
  getStatusIcon(value) {
    if (value <= 20) return '✨' // Excellent
    if (value <= 40) return ' ' // Good
    if (value <= 60) return ' ' // Average
    if (value <= 80) return '⚠️' // Poor
    return '⚠️' // Very Poor
  }

  // Subscribe to updates for a place
  subscribe(placeId, callback) {
    if (!this.listeners.has(placeId)) {
      this.listeners.set(placeId, [])
    }
    this.listeners.get(placeId).push(callback)
    
    // Register sensor if not exists
    this.registerSensor(placeId)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(placeId)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Start simulation
  start() {
    if (!this.interval) {
      console.log('🚀 IoT Simulation started')
      this.interval = setInterval(() => {
        this.updateSensors()
      }, 2000) // Update every 2 seconds
    }
  }

  // Stop simulation
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      console.log('🛑 IoT Simulation stopped')
    }
  }

  // Get statistics
  getStatistics() {
    const stats = {
      totalSensors: this.sensors.size,
      averageValue: 0,
      minValue: 100,
      maxValue: 1,
      sensors: []
    }
    
    let sum = 0
    for (const [placeId, sensor] of this.sensors) {
      sum += sensor.currentValue
      stats.minValue = Math.min(stats.minValue, sensor.currentValue)
      stats.maxValue = Math.max(stats.maxValue, sensor.currentValue)
      stats.sensors.push({
        placeId,
        value: sensor.currentValue,
        quality: this.getQualityLevel(sensor.currentValue)
      })
    }
    
    stats.averageValue = stats.totalSensors > 0 ? Math.round(sum / stats.totalSensors) : 0
    
    return stats
  }
}

// Create singleton instance
const iotSimulation = new IoTSimulation()

// Start simulation automatically
if (typeof window !== 'undefined') {
  iotSimulation.start()
}

export default iotSimulation