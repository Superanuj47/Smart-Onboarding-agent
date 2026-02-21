-- ─────────────────────────────────────────────────────────────────────────────
-- SMART ONBOARDER – Complete Supabase Schema (v2)
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Users ─────────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid         default gen_random_uuid() primary key,
  created_at    timestamptz  default timezone('utc', now()) not null,
  email         text         unique not null,
  password      text         not null, -- Use Supabase Auth in production!
  name          text,
  role          text         check (role in ('admin', 'hr', 'candidate')) default 'candidate'
);

-- ── Customers (KYC Applications) ─────────────────────────────────────────────
create table if not exists customers (
  id                    uuid         default gen_random_uuid() primary key,
  created_at            timestamptz  default timezone('utc', now()) not null,
  updated_at            timestamptz  default timezone('utc', now()) not null,
  user_id               uuid         references users(id) on delete set null,
  -- Personal info
  name                  text,
  email                 text,
  phone                 text,
  dob                   text,
  address               text,
  -- Document info
  doc_type              text,
  doc_number            text,
  doc_extracted_name    text,
  doc_extracted_dob     text,
  -- File storage URLs
  document_url          text,
  selfie_url            text,
  -- OCR data
  ocr_raw_text          text,
  manual_corrections    jsonb,
  -- Risk and status
  risk_score            numeric,
  risk_level            text         check (risk_level in ('LOW', 'MEDIUM', 'HIGH')),
  status                text         default 'PENDING_REVIEW',
  application_stage     text         default 'APPLIED'
                                     check (application_stage in (
                                       'APPLIED', 'DOCUMENTS_UPLOADED', 'UNDER_REVIEW',
                                       'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'COMPLETED'
                                     )),
  flags                 text[],
  risk_breakdown        jsonb,
  -- Interview
  interview_scheduled_at timestamptz,
  interviewed_by         text
);

-- ── Cases ─────────────────────────────────────────────────────────────────────
create table if not exists cases (
  id            uuid         default gen_random_uuid() primary key,
  created_at    timestamptz  default timezone('utc', now()) not null,
  customer_id   uuid         references customers(id) on delete cascade,
  customer_name text,
  reason        text,
  evidence      text[],
  status        text         default 'OPEN' check (status in ('OPEN', 'CLOSED', 'ESCALATED')),
  priority      text         default 'MEDIUM' check (priority in ('LOW', 'MEDIUM', 'HIGH')),
  assignee      text,
  notes         text[]
);

-- ── Audit Logs ─────────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid         default gen_random_uuid() primary key,
  created_at  timestamptz  default timezone('utc', now()) not null,
  event       text,
  user_id     uuid,
  actor       text,
  detail      text
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_customers_status  on customers(status);
create index if not exists idx_customers_stage   on customers(application_stage);
create index if not exists idx_customers_email   on customers(email);
create index if not exists idx_customers_user_id on customers(user_id);
create index if not exists idx_cases_customer_id on cases(customer_id);
create index if not exists idx_audit_user_id     on audit_logs(user_id);

-- ── Seed Demo Users ──────────────────────────────────────────────────────────
insert into users (email, password, name, role) values
  ('admin@bank.com',         'admin',   'Bank Admin',       'admin'),
  ('hr@bank.com',            'hr123',   'HR Manager',       'hr'),
  ('candidate@example.com',  'pass123', 'Demo Candidate',   'candidate')
on conflict (email) do nothing;
