'use client'
import React, { useEffect, useMemo, useState } from 'react'
import AddBlockForm from '../../components/AddBlockForm'
import WeekTimeline from '../../components/WeekTimeline'
import FriendList from '../../components/FriendList'
import { useAuth } from '../../contexts/AuthContext'
import { useSchedule } from '../../hooks/useSchedule'
import { formatISO, startOfWeek, addDays } from 'date-fns'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { blocks, refetch } = useSchedule(user?.id || '')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), [])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const [overlaps, setOverlaps] = useState<any[]>([])
  const [minUsers, setMinUsers] = useState(2)

  useEffect(() => {
    // fetch overlaps for you + selected friends
    const ids = [user?.id, ...selectedFriendIds].filter(Boolean)
    if (ids.length === 0) return
    fetch('/api/overlap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: ids,
        weekStartISO: formatISO(weekStart),
        weekEndISO: formatISO(weekEnd),
        minUsers,
      }),
    })
      .then((r) => r.json())
      .then((data) => setOverlaps(data))
      .catch(() => setOverlaps([]))
  }, [selectedFriendIds, weekStart, weekEnd, minUsers, user?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Your schedule</h3>
          <AddBlockForm onAdded={refetch} />
          <div className="mt-4">
            <FriendList onToggle={(id, active) => {
              setSelectedFriendIds((s) => (active ? [...s, id] : s.filter((x) => x !== id)))
            }} />
          </div>
        </div>
        <div className="md:flex-1 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Week timeline</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Min users</label>
              <input
                type="number"
                min={1}
                max={10}
                value={minUsers}
                onChange={(e) => setMinUsers(Number(e.target.value))}
                className="w-16 border px-2 py-1 rounded"
              />
            </div>
          </div>
          <WeekTimeline
            lanes={[{ id: user?.id || '', name: profile?.display_name || profile?.username || 'You' }]}
            friendIds={selectedFriendIds}
            weekStart={weekStart}
            weekEnd={weekEnd}
            overlaps={overlaps}
          />
          <div className="mt-4">
            <h4 className="font-medium">Group free times</h4>
            <div className="space-y-2 mt-2">
              {overlaps.slice(0, 5).map((w: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{new Date(w.start).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{new Date(w.end).toLocaleString()}</div>
                  </div>
                  <div className="text-sm bg-indigo-50 px-2 py-1 rounded">{w.count} free</div>
                </div>
              ))}
              {overlaps.length === 0 && <div className="text-sm text-gray-500">No free windows found</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}