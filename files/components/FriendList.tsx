'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function FriendList({ onToggle }: { onToggle?: (id: string, active: boolean) => void }) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<any[]>([])
  const [active, setActive] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/friends/list?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((d) => setFriends(d || []))
  }, [user?.id])

  return (
    <div className="space-y-2">
      {friends.map((f) => (
        <div key={f.id} className="flex items-center justify-between p-2 border rounded">
          <div>
            <div className="font-medium">{f.display_name || f.username}</div>
            <div className="text-sm text-gray-600">{f.username}</div>
          </div>
          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!active[f.id]}
                onChange={(e) => {
                  setActive((s) => ({ ...s, [f.id]: e.target.checked }))
                  onToggle?.(f.id, e.target.checked)
                }}
              />
              <span className="text-sm">Show</span>
            </label>
          </div>
        </div>
      ))}
      {friends.length === 0 && <div className="text-sm text-gray-500">No friends yet</div>}
    </div>
  )
}