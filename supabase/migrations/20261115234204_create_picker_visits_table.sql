create table picker_visits (
  id uuid primary key default gen_random_uuid(),
  buyer_member_id uuid not null references members(id) on delete cascade,
  recipient_member_id uuid not null references members(id) on delete cascade,
  seed bigint not null,
  created_at timestamptz not null default now()
);

create index idx_picker_visits_buyer_recipient on picker_visits (buyer_member_id, recipient_member_id);

alter table picker_visits enable row level security;
