import { addMinutes, eachDayOfInterval, formatISO } from 'date-fns'
import { timesOverlap, parseTimeToMinutes } from './time'

type ScheduleBlock = {
  id: string
  user_id: string
  title: string
  type: string
  start_time: string // "HH:mm"
  end_time: string
  days_of_week: number[] // 0..6
  start_date: string // date ISO
  end_date?: string | null
}

export function overlapWindows(map: Map<string, ScheduleBlock[]>, weekStart: Date, weekEnd: Date, minUsers = 2) {
  // Build for each day (weekStart..weekEnd) 30-min slots from 08:00 - 23:00
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const slots: { start: Date; end: Date; dayIndex: number; startMinutes: number }[] = []

  days.forEach((d, di) => {
    for (let h = 8; h < 23; h++) {
      for (let m = 0; m < 60; m += 30) {
        const start = new Date(d)
        start.setHours(h, m, 0, 0)
        const end = addMinutes(start, 30)
        slots.push({ start, end, dayIndex: di, startMinutes: h * 60 + m })
      }
    }
  })

  const userIds = Array.from(map.keys())
  const slotFreeUsers: { slotIndex: number; freeUsers: string[] }[] = []

  slots.forEach((slot, si) => {
    const freeUsers: string[] = []
    for (const [userId, blocks] of map.entries()) {
      // determine if any block from this user conflicts with slot
      let busy = false
      for (const b of blocks || []) {
        // check day of week
        const dow = slot.start.getDay()
        if (!b.days_of_week || !b.days_of_week.includes(dow)) continue
        // check date window
        const slotDateISO = slot.start.toISOString().slice(0, 10)
        if (b.start_date && b.start_date > slotDateISO) continue
        if (b.end_date && b.end_date < slotDateISO) continue
        // check time overlap
        if (timesOverlap(b.start_time, b.end_time, `${String(slot.start.getHours()).padStart(2,'0')}:${String(slot.start.getMinutes()).padStart(2,'0')}`, `${String(slot.end.getHours()).padStart(2,'0')}:${String(slot.end.getMinutes()).padStart(2,'0')}`)) {
          busy = true
          break
        }
      }
      if (!busy) freeUsers.push(userId)
    }
    slotFreeUsers.push({ slotIndex: si, freeUsers })
  })

  // Merge adjacent slots with same freeUsers membership
  const windows: { start: Date; end: Date; freeUsers: string[]; count: number }[] = []
  let cur: any = null
  for (let i = 0; i < slotFreeUsers.length; i++) {
    const sfu = slotFreeUsers[i]
    const slot = slots[sfu.slotIndex]
    const key = sfu.freeUsers.sort().join(',')
    if (!cur) {
      cur = { key, start: slot.start, end: slot.end, freeUsers: sfu.freeUsers.slice() }
    } else {
      const prevKey = cur.key
      if (prevKey === key) {
        cur.end = slot.end
      } else {
        if (cur.freeUsers.length >= minUsers) windows.push({ start: cur.start, end: cur.end, freeUsers: cur.freeUsers, count: cur.freeUsers.length })
        cur = { key, start: slot.start, end: slot.end, freeUsers: sfu.freeUsers.slice() }
      }
    }
  }
  if (cur && cur.freeUsers.length >= minUsers) windows.push({ start: cur.start, end: cur.end, freeUsers: cur.freeUsers, count: cur.freeUsers.length })

  // return windows with ISO
  return windows.map((w) => ({ start: w.start.toISOString(), end: w.end.toISOString(), freeUsers: w.freeUsers, count: w.count }))
}

export function formatDuration(startISO: string, endISO: string) {
  const s = new Date(startISO)
  const e = new Date(endISO)
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric' }
  return `${s.toLocaleTimeString([], opts)} — ${e.toLocaleTimeString([], opts)}`
}