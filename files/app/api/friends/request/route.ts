import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { requesterId, targetUserId } = body
    if (!requesterId || !targetUserId) {
      return NextResponse.json({ error: 'missing' }, { status: 400 })
    }

    // enforce consistent ordering user_a < user_b to avoid duplicates
    const [user_a, user_b] = requesterId < targetUserId ? [requesterId, targetUserId] : [targetUserId, requesterId]

    // check existing
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_a', user_a)
      .eq('user_b', user_b)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, existing: existing[0] })
    }

    const { data, error } = await supabase
      .from('friendships')
      .insert([{ user_a, user_b, status: 'pending' }])

    if (error) {
      console.error('friend request error', error)
      return NextResponse.json({ error: 'db' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, friendship: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}