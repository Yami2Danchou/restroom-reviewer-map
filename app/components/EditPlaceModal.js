'use client'

import { useState, useEffect } from 'react'

export default function EditPlaceModal({ place, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    category: '',
    district: '',
    barangay: '',
    latitude: '',
    longitude: '',
    city: 'Davao City'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        description: place.description || '',
        address: place.address || '',
        category: place.category || '',
        district: place.district || '',
        barangay: place.barangay || '',
        latitude: place.latitude || '',
        longitude: place.longitude || '',
        city: place.city || 'Davao City'
      })
    }
  }, [place])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/places/${place.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        alert('✅ Place updated successfully!')
        onSave(data.place)
        onClose()
      } else {
        setError(data.error || 'Failed to update place')
      }
    } catch (error) {
      console.error('Failed to update place:', error)
      setError('Failed to update place')
    } finally {
      setLoading(false)
    }
  }

const handleDelete = async () => {
  if (!confirm('⚠️ Are you sure you want to delete this place? This action cannot be undone.')) {
    return
  }

  setLoading(true)
  setError(null)

  try {
    console.log('Deleting place with ID:', place.id)
    
    const res = await fetch(`/api/admin/places/${place.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    const data = await res.json()
    console.log('Delete response:', data)

    if (res.ok && data.success) {
      alert('✅ Place deleted successfully!')
      onSave(null) // Signal that place was deleted
      onClose()
    } else {
      setError(data.error || 'Failed to delete place')
    }
  } catch (error) {
    console.error('Failed to delete place:', error)
    setError('Failed to delete place: ' + error.message)
  } finally {
    setLoading(false)
  }
}
  if (!place) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            ✏️ Edit Restroom
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#718096',
              padding: '0.5rem'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
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
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
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
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem',
                  minHeight: '100px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
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
                  border: '2px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
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
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
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
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.3rem' }}>
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}