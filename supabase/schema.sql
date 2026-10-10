-- Run in Supabase SQL Editor as a privileged project owner.
-- API routes use the service-role secret *server-side only*; no public table privileges.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  interest text not null,
  idea text,
  updates_consent boolean not null default false,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  confirmation_email_status text not null default 'pending',
  constraint waitlist_email_lowercheck check (email = lower(email)),
  constraint waitlist_email_unique unique (email),
  constraint waitlist_interest_check check (interest in ('meet','workshops','tools','help')),
  constraint waitlist_confirmation_status_check check (confirmation_email_status in ('pending','sent','failed','disabled'))
);
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
create index if not exists waitlist_created_at_idx on public.waitlist(created_at desc);
