'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FriendRequests from '../../components/FriendRequests'
import FriendList from '../../components/FriendList'

export default function FriendsPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // no-op, refreshKey can be used to re-fetch dynamic lists
  }, [refreshKey])

  async function search() {
    if (!query) return
    const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}&userId=${encodeURIComponent(user?.id || '')}`)
    const data = await res.json()
    setResults(data)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Find friends</h3>
        <div className="flex gap-2 mt-3">
          <input className="flex-1 border px-3 py-2 rounded" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button onClick={search} className="px-4 py-2 bg-indigo-600 text-white rounded">Search</button>
        </div>
        <div className="mt-3 space-y-2">
          {results.map((r) => (
            <div key={r.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <div className="font-medium">{r.display_name || r.username}</div>
                <div className="text-sm text-gray-600">{r.username}</div>
              </div>
              <button
                onClick={async () => {
                  if (!user?.id) return
                  await fetch('/api/friends/request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requesterId: user.id, targetUserId: r.id }),
                  })
                  setRefreshKey((k) => k + 1)
                }}
                className="px-3 py-1 border rounded"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <FriendRequests onAction={() => setRefreshKey((k) => k + 1)} />
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Your friends</h3>
        <FriendList onToggle={() => {}} />
      </div>
    </div>
  )
}