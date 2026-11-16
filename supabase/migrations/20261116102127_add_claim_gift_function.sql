-- Claim a gift atomically. The partial unique index is the final guard, and a
-- unique violation is returned as a typed outcome rather than an error.
create or replace function claim_gift(
  p_gift_id uuid,
  p_claimer_member_id uuid,
  p_family_id uuid,
  p_snapshot jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_member_id uuid;
  v_family_id uuid;
begin
  select g.owner_member_id, e.family_id
  into v_owner_member_id, v_family_id
  from gifts g
  join events e on e.id = g.event_id
  where g.id = p_gift_id;

  if v_owner_member_id is null then
    return 'not_found';
  end if;

  if v_family_id <> p_family_id then
    return 'not_allowed';
  end if;

  if v_owner_member_id = p_claimer_member_id then
    return 'not_allowed';
  end if;

  if not exists (
    select 1
    from members
    where id = p_claimer_member_id
      and family_id = p_family_id
      and status = 'active'
  ) then
    return 'not_allowed';
  end if;

  insert into claims (gift_id, claimer_member_id, status, gift_snapshot)
  values (p_gift_id, p_claimer_member_id, 'reserved', p_snapshot);

  return 'ok';
exception
  when unique_violation then
    return 'already_picked';
end;
$$;

revoke all on function claim_gift(uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function claim_gift(uuid, uuid, uuid, jsonb) to service_role;
