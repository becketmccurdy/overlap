import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

const DeleteFriendSchema = z.object({
  friendshipId: z.string().uuid('Invalid friendship ID'),
  userId: z.string().uuid().optional() // Legacy fallback
})

export async function DELETE(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = DeleteFriendSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { friendshipId } = validationResult.data

    // Get authenticated user
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    let callerId: string | null = null
    if (token) {
      const userRes = await supabase.auth.getUser(token)
      callerId = userRes.data?.user?.id ?? null
    }
    // Legacy fallback
    if (!callerId && validationResult.data.userId) callerId = validationResult.data.userId

    if (!callerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Fetch friendship to verify caller is a participant
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    // Only participants can delete the friendship
    if (friendship.user_a !== callerId && friendship.user_b !== callerId) {
      return NextResponse.json({ error: 'Not authorized to delete this friendship' }, { status: 403 })
    }

    // Delete the friendship
    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (deleteError) {
      console.error('Delete friendship error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete friendship' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Friendship deleted successfully' })
  } catch (err) {
    console.error('Delete friend handler error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
