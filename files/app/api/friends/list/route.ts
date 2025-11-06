import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return NextResponse.json([], { status: 400 })

    const { data: rows } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('status', 'accepted')

    const otherIds = (rows || []).map((r: any) => (r.user_a === userId ? r.user_b : r.user_a))
    if (otherIds.length === 0) return NextResponse.json([])

    const { data: profiles } = await supabase.from('profiles').select('id,username,display_name').in('id', otherIds)
    return NextResponse.json(profiles || [])
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}