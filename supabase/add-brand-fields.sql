-- Brand routing + phone number tracking
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ptprxdduqvighuefmofa/sql

alter table prospects add column if not exists brand text default 'mj';
alter table prospects add column if not exists from_number text;

-- Index for A/B filtering
create index if not exists idx_prospects_brand on prospects(brand);
