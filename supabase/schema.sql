-- Pipeline Dashboard Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ptprxdduqvighuefmofa/sql

-- Prospects table
create table if not exists prospects (
  id bigint generated always as identity primary key,
  place_id text unique not null,
  name text not null,
  owner_name text,
  phone text,
  phone_type text, -- mobile, landline, voip
  email text,
  trade text,
  city text,
  state text,
  rating numeric(2,1),
  review_count integer default 0,
  top_reviewer_name text, -- for SMS message 3
  stage text default 'new',
  score integer default 0,
  demo_url text,
  demo_slug text,
  google_photos jsonb default '[]',
  google_place_url text,
  outscraper_data jsonb default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages table (SMS history)
create table if not exists messages (
  id bigint generated always as identity primary key,
  prospect_id bigint references prospects(id) on delete cascade,
  direction text not null check (direction in ('outbound', 'inbound')),
  body text not null,
  status text default 'sent', -- sent, delivered, failed, received
  kixie_message_id text,
  sent_at timestamptz default now()
);

-- Page visits table (from Umami)
create table if not exists page_visits (
  id bigint generated always as identity primary key,
  prospect_id bigint references prospects(id) on delete cascade,
  visit_date timestamptz default now(),
  time_on_page integer default 0, -- seconds
  page_views integer default 1,
  referrer text,
  device text,
  city text,
  country text
);

-- Outreach batches (track Outscraper pulls)
create table if not exists batches (
  id bigint generated always as identity primary key,
  area text not null, -- e.g. "Miami-Dade handyman"
  trade text,
  raw_count integer default 0,
  filtered_count integer default 0,
  verified_count integer default 0,
  created_at timestamptz default now()
);

-- Daily stats (for dashboard overview)
create table if not exists daily_stats (
  id bigint generated always as identity primary key,
  stat_date date unique default current_date,
  sms_sent integer default 0,
  demos_clicked integer default 0,
  responses integer default 0,
  calls_made integer default 0,
  deals_closed integer default 0,
  revenue_added numeric(10,2) default 0
);

-- Create indexes for common queries
create index if not exists idx_prospects_stage on prospects(stage);
create index if not exists idx_prospects_trade on prospects(trade);
create index if not exists idx_prospects_place_id on prospects(place_id);
create index if not exists idx_prospects_score on prospects(score desc);
create index if not exists idx_messages_prospect on messages(prospect_id);
create index if not exists idx_page_visits_prospect on page_visits(prospect_id);

-- Auto-update updated_at on prospects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger prospects_updated_at
  before update on prospects
  for each row execute function update_updated_at();

-- Enable Row Level Security (we'll add policies later with auth)
alter table prospects enable row level security;
alter table messages enable row level security;
alter table page_visits enable row level security;
alter table batches enable row level security;
alter table daily_stats enable row level security;

-- For now, allow all access (we'll lock this down with auth later)
create policy "Allow all access to prospects" on prospects for all using (true) with check (true);
create policy "Allow all access to messages" on messages for all using (true) with check (true);
create policy "Allow all access to page_visits" on page_visits for all using (true) with check (true);
create policy "Allow all access to batches" on batches for all using (true) with check (true);
create policy "Allow all access to daily_stats" on daily_stats for all using (true) with check (true);
