create table member_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index idx_member_sessions_member_id on member_sessions (member_id);
create index idx_member_sessions_token_hash on member_sessions (token_hash);

alter table member_sessions enable row level security;
