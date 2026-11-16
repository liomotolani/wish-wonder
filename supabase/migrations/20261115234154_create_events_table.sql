create table events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create index idx_events_family_id on events (family_id);

alter table events enable row level security;
