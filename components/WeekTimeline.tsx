'use client'
import React, { useMemo } from 'react'
import { format, addMinutes, startOfDay, addDays, differenceInMinutes, parseISO } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { motion } from 'framer-motion'

type Lane = { id: string; name: string }

export default function WeekTimeline({
  lanes,
  friendIds = [],
  weekStart,
  weekEnd,
  overlaps = [],
  debugShowRaw = false,
}: {
  lanes: Lane[]
  friendIds?: string[]
  weekStart: Date
  weekEnd: Date
  overlaps?: any[]
  debugShowRaw?: boolean
}) {
  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < 7; i++) arr.push(addDays(startOfDay(weekStart), i))
    return arr
  }, [weekStart])

  // slots span 08:00 - 23:00 (900 minutes total)
  const dayStartHour = 8
  const dayEndHour = 23
  const dayTotalMinutes = (dayEndHour - dayStartHour) * 60

  // Get viewer's local timezone
  const timeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  // Helper to convert UTC ISO timestamp to local zoned Date and compute top/height
  function computeStyleForRangeISO(startISO: string, endISO: string) {
    const start = utcToZonedTime(parseISO(startISO), timeZone)
    const end = utcToZonedTime(parseISO(endISO), timeZone)

    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const topPct = ((startMinutes - dayStartHour * 60) / dayTotalMinutes) * 100
    const heightPct = ((endMinutes - startMinutes) / dayTotalMinutes) * 100

    // Ensure minimum height for visibility
    const minHeightPct = 1.5 // ~10px at typical heights
    const finalHeightPct = Math.max(heightPct, minHeightPct)

    return {
      top: `${Math.max(0, topPct)}%`,
      height: `${finalHeightPct}%`,
      localStart: start,
      localEnd: end
    }
  }

  // Debug: log overlaps when they change
  if (debugShowRaw && overlaps.length > 0) {
    console.log('[WeekTimeline Debug] Overlaps received:', overlaps)
    console.log('[WeekTimeline Debug] Viewer timezone:', timeZone)
  }

  // Framer Motion typing workaround:
  // some versions of framer-motion's motion.div don't accept a generic type param.
  // Cast to a loose component type so className/style/title are allowed.
  const MotionDiv: React.ComponentType<any> = motion.div as unknown as React.ComponentType<any>

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="flex gap-2 items-center mb-2">
          <div style={{ width: 160 }} />
          <div className="flex-1 grid grid-cols-7 gap-1">
            {days.map((d) => (
              <div key={d.toISOString()} className="text-sm text-center text-gray-600">
                {format(d, 'EEE dd')}
              </div>
            ))}
          </div>
        </div>

        <div>
          {lanes.concat(friendIds.map((id) => ({ id, name: 'Friend' }))).map((lane, idx) => (
            <div key={lane.id + '-' + idx} className="flex items-start gap-2 py-2">
              <div style={{ width: 160 }} className="text-sm text-gray-700">
                {lane.name}
              </div>

              <div className="flex-1 grid grid-cols-7 gap-1 border rounded p-2 bg-white">
                {days.map((d) => (
                  <div key={d.toISOString() + lane.id} className="relative h-36 bg-gray-50 rounded overflow-hidden">
                    {/* Render overlap highlights that intersect this day */}
                    {overlaps.map((o: any, i: number) => {
                      // Convert UTC ISO timestamps to local time
                      const { top, height, localStart, localEnd } = computeStyleForRangeISO(o.start, o.end)

                      // Check if the local date matches this day cell
                      const localDateStr = localStart.toDateString()
                      const cellDateStr = d.toDateString()
                      if (localDateStr !== cellDateStr) return null

                      // Debug logging
                      if (debugShowRaw) {
                        console.log(`[Overlap ${i}] UTC: ${o.start} → ${o.end}`)
                        console.log(`[Overlap ${i}] Local: ${localStart.toString()} → ${localEnd.toString()}`)
                        console.log(`[Overlap ${i}] Day cell: ${cellDateStr}, overlap date: ${localDateStr}`)
                        console.log(`[Overlap ${i}] Style: top=${top}, height=${height}`)
                      }

                      const longEnough = differenceInMinutes(localEnd, localStart) >= 120
                      const highCount = o.count >= 3

                      return (
                        <MotionDiv
                          key={i}
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`absolute left-2 right-2 rounded border border-indigo-400 ${highCount && longEnough ? 'ring-2 ring-indigo-300' : ''}`}
                          style={{
                            top,
                            height,
                            background: 'rgba(124,58,237,0.3)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          }}
                          title={`${localStart.toLocaleTimeString()} — ${localEnd.toLocaleTimeString()} (${o.count} free)`}
                        >
                          {debugShowRaw && (
                            <div className="text-[8px] p-1 leading-tight text-indigo-900 font-mono">
                              {localStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              <br />
                              {localEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              <br />
                              UTC: {o.start.slice(11, 16)}
                            </div>
                          )}
                        </MotionDiv>
                      )
                    })}
                    {/* hour grid lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* optional subtle lines */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}