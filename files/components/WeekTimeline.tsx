'use client'
import React, { useMemo } from 'react'
import { format, addMinutes, startOfDay, addDays } from 'date-fns'
import { motion } from 'framer-motion'

type Lane = { id: string; name: string }
export default function WeekTimeline({
  lanes,
  friendIds = [],
  weekStart,
  weekEnd,
  overlaps = [],
}: {
  lanes: Lane[]
  friendIds?: string[]
  weekStart: Date
  weekEnd: Date
  overlaps?: any[]
}) {
  const days = useMemo(() => {
    const arr = []
    for (let i = 0; i < 7; i++) arr.push(addDays(startOfDay(weekStart), i))
    return arr
  }, [weekStart])

  const slots = useMemo(() => {
    const out: Date[] = []
    const start = new Date(0)
    for (let h = 8; h < 23; h++) {
      for (let m = 0; m < 60; m += 30) {
        out.push(new Date(1970, 0, 1, h, m))
      }
    }
    return out
  }, [])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="flex gap-2">
          <div style={{ width: 160 }} className="flex-shrink-0">
            {/* empty top-left */}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-1">
            {days.map((d) => (
              <div key={d.toISOString()} className="text-sm text-center text-gray-600">{format(d, 'EEE dd')}</div>
            ))}
          </div>
        </div>

        <div className="mt-2">
          {lanes.concat(friendIds.map((id) => ({ id, name: 'Friend' }))).map((lane, idx) => (
            <div key={lane.id + idx} className="flex items-start gap-2 py-2">
              <div style={{ width: 160 }} className="text-sm text-gray-700">{lane.name}</div>
              <div className="flex-1 grid grid-cols-7 gap-1 border rounded p-2 bg-white">
                {days.map((d) => (
                  <div key={d.toISOString() + lane.id} className="relative h-24 bg-gray-50 rounded">
                    {/* Render overlap highlights that intersect this day */}
                    {overlaps.map((o: any, i: number) => {
                      const os = new Date(o.start)
                      const oe = new Date(o.end)
                      if (os.toDateString() !== d.toDateString()) return null
                      const durationMins = (oe.getTime() - os.getTime()) / (1000 * 60)
                      const top = ((os.getHours() - 8) * 60 + os.getMinutes()) / ((23 - 8) * 60) * 96
                      const height = Math.max(8, (durationMins / ((23 - 8) * 60)) * 96)
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 1 }}
                          className={`absolute left-1 right-1 rounded ${o.count >= 3 && (oe.getTime() - os.getTime()) >= 2 * 60 * 60 * 1000 ? 'ring-2 ring-indigo-300' : ''}`}
                          style={{ top, height, background: 'rgba(124,58,237,0.12)' }}
                        />
                      )
                    })}
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