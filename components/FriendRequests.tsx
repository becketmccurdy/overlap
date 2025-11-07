'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function FriendRequests({ onAction }: { onAction?: () => void }) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/friends/requests?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((d) => setRequests(d || []))
  }, [user?.id, onAction])

  async function accept(id: string) {
    if (!user?.id) return
    await fetch('/api/friends/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, userId: user.id }),
    })
    setRequests((s) => s.filter((r) => r.id !== id))
    onAction?.()
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold">Incoming requests</h4>
      <div className="mt-3 space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="flex justify-between items-center p-2 border rounded">
            <div>
              <div className="font-medium">{r.from_name || r.from_username}</div>
              <div className="text-sm text-gray-600">{r.from_username}</div>
            </div>
            <button onClick={() => accept(r.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">Accept</button>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
            <div className="text-3xl mb-2">📬</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No friend requests</p>
            <p className="text-xs text-gray-500">When someone sends you a friend request, it will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}