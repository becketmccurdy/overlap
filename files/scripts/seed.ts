/**
 * Optional Node script to seed demo data.
 * This script expects SUPABASE_SERVICE_ROLE in env and that users already exist in auth.users.
 * It reads a small mapping from env or uses example placeholders.
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE in env to run seed script')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

async function run() {
  // find colleges
  const { data: colleges } = await supabase.from('colleges').select('*').limit(2)
  const collegeA = (colleges && colleges[0]) || null

  // NOTE: create demo users via supabase auth UI or API first and replace these emails
  const demo = [
    { email: 'alice@example.com', username: 'alice', display_name: 'Alice' },
    { email: 'bob@example.com', username: 'bob', display_name: 'Bob' },
    { email: 'carol@example.com', username: 'carol', display_name: 'Carol' },
    { email: 'dave@example.com', username: 'dave', display_name: 'Dave' },
    { email: 'eve@example.com', username: 'eve', display_name: 'Eve' },
  ]

  console.log('Seed script: Please create auth users in Supabase for these emails, then insert profiles and schedule_blocks manually as needed.')
}

run()