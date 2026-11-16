-- Create a family, its first event and the organiser in one transaction.
create or replace function create_family(
  p_family_name text,
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
  insert into families (name, invite_code, requires_approval)
  values (p_family_name, p_invite_code, p_requires_approval)
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

-- Join a family by invite code and create a personal session in one transaction.
create or replace function join_family(
  p_invite_code text,
  p_member_name text,
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family families%rowtype;
  v_member_id uuid;
  v_member_status text;
begin
  select *
  into v_family
  from families
  where invite_code = p_invite_code;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  v_member_status := case
    when v_family.requires_approval then 'pending'
    else 'active'
  end;

  insert into members (family_id, display_name, status)
  values (v_family.id, p_member_name, v_member_status)
  returning id into v_member_id;

  insert into member_sessions (member_id, token_hash)
  values (v_member_id, p_token_hash);

  return jsonb_build_object(
    'ok', true,
    'member_id', v_member_id,
    'member_status', v_member_status,
    'family_name', v_family.name
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'name_taken');
end;
$$;

revoke all on function create_family(text, text, boolean, text, text, text) from public, anon, authenticated;
revoke all on function join_family(text, text, text) from public, anon, authenticated;
grant execute on function create_family(text, text, boolean, text, text, text) to service_role;
grant execute on function join_family(text, text, text) to service_role;
