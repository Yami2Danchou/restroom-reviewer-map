'use client'

import { useState, useEffect } from 'react'
import iotSimulation from '../lib/iotSimulation'

export default function IoTDashboard({ placeId, placeName }) {
  const [smellValue, setSmellValue] = useState(null)
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Get initial value
    const initialValue = iotSimulation.getSmellValue(placeId)
    setSmellValue(initialValue)

    // Subscribe to updates
    const unsubscribe = iotSimulation.subscribe(placeId, (data) => {
      setSmellValue(data.value)
      
      // Update history
      setHistory(prev => {
        const newHistory = [...prev, { value: data.value, time: new Date().toLocaleTimeString() }]
        return newHistory.slice(-10) // Keep last 10 readings
      })
    })

    // Get stats
    setStats(iotSimulation.getStatistics())

    return () => {
      unsubscribe()
    }
  }, [placeId])

  if (smellValue === null) return null

  const color = iotSimulation.getSmellColor(smellValue)
  const quality = iotSimulation.getQualityLevel(smellValue)
  const icon = iotSimulation.getStatusIcon(smellValue)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f9fafb 0%, #edf2f7 100%)',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
          Smell Sensor
        </h3>
        <span style={{
          background: '#667eea',
          color: 'white',
          padding: '0.2rem 0.8rem',
          borderRadius: '1rem',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          LIVE
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          animation: 'pulse 2s infinite'
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748' }}>
            {smellValue}
            <span style={{ fontSize: '1rem', color: '#718096', marginLeft: '0.3rem' }}>/100</span>
          </div>
          <div style={{ color: '#718096', fontSize: '0.9rem' }}>
            {quality}
          </div>
        </div>
      </div>

      {/* Quality bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: 'linear-gradient(90deg, #48bb78 0%, #fbbf24 50%, #f56565 100%)',
        borderRadius: '4px',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          left: `${smellValue}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          background: 'white',
          border: `3px solid ${color}`,
          borderRadius: '50%',
          transition: 'left 0.5s ease'
        }} />
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>
            Recent Readings:
          </div>
          <div style={{
            display: 'flex',
            gap: '0.3rem',
            flexWrap: 'wrap'
          }}>
            {history.map((reading, idx) => (
              <div
                key={idx}
                style={{
                  background: iotSimulation.getSmellColor(reading.value),
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
                title={reading.time}
              >
                {reading.value}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}