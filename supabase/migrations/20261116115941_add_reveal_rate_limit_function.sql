-- Allow a member a fixed number of reveals in a sliding window. The advisory
-- lock serialises two simultaneous reveals for the same member, so the count
-- cannot be raced past the limit.
create or replace function consume_reveal_attempt(
  p_member_id uuid,
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
  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtext('reveal:' || p_member_id::text)::bigint);

  delete from reveal_attempts
  where member_id = p_member_id
    and created_at < now() - make_interval(secs => p_window_seconds);

  select count(*)
  into v_count
  from reveal_attempts
  where member_id = p_member_id
    and created_at >= now() - make_interval(secs => p_window_seconds);

  if v_count >= p_limit then
    return false;
  end if;

  insert into reveal_attempts (member_id)
  values (p_member_id);

  return true;
end;
$$;

revoke all on function consume_reveal_attempt(uuid, integer, integer) from public, anon, authenticated;
grant execute on function consume_reveal_attempt(uuid, integer, integer) to service_role;
