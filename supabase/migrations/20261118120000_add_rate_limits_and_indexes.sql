-- Rate limit public create/join requests by a hashed client key. The table is
-- service-role only; the API stores no raw IP address.
create table api_rate_limits (
  id bigserial primary key,
  action text not null,
  key_hash text not null,
  created_at timestamptz not null default now()
);

create index idx_api_rate_limits_lookup
  on api_rate_limits (action, key_hash, created_at desc);

alter table api_rate_limits enable row level security;

create or replace function allow_api_request(
  p_action text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from api_rate_limits
  where action = p_action
    and key_hash = p_key_hash
    and created_at < now() - interval '1 day';

  select count(*)
  into v_count
  from api_rate_limits
  where action = p_action
    and key_hash = p_key_hash
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_limit then
    return false;
  end if;

  insert into api_rate_limits (action, key_hash)
  values (p_action, p_key_hash);

  return true;
end;
$$;

revoke all on function allow_api_request(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function allow_api_request(text, text, integer, integer)
  to service_role;

-- Cover the queries that scale with members, gifts and claims.
create index if not exists idx_gifts_event_owner
  on gifts (event_id, owner_member_id);
create index if not exists idx_members_family_status
  on members (family_id, status);
create index if not exists idx_claims_claimer_status
  on claims (claimer_member_id, status);

-- Unique constraints already provide these indexes.
drop index if exists idx_member_sessions_token_hash;
drop index if exists idx_families_invite_code;
