// Lightweight JS seed helper. This script does not create auth.users.
// It will insert demo colleges and log instructions for creating demo accounts.
// Run with: node scripts/seed.js (requires SUPABASE_SERVICE_ROLE in env)

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE in your environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

async function run() {
  console.log('Seeding colleges...')
  await supabase.from('colleges').upsert([
    { name: 'Massachusetts Institute of Technology', city: 'Cambridge', state: 'MA', academic_calendar: { term: 'semester', start: '2025-09-01' } },
    { name: 'University of Michigan', city: 'Ann Arbor', state: 'MI', academic_calendar: { term: 'semester', start: '2025-09-01' } },
  ])
  console.log('Done. Note: Create demo auth users via Supabase Auth UI, then insert profiles and schedule_blocks via SQL or the API. See supabase/seed.sql for placeholders.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})