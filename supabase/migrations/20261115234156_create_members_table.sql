create table members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  display_name text not null,
  managed_by_member_id uuid references members(id) on delete set null,
  status text not null default 'active' check (status in ('pending', 'active')),
  created_at timestamptz not null default now(),
  constraint uq_members_family_display_name unique (family_id, display_name)
);

create index idx_members_family_id on members (family_id);
create index idx_members_managed_by on members (managed_by_member_id);

alter table families
  add constraint fk_families_organiser
  foreign key (organiser_member_id)
  references members(id)
  on delete set null;

alter table members enable row level security;
