-- Run this in Supabase SQL Editor to add the calls table
-- https://supabase.com/dashboard/project/ptprxdduqvighuefmofa/sql

create table if not exists calls (
  id bigint generated always as identity primary key,
  prospect_id bigint references prospects(id) on delete cascade,
  outcome text not null, -- no_answer, voicemail, talked, booked, closed, not_interested
  notes text,
  duration_seconds integer,
  called_at timestamptz default now()
);

create index if not exists idx_calls_prospect on calls(prospect_id);
create index if not exists idx_calls_outcome on calls(outcome);
create index if not exists idx_calls_date on calls(called_at);

alter table calls enable row level security;
create policy "Allow all access to calls" on calls for all using (true) with check (true);
