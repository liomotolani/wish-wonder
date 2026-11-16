-- Delete a wish-list gift and tell anyone who had it reserved, in one transaction.
-- Notices name only the gift and its owner, as required by the privacy rules.
create or replace function delete_own_gift(
  p_gift_id uuid,
  p_owner_member_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_member_id uuid;
  v_gift_name text;
  v_owner_name text;
begin
  select g.owner_member_id, g.name
  into v_owner_member_id, v_gift_name
  from gifts g
  where g.id = p_gift_id;

  if v_owner_member_id is null then
    return 'not_found';
  end if;

  if v_owner_member_id <> p_owner_member_id then
    return 'not_allowed';
  end if;

  select display_name
  into v_owner_name
  from members
  where id = v_owner_member_id;

  insert into notices (member_id, message)
  select
    c.claimer_member_id,
    format(
      '%s removed a gift from their list: %s. It is no longer reserved for you.',
      v_owner_name,
      v_gift_name
    )
  from claims c
  where c.gift_id = p_gift_id
    and c.status in ('reserved', 'purchased');

  delete from gifts
  where id = p_gift_id;

  return 'ok';
end;
$$;

revoke all on function delete_own_gift(uuid, uuid) from public, anon, authenticated;
grant execute on function delete_own_gift(uuid, uuid) to service_role;
