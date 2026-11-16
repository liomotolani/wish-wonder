-- One-time, short-lived links that sign a second device in as a member.
create table device_links (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_device_links_member_id on device_links (member_id);
create index idx_device_links_expires_at on device_links (expires_at);

alter table device_links enable row level security;
