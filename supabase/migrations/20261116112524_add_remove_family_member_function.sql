-- Remove a member and everything that belongs to them. Before the delete,
-- write one notice for each buyer who had reserved one of their gifts.
create or replace function remove_family_member(
  p_member_id uuid,
  p_family_id uuid,
  p_organiser_member_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organiser_member_id uuid;
  v_member_name text;
begin
  select organiser_member_id
  into v_organiser_member_id
  from families
  where id = p_family_id;

  if not found or v_organiser_member_id is distinct from p_organiser_member_id then
    return 'not_allowed';
  end if;

  if p_member_id = v_organiser_member_id then
    return 'not_allowed';
  end if;

  select display_name
  into v_member_name
  from members
  where id = p_member_id
    and family_id = p_family_id;

  if not found then
    return 'not_found';
  end if;

  insert into notices (member_id, message)
  select
    c.claimer_member_id,
    format(
      '%s was removed from the family. Their gift "%s" is no longer available, so your reservation was cancelled.',
      v_member_name,
      g.name
    )
  from claims c
  join gifts g on g.id = c.gift_id
  where g.owner_member_id = p_member_id
    and c.status in ('reserved', 'purchased');

  delete from members
  where id = p_member_id
    and family_id = p_family_id;

  return 'ok';
end;
$$;

revoke all on function remove_family_member(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function remove_family_member(uuid, uuid, uuid) to service_role;
