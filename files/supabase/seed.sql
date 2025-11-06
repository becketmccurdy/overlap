-- Seed minimal colleges and demo users/profiles/blocks
insert into colleges (id, name, city, state, academic_calendar) values
  (uuid_generate_v4(), 'Massachusetts Institute of Technology', 'Cambridge', 'MA', '{"term":"semester","start":"2025-09-01"}'),
  (uuid_generate_v4(), 'University of Michigan', 'Ann Arbor', 'MI', '{"term":"semester","start":"2025-09-01"}');

-- NOTE: Supabase auth.users cannot be inserted here easily via SQL.
-- Instead, create demo accounts in the Supabase Auth UI, then insert profiles and schedule_blocks referencing those user ids.
-- Example placeholders below for manual seeds once you have user IDs:

-- Replace 'user-uuid-1' etc with actual auth user UUIDs created via Supabase Auth
-- insert into profiles (id, username, display_name, college_id) values
--  ('user-uuid-1', 'alice', 'Alice A', (select id from colleges limit 1)),
--  ('user-uuid-2', 'bob', 'Bob B', (select id from colleges limit 1 offset 1));

-- insert into schedule_blocks (user_id, title, type, start_time, end_time, days_of_week, start_date, end_date, color) values
--  ('user-uuid-1', 'MWF 10am', 'class','10:00','10:50', ARRAY[1,3,5], '2025-08-25', null, '#f97316'),
--  ('user-uuid-2', 'Work shift', 'work','14:00','17:00', ARRAY[1,2,3,4,5], '2025-08-25', null, '#0ea5e9');