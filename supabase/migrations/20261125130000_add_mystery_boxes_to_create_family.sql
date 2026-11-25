-- Let the organiser choose Boxes or List while creating a group (FR-46).
drop function if exists create_family(text, text, text, boolean, text, text, text);

create function create_family(
  p_family_name text,
  p_group_type text,
  p_mystery_boxes boolean,
  p_member_name text,
  p_requires_approval boolean,
  p_invite_code text,
  p_token_hash text,
  p_event_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
  v_member_id uuid;
  v_event_id uuid;
begin
  insert into families (name, group_type, mystery_boxes, invite_code, requires_approval)
  values (p_family_name, p_group_type, p_mystery_boxes, p_invite_code, p_requires_approval)
  returning id into v_family_id;

  insert into members (family_id, display_name, status)
  values (v_family_id, p_member_name, 'active')
  returning id into v_member_id;

  update families
  set organiser_member_id = v_member_id
  where id = v_family_id;

  insert into events (family_id, name, status)
  values (v_family_id, p_event_name, 'active')
  returning id into v_event_id;

  insert into member_sessions (member_id, token_hash)
  values (v_member_id, p_token_hash);

  return jsonb_build_object(
    'ok', true,
    'family_id', v_family_id,
    'member_id', v_member_id,
    'event_id', v_event_id
  );
end;
$$;

revoke all on function create_family(text, text, boolean, text, boolean, text, text, text)
  from public, anon, authenticated;
grant execute on function create_family(text, text, boolean, text, boolean, text, text, text)
  to service_role;
