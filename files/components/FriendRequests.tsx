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
        {requests.length === 0 && <div className="text-sm text-gray-500">No incoming requests</div>}
      </div>
    </div>
  )
}