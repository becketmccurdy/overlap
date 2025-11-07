'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { FriendListSkeleton } from './Skeleton'
import ConfirmDialog from './ConfirmDialog'

export default function FriendList({ onToggle }: { onToggle?: (id: string, active: boolean) => void }) {
  const { user } = useAuth()
  const [friends, setFriends] = useState<any[]>([])
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    loadFriends()
  }, [])

  async function loadFriends() {
    setLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      const headers: any = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/friends/list', { headers })
      const d = await res.json()
      setFriends(d || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(friendshipId: string, friendName: string) {
    setDeleting(friendshipId)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/friends/delete', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ friendshipId })
      })

      if (res.ok) {
        // Remove from local state
        setFriends((prev) => prev.filter((f) => f.friendship_id !== friendshipId))
        // If friend was active, notify parent
        if (active[friendshipId]) {
          setActive((prev) => {
            const next = { ...prev }
            delete next[friendshipId]
            return next
          })
          onToggle?.(friendshipId, false)
        }
        toast.success(`${friendName} removed from friends`)
        setConfirmDelete(null)
      } else {
        const error = await res.json()
        toast.error(`Failed to remove friend: ${error.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error('Delete friend error:', err)
      toast.error('Failed to remove friend. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <FriendListSkeleton />
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Remove Friend"
        message={`Are you sure you want to remove ${confirmDelete?.name} from your friends? This action cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id, confirmDelete.name)}
        onCancel={() => setConfirmDelete(null)}
      />

      <div className="space-y-2">
        {friends.map((f) => (
        <div key={f.id} className="flex items-center justify-between p-3 border rounded shadow-sm bg-white">
          <div className="flex-1">
            <div className="font-medium text-sm">{f.display_name || f.username}</div>
            <div className="text-xs text-gray-500">{f.username}</div>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!active[f.id]}
                onChange={(e) => {
                  setActive((s) => ({ ...s, [f.id]: e.target.checked }))
                  onToggle?.(f.id, e.target.checked)
                }}
                className="h-4 w-4"
                disabled={deleting === f.friendship_id}
              />
              <span className="text-sm">Show</span>
            </label>
            <button
              onClick={() => setConfirmDelete({ id: f.friendship_id, name: f.display_name || f.username })}
              disabled={deleting === f.friendship_id}
              className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              title="Remove friend"
            >
              {deleting === f.friendship_id ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
        ))}
        {friends.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No friends yet</p>
            <p className="text-xs text-gray-500 px-4">Add friends to see when you're both free</p>
          </div>
        )}
      </div>
    </>
  )
}