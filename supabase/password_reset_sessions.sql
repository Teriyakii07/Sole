create table if not exists public.password_reset_sessions (
  otp_hash text primary key check (otp_hash ~ '^[a-f0-9]{64}$'),
  phone text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  code_hash text not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  status text not null check (
    status in ('sending', 'pending', 'verified', 'updating', 'completed', 'locked', 'failed')
  ),
  reset_token_hash text unique check (
    reset_token_hash is null or reset_token_hash ~ '^[a-f0-9]{64}$'
  ),
  reset_token_expires_at timestamptz
);

create index if not exists password_reset_sessions_phone_created_at_idx
  on public.password_reset_sessions (phone, created_at desc);

create index if not exists password_reset_sessions_expires_at_idx
  on public.password_reset_sessions (expires_at);

alter table public.password_reset_sessions enable row level security;

grant all on table public.password_reset_sessions to service_role;
