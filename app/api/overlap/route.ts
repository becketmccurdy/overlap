import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { rateLimit, getRateLimitIdentifier } from '../../../lib/rateLimit'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE

if (!SUPA_URL || !SUPA_KEY) {
  console.warn('Missing Supabase URL / service role key for overlap API')
}

const sb = createClient(SUPA_URL || '', SUPA_KEY || '', { auth: { persistSession: false } })

// Validation schema for overlap request
const OverlapRequestSchema = z.object({
  userIds: z.array(z.string().uuid('Invalid user ID format')).min(1, 'At least one user ID required').max(10, 'Maximum 10 users allowed'),
  weekStartISO: z.string().datetime('Invalid weekStartISO format'),
  weekEndISO: z.string().datetime('Invalid weekEndISO format'),
  minUsers: z.number().int().min(1).max(10).optional().default(2)
})

type BlockRow = {
  id: string
  user_id: string
  title: string
  start_time: string
  end_time: string
  days_of_week: number[]
  start_date: string
  end_date: string | null
}

function toDateOnly(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export async function POST(req: NextRequest) {
  // Rate limiting: 60 overlap calculations per minute per IP
  const rateLimitId = getRateLimitIdentifier(req)
  const rateLimitResult = rateLimit(rateLimitId, { maxRequests: 60, windowMs: 60000 })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))

    // Validate request body
    const validationResult = OverlapRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { userIds, weekStartISO, weekEndISO, minUsers } = validationResult.data
    const weekStart = new Date(weekStartISO)
    const weekEnd = new Date(weekEndISO)
    const dayStart = toDateOnly(weekStart)
    const dayEnd = toDateOnly(weekEnd)

    // fetch candidate blocks for these users (no generic on .from to avoid SDK generic mismatch)
    const { data, error } = await sb
      .from('schedule_blocks')
      .select('*')
      .in('user_id', userIds)

    if (error) {
      console.error('supabase fetch error', error)
      return NextResponse.json({ error: 'db error fetching blocks', details: error.message }, { status: 500 })
    }

    const blocks: BlockRow[] = (data as any) || []

    // filter blocks to ones that could intersect the week range
    const candidates = blocks.filter((b) => {
      const bStart = new Date(b.start_date)
      const bEnd = b.end_date ? new Date(b.end_date) : null
      if (bStart > dayEnd) return false
      if (bEnd && bEnd < dayStart) return false
      return true
    })

    // expand occurrences and produce events
    const events: { ts: number; delta: number; blockId: string; userId: string }[] = []
    for (const b of candidates) {
      for (let d = new Date(dayStart); d <= dayEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        const dow = d.getUTCDay()
        if (!Array.isArray(b.days_of_week)) continue
        if (!b.days_of_week.includes(dow)) continue

        const occDateStr = d.toISOString().slice(0, 10)
        if (new Date(occDateStr) < new Date(b.start_date)) continue
        if (b.end_date && new Date(occDateStr) > new Date(b.end_date)) continue

        const startTime = b.start_time.slice(0, 8)
        const endTime = b.end_time.slice(0, 8)
        const startISO = `${occDateStr}T${startTime}Z`
        const endISO = `${occDateStr}T${endTime}Z`
        const startMs = new Date(startISO).getTime()
        const endMs = new Date(endISO).getTime()
        if (isNaN(startMs) || isNaN(endMs)) continue
        if (endMs <= startMs) continue

        events.push({ ts: startMs, delta: 1, blockId: b.id, userId: b.user_id })
        events.push({ ts: endMs, delta: -1, blockId: b.id, userId: b.user_id })
      }
    }

    if (events.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    events.sort((a, b) => (a.ts - b.ts) || (b.delta - a.delta))

    let running = 0
    let windowStart: number | null = null
    const windows: { start: string; end: string; count: number }[] = []

    for (const ev of events) {
      const prevRunning = running
      running += ev.delta

      if (prevRunning < minUsers && running >= minUsers) {
        windowStart = ev.ts
      }

      if (prevRunning >= minUsers && running < minUsers && windowStart !== null) {
        windows.push({
          start: new Date(windowStart).toISOString(),
          end: new Date(ev.ts).toISOString(),
          count: prevRunning
        })
        windowStart = null
      }
    }

    // If there's still an open window at the end, close it at the weekEnd boundary
    if (windowStart !== null && running >= minUsers) {
      windows.push({
        start: new Date(windowStart).toISOString(),
        end: weekEndISO, // Close at the requested week boundary, not last event
        count: running
      })
    }

    return NextResponse.json(windows, { status: 200 })
  } catch (err: any) {
    console.error('overlap handler error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}