-- Supabase SQL schema for Overlap MVP
-- Run this in your Supabase project's SQL editor.

-- Enable extensions
create extension if not exists "uuid-ossp";

-- colleges
create table if not exists colleges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text,
  state text,
  academic_calendar jsonb,
  created_at timestamptz default now()
);

-- profiles extends auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  college_id uuid references colleges(id),
  home_city text,
  home_zip text,
  current_semester text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- schedule_blocks
create table if not exists schedule_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('class','work','personal','unavailable')),
  recurrence_rule text,
  start_time time not null,
  end_time time not null,
  days_of_week int[] not null,
  start_date date not null,
  end_date date,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- friendships (bidirectional)
create table if not exists friendships (
  id uuid primary key default uuid_generate_v4(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  constraint one_pair unique (user_a, user_b)
);

-- Indexes
create index if not exists idx_schedule_user on schedule_blocks(user_id);
create index if not exists idx_schedule_dates on schedule_blocks(start_date, end_date);
create index if not exists idx_friend_a on friendships(user_a);
create index if not exists idx_friend_b on friendships(user_b);

-- RLS Policies
-- Enable RLS
alter table profiles enable row level security;
alter table schedule_blocks enable row level security;
alter table friendships enable row level security;

-- profiles: anyone can SELECT
create policy "profiles_select_public" on profiles for select using (true);

-- profiles: only owner can update their row
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- schedule_blocks policies
-- users can select their own rows
create policy "sched_select_owner" on schedule_blocks for select using (auth.uid() = user_id);

-- friends can select friends' schedule_blocks if an accepted friendship exists
create policy "sched_select_friend" on schedule_blocks for select using (
  exists (
    select 1 from friendships f
    where f.status = 'accepted' and (
      (f.user_a = auth.uid() and f.user_b = schedule_blocks.user_id) or
      (f.user_b = auth.uid() and f.user_a = schedule_blocks.user_id)
    )
  )
);

-- users can insert their own schedule blocks
create policy "sched_insert_owner" on schedule_blocks for insert with check (auth.uid() = user_id);

-- users can update/delete their own blocks
create policy "sched_update_owner" on schedule_blocks for update using (auth.uid() = user_id);
create policy "sched_delete_owner" on schedule_blocks for delete using (auth.uid() = user_id);

-- friendships policies
-- users can select rows where they are user_a or user_b
create policy "friend_select" on friendships for select using (auth.uid() = user_a or auth.uid() = user_b);

-- insert only allowed when auth.uid() = user_a (i.e., requester creates outgoing request)
create policy "friend_insert" on friendships for insert with check (auth.uid() = user_a);

-- updating to accept only allowed by user_b
create policy "friend_update_accept" on friendships for update using (
  (status = 'accepted' and auth.uid() = user_b) or
  (status = old.status)
);

-- Allow everyone to select colleges
alter table colleges enable row level security;
create policy "colleges_select" on colleges for select using (true);