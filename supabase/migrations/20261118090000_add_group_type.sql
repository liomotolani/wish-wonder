-- A group can be a family, friends, colleagues or something else. The code
-- still calls it a family; only the wording users see changes.
alter table families
  add column group_type text not null default 'family'
  constraint families_group_type_check
  check (group_type in ('family', 'friends', 'colleagues', 'other'));

-- create_family now records the chosen group type.
drop function if exists create_family(text, text, boolean, text, text, text);

create function create_family(
  p_family_name text,
  p_group_type text,
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
  insert into families (name, group_type, invite_code, requires_approval)
  values (p_family_name, p_group_type, p_invite_code, p_requires_approval)
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

revoke all on function create_family(text, text, text, boolean, text, text, text)
  from public, anon, authenticated;
grant execute on function create_family(text, text, text, boolean, text, text, text)
  to service_role;

-- Joining returns the group id so the device can remember this group's session
-- alongside the others it already holds.
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
    'family_id', v_family.id,
    'member_id', v_member_id,
    'member_status', v_member_status,
    'family_name', v_family.name
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'name_taken');
end;
$$;

revoke all on function join_family(text, text, text) from public, anon, authenticated;
grant execute on function join_family(text, text, text) to service_role;

-- Device links return the group id too, so the new device can add the group to
-- its sessions cookie.
create or replace function use_device_link(
  p_token_hash text,
  p_new_session_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link device_links%rowtype;
  v_session_id uuid;
  v_member_status text;
  v_family_id uuid;
begin
  select *
  into v_link
  from device_links
  where token_hash = p_token_hash
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if v_link.used_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'used');
  end if;

  if v_link.expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;

  select status, family_id
  into v_member_status, v_family_id
  from members
  where id = v_link.member_id;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  update device_links
  set used_at = now()
  where id = v_link.id;

  insert into member_sessions (member_id, token_hash)
  values (v_link.member_id, p_new_session_token_hash)
  returning id into v_session_id;

  return jsonb_build_object(
    'ok', true,
    'member_id', v_link.member_id,
    'family_id', v_family_id,
    'member_status', v_member_status,
    'session_id', v_session_id
  );
end;
$$;

revoke all on function use_device_link(text, text) from public, anon, authenticated;
grant execute on function use_device_link(text, text) to service_role;
