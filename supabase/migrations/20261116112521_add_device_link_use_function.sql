-- Use a one-time device link and create the new device's own session in one
-- transaction. The row lock makes a double tap harmless.
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

  select status
  into v_member_status
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
    'member_status', v_member_status,
    'session_id', v_session_id
  );
end;
$$;

revoke all on function use_device_link(text, text) from public, anon, authenticated;
grant execute on function use_device_link(text, text) to service_role;
