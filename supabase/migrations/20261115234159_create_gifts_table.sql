create table gifts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  owner_member_id uuid not null references members(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  price_pence integer check (price_pence is null or price_pence >= 0),
  shop_url text,
  preferences text,
  priority text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_gifts_event_id on gifts (event_id);
create index idx_gifts_owner_member_id on gifts (owner_member_id);

alter table gifts enable row level security;
