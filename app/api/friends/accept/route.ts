import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

const FriendAcceptSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  userId: z.string().uuid().optional() // Legacy fallback
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = FriendAcceptSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { requestId } = validationResult.data

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    let callerId: string | null = null
    if (token) {
      const userRes = await supabase.auth.getUser(token)
      callerId = userRes.data?.user?.id ?? null
    }
    // fallback for legacy client (not recommended)
    if (!callerId && validationResult.data.userId) callerId = validationResult.data.userId

    if (!callerId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // fetch friendship row
    const { data: rows } = await supabase.from('friendships').select('*').eq('id', requestId).limit(1)
    const row = rows?.[0]
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    // Only user_b may accept
    if (row.user_b !== callerId) {
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