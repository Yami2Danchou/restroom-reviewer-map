'use client'

import { useState } from 'react'

export default function AdminAddPlace({ selectedPosition, onPlaceAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    category: '',
    district: '',
    barangay: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPosition) {
      alert('Please select a location on the map first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Submitting place:', {
        ...formData,
        latitude: selectedPosition.lat,
        longitude: selectedPosition.lng,
        city: 'Davao City'
      })

      const res = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
          address: formData.address,
          city: 'Davao City',
          district: formData.district || selectedPosition.district,
          barangay: formData.barangay || selectedPosition.barangay,
          category: formData.category
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        alert('✅ Place added successfully!')
        onPlaceAdded(data.place)
        setFormData({ 
          name: '', 
          description: '', 
          address: '',
          category: '',
          district: '',
          barangay: ''
        })
      } else {
        setError(data.error || 'Failed to add place')
        alert('Error: ' + (data.error || 'Failed to add place'))
      }
    } catch (error) {
      console.error('Failed to add place:', error)
      setError(error.message)
      alert('Failed to add place: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ 
      border: '3px solid #10b981',
      background: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        👑 Admin: Add Place Directly
      </h2>
      
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        background: '#d1fae5',
        padding: '1.2rem',
        borderRadius: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '2rem' }}>📍</span>
        <div>
          <p style={{ fontWeight: '600', color: '#065f46' }}>Selected Location:</p>
          <p style={{ fontSize: '0.95rem', color: '#047857' }}>
            Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
          </p>
          {selectedPosition.city && (
            <p style={{ fontSize: '0.9rem', color: '#047857' }}>
              {selectedPosition.city}, {selectedPosition.country || 'Philippines'}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
            Restroom Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
            placeholder="e.g., SM Lanang Premier Restroom"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
          >
            <option value="">Select category</option>
            <option value="Mall">🏬 Mall</option>
            <option value="Park">🌳 Park</option>
            <option value="Market">🏪 Market</option>
            <option value="Airport">✈️ Airport</option>
            <option value="Terminal">🚌 Terminal</option>
            <option value="Restaurant">🍽️ Restaurant</option>
            <option value="Hotel">🏨 Hotel</option>
            <option value="Hospital">🏥 Hospital</option>
            <option value="Public">🚾 Public</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              minHeight: '100px'
            }}
            placeholder="Describe the restroom facilities..."
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
            Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
            placeholder="Street address, building name, etc."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
              District
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
              placeholder="e.g., Buhangin"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.3rem' }}>
              Barangay
            </label>
            <input
              type="text"
              value={formData.barangay}
              onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '1rem'
              }}
              placeholder="Barangay name"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              padding: '0.8rem 2rem',
              borderRadius: '2rem',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              flex: 1,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding...' : '✅ Add Place Directly'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#e5e7eb',
              color: '#374151',
              padding: '0.8rem 2rem',
              borderRadius: '2rem',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}