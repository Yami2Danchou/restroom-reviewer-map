'use client'

import { useState } from 'react'

export default function PhotoUpload({ placeId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
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
    const formData = new FormData()
    formData.append('file', file)
    formData.append('placeId', placeId)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        alert('✅ Photo uploaded successfully!')
        onUploadComplete(data.photo)
        setPreview(null)
        e.target.value = '' // Reset file input
      } else {
        alert('Failed to upload photo')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="photo-upload">
      <label className="upload-btn">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#edf2f7',
          borderRadius: '2rem',
          cursor: 'pointer',
          border: '2px dashed #a0aec0'
        }}>
          <span>📸</span>
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
          <button
            onClick={() => {
              // Trigger upload with the file
              const input = document.querySelector('input[type="file"]')
              if (input && input.files[0]) {
                const formData = new FormData()
                formData.append('file', input.files[0])
                formData.append('placeId', placeId)
                
                fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                }).then(res => {
                  if (res.ok) {
                    alert('✅ Photo uploaded!')
                    setPreview(null)
                  }
                })
              }
            }}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', padding: '0.25rem 1rem' }}
          >
            Confirm Upload
          </button>
        </div>
      )}
    </div>
  )
}