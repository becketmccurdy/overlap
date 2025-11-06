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

    // incoming requests where you are user_b and status is pending
    const { data: rows } = await supabase
      .from('friendships')
      .select('*')
      .eq('user_b', userId)
      .eq('status', 'pending')

    const fromIds = (rows || []).map((r: any) => r.user_a)
    if (fromIds.length === 0) return NextResponse.json([])

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id,username,display_name')
      .in('id', fromIds)

    // map rows to include requester info
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
    const results = (rows || []).map((r: any) => ({
      id: r.id,
      from_id: r.user_a,
      from_username: profileMap.get(r.user_a)?.username,
      from_name: profileMap.get(r.user_a)?.display_name,
    }))

    return NextResponse.json(results)
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}