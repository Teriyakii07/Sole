create table if not exists public.otp_sessions (
  otp_hash text primary key check (otp_hash ~ '^[a-f0-9]{64}$'),
  phone text not null,
  purpose text not null check (purpose in ('registration', '2fa_login')),
  code_hash text not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  status text not null check (
    status in ('sending', 'pending', 'verified', 'locked', 'failed')
  )
);

create index if not exists otp_sessions_phone_created_at_idx
  on public.otp_sessions (phone, created_at desc);

create index if not exists otp_sessions_expires_at_idx
  on public.otp_sessions (expires_at);

alter table public.otp_sessions enable row level security;

grant all on table public.otp_sessions to service_role;
