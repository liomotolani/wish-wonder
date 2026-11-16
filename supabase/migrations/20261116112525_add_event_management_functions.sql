-- Close an active event.
create or replace function archive_event(
  p_event_id uuid,
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
begin
  select organiser_member_id
  into v_organiser_member_id
  from families
  where id = p_family_id;

  if not found or v_organiser_member_id is distinct from p_organiser_member_id then
    return 'not_allowed';
  end if;

  update events
  set status = 'archived'
  where id = p_event_id
    and family_id = p_family_id
    and status = 'active';

  if not found then
    return 'not_found';
  end if;

  return 'ok';
end;
$$;

-- Start the next Christmas and close the current one in one transaction.
create or replace function create_next_event(
  p_family_id uuid,
  p_organiser_member_id uuid,
  p_event_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organiser_member_id uuid;
  v_event_id uuid;
begin
  select organiser_member_id
  into v_organiser_member_id
  from families
  where id = p_family_id;

  if not found or v_organiser_member_id is distinct from p_organiser_member_id then
    return jsonb_build_object('ok', false, 'reason', 'not_allowed');
  end if;

  update events
  set status = 'archived'
  where family_id = p_family_id
    and status = 'active';

  insert into events (family_id, name, status)
  values (p_family_id, p_event_name, 'active')
  returning id into v_event_id;

  return jsonb_build_object(
    'ok', true,
    'event_id', v_event_id,
    'event_name', p_event_name
  );
end;
$$;

revoke all on function archive_event(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function create_next_event(uuid, uuid, text) from public, anon, authenticated;
grant execute on function archive_event(uuid, uuid, uuid) to service_role;
grant execute on function create_next_event(uuid, uuid, text) to service_role;
