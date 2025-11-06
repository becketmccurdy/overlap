# Overlap

The social calendar for young adults — quickly find when your friends are free.

This repository is an MVP built with Next.js 14, Supabase (Postgres + Auth + RLS), TailwindCSS, Framer Motion, Zustand, and TypeScript.

IMPORTANT: Run the SQL in `supabase/supabase.sql` in your Supabase project's SQL editor to create tables and RLS. Then run the `supabase/seed.sql` script or use `npm run seed` to populate demo data.

Quick start:
1. git clone https://github.com/becketmccurdy/overlap
2. cd overlap
3. npm install
4. Copy `.env.example` to `.env.local` and fill with your Supabase project keys (Project Settings → API)
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE (needed for server overlap route)
5. In Supabase → SQL editor run `supabase/supabase.sql`
6. Run `npm run seed` to populate demo data (or run `supabase/seed.sql` manually)
7. npm run dev
8. Visit http://localhost:3000

Scripts:
- npm run dev — Next.js dev server
- npm run build — build
- npm run start — production start
- npm run db:push — reminder to run `supabase/supabase.sql` in Supabase SQL editor
- npm run seed — run `node scripts/seed.js` (optional)
- npm run test:e2e — run Playwright smoke test (ensure dev server is running)

Environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE

Supabase notes:
- The SQL file includes RLS policies. If you're testing locally with the anon key, RLS may restrict cross-user reads. The server overlap route uses SUPABASE_SERVICE_ROLE to bypass RLS; include that key in your .env.local if you want overlap functionality on the server.

Timezones:
- Times are stored canonically in UTC fields and rendered in the user's browser local timezone.
- The overlap algorithm operates on Date objects; ensure the server has consistent timezone behaviors.

Troubleshooting:
- If you see permission errors when querying schedules, confirm RLS and policies were applied by running the SQL in the Supabase SQL editor.
- If overlap windows are missing, ensure SUPABASE_SERVICE_ROLE is set for server route access.
- For mobile timeline scrolling issues, use horizontal scroll and ensure container overflows are visible.

Deployment:
- Deploy to Vercel: connect the repo, set environment variables in Vercel dashboard (same keys), and deploy.
- Make sure to run the Supabase SQL migration in your Supabase project.

Playwright:
- A minimal smoke test is provided under `e2e/smoke.spec.ts`. Run `npm run test:e2e` after starting the dev server.

This is a functional MVP skeleton — features can be extended (ICS import, more robust RLS, performance optimizations).