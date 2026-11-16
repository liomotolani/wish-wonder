-- One row per reveal, used to rate limit scripted peeking.
create table reveal_attempts (
  id bigserial primary key,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_reveal_attempts_member_time
  on reveal_attempts (member_id, created_at desc);

alter table reveal_attempts enable row level security;
