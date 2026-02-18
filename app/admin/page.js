'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [loading, setLoading] = useState(true)
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
      if (res.ok) {
        const data = await res.json()
        setPendingPlaces(data)
      }
    } catch (error) {
      console.error('Failed to fetch pending places:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/admin/pending/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (res.ok) {
        alert('Place approved!')
        fetchPendingPlaces()
      } else {
        alert('Failed to approve place')
      }
    } catch (error) {
      console.error('Failed to approve:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await fetch(`/api/admin/pending/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (res.ok) {
        alert('Place rejected!')
        fetchPendingPlaces()
      } else {
        alert('Failed to reject place')
      }
    } catch (error) {
      console.error('Failed to reject:', error)
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Access denied. Admin only.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Pending Restroom Suggestions</h2>
        </div>
        
        {pendingPlaces.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No pending places to review
          </div>
        ) : (
          <div className="divide-y">
            {pendingPlaces.map((place) => (
              <div key={place.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{place.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Submitted by: {place.user?.name || place.user?.email}
                    </p>
                    {place.description && (
                      <p className="text-gray-700 mt-2">{place.description}</p>
                    )}
                    {place.address && (
                      <p className="text-gray-500 text-sm mt-1">
                        Address: {place.address}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      Location: {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Submitted: {new Date(place.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(place.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(place.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}