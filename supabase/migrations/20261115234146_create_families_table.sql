create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  organiser_member_id uuid,
  requires_approval boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_families_invite_code on families (invite_code);

alter table families enable row level security;
