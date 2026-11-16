-- Replace a member's personal link. Every existing session and every unused
-- device link for that member is revoked before the new session is created.
create or replace function reissue_member_link(
  p_member_id uuid,
  p_family_id uuid,
  p_organiser_member_id uuid,
  p_new_token_hash text
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

  if not exists (
    select 1
    from members
    where id = p_member_id
      and family_id = p_family_id
  ) then
    return 'not_found';
  end if;

  update member_sessions
  set revoked_at = now()
  where member_id = p_member_id
    and revoked_at is null;

  update device_links
  set used_at = now()
  where member_id = p_member_id
    and used_at is null;

  insert into member_sessions (member_id, token_hash)
  values (p_member_id, p_new_token_hash);

  return 'ok';
end;
$$;

revoke all on function reissue_member_link(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function reissue_member_link(uuid, uuid, uuid, text) to service_role;
