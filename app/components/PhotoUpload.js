'use client'

import { useState } from 'react'

export default function PhotoUpload({ placeId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.')
        return
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
        return
      }

      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('placeId', placeId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        alert('✅ Photo uploaded successfully!')
        onUploadComplete(data.photo)
        setPreview(null)
        e.target.value = '' // Reset file input
      } else {
        setError(data.error || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="photo-upload">
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      <label className="upload-btn">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={(e) => {
            handleFileChange(e)
            handleUpload(e)
          }}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: uploading ? '#e2e8f0' : '#edf2f7',
          borderRadius: '2rem',
          cursor: uploading ? 'not-allowed' : 'pointer',
          border: '2px dashed #a0aec0',
          transition: 'all 0.2s',
          opacity: uploading ? 0.7 : 1
        }}>
          <span style={{ fontSize: '1.2rem' }}>{uploading ? '⏳' : '📸'}</span>
          <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
        </div>
      </label>
      
      {preview && (
        <div style={{ marginTop: '1rem' }}>
          <img 
            src={preview} 
            alt="Preview" 
            style={{ 
              maxWidth: '200px', 
              maxHeight: '200px', 
              borderRadius: '0.5rem',
              border: '2px solid #667eea'
            }} 
          />
        </div>
      )}
    </div>
  )
}