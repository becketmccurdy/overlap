import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { overlapWindows } from '../../../lib/overlapCalculator'
import { parseISO, startOfDay, endOfDay } from 'date-fns'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userIds, weekStartISO, weekEndISO, minUsers = 2 } = body
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    // fetch schedule_blocks for these users within the date range
    const qWeekStart = startOfDay(parseISO(weekStartISO))
    const qWeekEnd = endOfDay(parseISO(weekEndISO))

    const { data, error } = await supabase
      .from('schedule_blocks')
      .select('*')
      .in('user_id', userIds)
      .gte('end_date', qWeekStart.toISOString().slice(0, 10))
      .lte('start_date', qWeekEnd.toISOString().slice(0, 10))

    // If the above filters exclude null end_date, fetch null end_date separately
    let blocks = data || []
    if (error) {
      console.error('supabase error', error)
    }

    // If some blocks have null end_date or dates outside the range, do a wider fetch
    const { data: extra } = await supabase
      .from('schedule_blocks')
      .select('*')
      .in('user_id', userIds)
      .or('end_date.is.null,start_date.lte.' + qWeekEnd.toISOString().slice(0, 10))

    if (extra) {
      // merge unique
      const map = new Map(blocks.map((b: any) => [b.id, b]))
      for (const e of extra) map.set(e.id, e)
      blocks = Array.from(map.values())
    }

    // Group blocks by user
    const map = new Map<string, any[]>()
    for (const id of userIds) map.set(id, [])
    for (const b of blocks) {
      if (!map.has(b.user_id)) map.set(b.user_id, [])
      map.get(b.user_id)!.push(b)
    }

    const result = overlapWindows(map as Map<string, any[]>, qWeekStart, qWeekEnd, minUsers)
    return NextResponse.json(result)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}