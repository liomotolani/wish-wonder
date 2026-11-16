create table claims (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references gifts(id) on delete cascade,
  claimer_member_id uuid not null references members(id) on delete cascade,
  status text not null default 'reserved' check (status in ('reserved', 'purchased', 'released')),
  gift_snapshot jsonb,
  claimed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_claims_gift_id on claims (gift_id);
create index idx_claims_claimer_member_id on claims (claimer_member_id);

create unique index one_active_claim_per_gift
  on claims (gift_id)
  where status in ('reserved', 'purchased');

alter table claims enable row level security;
