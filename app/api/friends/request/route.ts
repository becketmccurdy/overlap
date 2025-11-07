import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { rateLimit, getRateLimitIdentifier } from '../../../../lib/rateLimit'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

const FriendRequestSchema = z.object({
  targetUserId: z.string().uuid('Invalid target user ID'),
  requesterId: z.string().uuid().optional() // Legacy fallback
})

export async function POST(req: Request) {
  // Rate limiting: 10 friend requests per minute per IP
  const rateLimitId = getRateLimitIdentifier(req)
  const rateLimitResult = rateLimit(rateLimitId, { maxRequests: 10, windowMs: 60000 })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    )
  }

  try {
    const body = await req.json()

    // Validate input
    const validationResult = FriendRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { targetUserId } = validationResult.data

    // Prefer authorization header token; fall back to explicit requesterId if provided (legacy)
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    let callerId: string | null = null
    if (token) {
      const userRes = await supabase.auth.getUser(token)
      callerId = userRes.data?.user?.id ?? null
    }
    // fallback (not recommended): allow client to supply a requesterId
    if (!callerId && validationResult.data.requesterId) callerId = validationResult.data.requesterId

    if (!callerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // enforce consistent ordering user_a < user_b to avoid duplicates
    const [user_a, user_b] = callerId < targetUserId ? [callerId, targetUserId] : [targetUserId, callerId]

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