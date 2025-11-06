import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { requestId, userId } = body
    if (!requestId || !userId) return NextResponse.json({ error: 'missing' }, { status: 400 })

    // verify that the user is allowed to accept (must be user_b)
    const { data: rows } = await supabase.from('friendships').select('*').eq('id', requestId).limit(1)
    const row = rows?.[0]
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    if (row.user_b !== userId) {
      return NextResponse.json({ error: 'not_allowed' }, { status: 403 })
    }

    const { data, error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId)
    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'db' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, friendship: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}