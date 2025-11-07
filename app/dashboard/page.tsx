'use client'
import React, { useEffect, useMemo, useState } from 'react'
import AddBlockForm from '../../components/AddBlockForm'
import ScheduleBlocksList from '../../components/ScheduleBlocksList'
import WeekTimeline from '../../components/WeekTimeline'
import FriendList from '../../components/FriendList'
import { useAuth } from '../../contexts/AuthContext'
import { useSchedule } from '../../hooks/useSchedule'
import { formatISO, startOfWeek, addDays } from 'date-fns'
import { ScheduleBlockSkeleton } from '../../components/Skeleton'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { blocks, loading: scheduleLoading, deleteBlock, refetch } = useSchedule(user?.id || '')
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), [])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const [overlaps, setOverlaps] = useState<any[]>([])
  const [overlapError, setOverlapError] = useState<string | null>(null)
  const [overlapLoading, setOverlapLoading] = useState(false)
  const [minUsers, setMinUsers] = useState(2)
  const [debugMode, setDebugMode] = useState(false)
  const [editingBlock, setEditingBlock] = useState<any | null>(null)

  useEffect(() => {
    // fetch overlaps for you + selected friends
    const ids = [user?.id, ...selectedFriendIds].filter(Boolean)
    if (ids.length === 0) {
      setOverlaps([])
      setOverlapError(null)
      return
    }

    setOverlapLoading(true)
    setOverlapError(null)

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
      .then(async (r) => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `HTTP ${r.status}`)
        }
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setOverlaps(data)
          setOverlapError(null)
        } else {
          throw new Error('Invalid response format')
        }
      })
      .catch((err) => {
        console.error('Overlap fetch error:', err)
        setOverlaps([])
        const errorMsg = err.message || 'Failed to calculate overlaps'
        setOverlapError(errorMsg)
        toast.error(`Failed to calculate overlaps: ${errorMsg}`)
      })
      .finally(() => {
        setOverlapLoading(false)
      })
  }, [selectedFriendIds, weekStart, weekEnd, minUsers, user?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Your schedule</h3>
          <AddBlockForm
            onAdded={refetch}
            editingBlock={editingBlock}
            onCancelEdit={() => setEditingBlock(null)}
          />
          {scheduleLoading ? (
            <ScheduleBlockSkeleton />
          ) : (
            <ScheduleBlocksList
              blocks={blocks}
              onEdit={(block) => setEditingBlock(block)}
              onDelete={async (id) => {
                await deleteBlock(id)
                refetch()
              }}
            />
          )}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Friends</h4>
            <FriendList
              onToggle={(id, active) => {
                setSelectedFriendIds((s) => (active ? [...s, id] : s.filter((x) => x !== id)))
              }}
            />
          </div>
        </div>
        <div className="md:flex-1 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Week timeline</h3>
            <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="debugMode"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="debugMode" className="text-sm text-gray-600">Debug</label>
              </div>
            </div>
          </div>
          <WeekTimeline
            lanes={[{ id: user?.id || '', name: profile?.display_name || profile?.username || 'You' }]}
            friendIds={selectedFriendIds}
            weekStart={weekStart}
            weekEnd={weekEnd}
            overlaps={overlaps}
            debugShowRaw={debugMode}
          />
          <div className="mt-4">
            <h4 className="font-medium">Group free times</h4>
            <div className="space-y-2 mt-2">
              {overlapLoading && (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                  <div className="text-3xl mb-2">⏳</div>
                  <p className="text-sm font-medium text-gray-700">Calculating overlaps...</p>
                </div>
              )}
              {!overlapLoading && overlapError && (
                <div className="text-center py-6 bg-red-50 rounded border border-red-200">
                  <div className="text-3xl mb-2">⚠️</div>
                  <p className="text-sm font-medium text-red-700 mb-1">Failed to load overlaps</p>
                  <p className="text-xs text-red-600 mb-3">{overlapError}</p>
                  <button
                    onClick={() => {
                      // Trigger refetch by updating minUsers to current value
                      setMinUsers(minUsers)
                    }}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              )}
              {!overlapLoading && !overlapError && overlaps.slice(0, 5).map((w: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{new Date(w.start).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{new Date(w.end).toLocaleString()}</div>
                  </div>
                  <div className="text-sm bg-indigo-50 px-2 py-1 rounded">{w.count} free</div>
                </div>
              ))}
              {!overlapLoading && !overlapError && overlaps.length === 0 && selectedFriendIds.length > 0 && (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No overlapping free time found</p>
                  <p className="text-xs text-gray-500">Try adjusting the minimum users or adding more schedule blocks</p>
                </div>
              )}
              {!overlapLoading && !overlapError && overlaps.length === 0 && selectedFriendIds.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                  <div className="text-3xl mb-2">👈</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Select friends to find overlap</p>
                  <p className="text-xs text-gray-500">Check the "Show" box next to friends to see when you're both free</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}