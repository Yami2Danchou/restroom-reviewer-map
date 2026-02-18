'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  })
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    fetchPendingPlaces()
  }, [])

  const fetchPendingPlaces = async () => {
    try {
      const res = await fetch('/api/admin/pending')
      const data = await res.json()
      setPendingPlaces(data)
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter(p => p.status === 'pending').length,
        approved: data.filter(p => p.status === 'approved').length,
        rejected: data.filter(p => p.status === 'rejected').length
      })
    } catch (error) {
      console.error('Failed to fetch pending places:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`/api/admin/pending/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (res.ok) {
        alert(`✅ Suggestion ${action}ed successfully!`)
        fetchPendingPlaces()
      } else {
        alert(`Failed to ${action} suggestion`)
      }
    } catch (error) {
      console.error(`Failed to ${action} suggestion:`, error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ background: '#fef3c7' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#92400e' }}>Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>{stats.pending}</p>
        </div>
        <div className="card" style={{ background: '#d1fae5' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#065f46' }}>Approved</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>{stats.approved}</p>
        </div>
        <div className="card" style={{ background: '#fee2e2' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#991b1b' }}>Rejected</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }}>{stats.rejected}</p>
        </div>
        <div className="card" style={{ background: '#e2e8f0' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#2d3748' }}>Total</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d3748' }}>{stats.total}</p>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Guest Suggestions Pending Approval</h2>
        {pendingPlaces.filter(p => p.status === 'pending').length === 0 ? (
          <p className="text-gray-500">No pending suggestions to review</p>
        ) : (
          <div className="space-y-4">
            {pendingPlaces.filter(p => p.status === 'pending').map((place) => (
              <div key={place.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{place.name}</h3>
                    <p className="text-gray-600">{place.description}</p>
                    <p className="text-sm text-gray-500">📍 {place.address || 'No address provided'}</p>
                    <p className="text-sm text-gray-500">
                      Coordinates: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginTop: '0.5rem',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{ color: '#718096' }}>
                        👤 By: {place.user?.name || place.user?.email}
                      </span>
                      <span style={{ color: '#718096' }}>
                        📅 {new Date(place.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAction(place.id, 'approve')}
                      className="btn btn-success"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleAction(place.id, 'reject')}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {(stats.approved > 0 || stats.rejected > 0) && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">History</h2>
          <div className="space-y-2">
            {pendingPlaces.filter(p => p.status !== 'pending').map((place) => (
              <div key={place.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{place.name}</span>
                  <span className="text-sm text-gray-500 ml-2">by {place.user?.name || place.user?.email}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  place.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {place.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}