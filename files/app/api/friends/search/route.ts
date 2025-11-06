import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const userId = url.searchParams.get('userId') || ''

    const { data } = await supabase
      .from('profiles')
      .select('id,username,display_name')
      .ilike('username', `%${q}%`)
      .limit(20)

    const filtered = (data || []).filter((p: any) => p.id !== userId)
    return NextResponse.json(filtered)
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}