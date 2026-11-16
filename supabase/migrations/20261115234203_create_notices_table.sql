create table notices (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  dismissed_at timestamptz
);

create index idx_notices_member_id on notices (member_id);

alter table notices enable row level security;
