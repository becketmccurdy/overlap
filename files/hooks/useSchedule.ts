import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function useSchedule(userId?: string) {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchBlocks() {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase.from('schedule_blocks').select('*').eq('user_id', userId)
    setBlocks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchBlocks()
  }, [userId])

  async function addBlock(payload: any) {
    const { data, error } = await supabase.from('schedule_blocks').insert([
      {
        user_id: userId,
        title: payload.title,
        type: payload.type,
        recurrence_rule: null,
        start_time: payload.start_time,
        end_time: payload.end_time,
        days_of_week: payload.days_of_week,
        start_date: payload.start_date,
        end_date: payload.end_date,
        color: payload.color,
      },
    ])
    if (!error) fetchBlocks()
    return { data, error }
  }

  async function deleteBlock(id: string) {
    const { error } = await supabase.from('schedule_blocks').delete().eq('id', id)
    if (!error) fetchBlocks()
    return { error }
  }

  return { blocks, loading, addBlock, deleteBlock, refetch: fetchBlocks }
}