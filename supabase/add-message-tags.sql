-- Message tagging + prospect tracking fields
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/ptprxdduqvighuefmofa/sql

-- ============================================================
-- 1. PROSPECTS: brand + from_number (safe to re-run)
-- ============================================================
alter table prospects add column if not exists brand text default 'mj';
alter table prospects add column if not exists from_number text;
alter table prospects add column if not exists batch_id bigint references batches(id);

create index if not exists idx_prospects_brand on prospects(brand);
create index if not exists idx_prospects_batch on prospects(batch_id);

-- ============================================================
-- 2. MESSAGES: sequence step + campaign tagging
-- ============================================================

-- Which step in the outreach sequence this message belongs to
-- sms1, sms2, sms3, voicemail, sms4, sms5, manual, inbound, reply
alter table messages add column if not exists sequence_step text;

-- Denormalized brand from prospect — makes filtering the messages
-- view by brand instant without joining
alter table messages add column if not exists brand text;

-- Links back to which batch/campaign generated this outreach
alter table messages add column if not exists batch_id bigint references batches(id);

-- Kixie from-number used to send this message
alter table messages add column if not exists from_number text;

create index if not exists idx_messages_step on messages(sequence_step);
create index if not exists idx_messages_brand on messages(brand);
create index if not exists idx_messages_batch on messages(batch_id);

-- ============================================================
-- 3. BATCHES: add brand tracking
-- ============================================================
alter table batches add column if not exists brand text default 'mj';
alter table batches add column if not exists status text default 'pulled';
-- status: pulled → verified → exported → sending → complete
