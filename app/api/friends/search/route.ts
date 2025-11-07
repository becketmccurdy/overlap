import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const SearchSchema = z.object({
  q: z.string().min(1, 'Search query required').max(100, 'Search query too long'),
  userId: z.string().uuid('Invalid user ID').optional()
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') || ''
    const userId = url.searchParams.get('userId') || undefined

    // Validate input
    const validationResult = SearchSchema.safeParse({ q, userId })
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { q: validQuery, userId: validUserId } = validationResult.data

    const { data } = await supabase
      .from('profiles')
      .select('id,username,display_name')
      .ilike('username', `%${validQuery}%`)
      .limit(20)

    const filtered = (data || []).filter((p: any) => p.id !== validUserId)
    return NextResponse.json(filtered)
  } catch (err) {
    console.error(err)
    return NextResponse.json([], { status: 500 })
  }
}