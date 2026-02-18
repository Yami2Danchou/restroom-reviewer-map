'use client'

import { useState } from 'react'

export default function AdminAddPlace({ selectedPosition, onPlaceAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPosition) {
      alert('Please select a location on the map')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        alert('✅ Place added successfully!')
        onPlaceAdded(data.place)
        setFormData({ name: '', description: '', address: '' })
      } else {
        alert(data.error || 'Failed to add place')
      }
    } catch (error) {
      console.error('Failed to add place:', error)
      alert('Failed to add place')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ border: '3px solid #10b981' }}>
      <h2 className="card-title text-2xl mb-6">👑 Admin: Add Place Directly</h2>
      <div style={{
        background: '#d1fae5',
        padding: '1rem',
        borderRadius: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '2rem' }}>📍</span>
        <div>
          <p style={{ fontWeight: '600', color: '#065f46' }}>Selected Location:</p>
          <p style={{ fontSize: '0.9rem', color: '#047857' }}>
            Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Restroom Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
            placeholder="e.g., SM Lanang Restroom"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="form-textarea"
            placeholder="Describe the restroom facilities..."
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="form-input"
            placeholder="e.g., SM Lanang, Davao City"
          />
        </div>

        <div className="flex space-x-4">
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Adding...' : '✅ Add Place Directly'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}