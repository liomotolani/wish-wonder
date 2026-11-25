-- Keep the previous create_family signatures working while an older app build
-- is still live. New code calls the 8-argument version directly.
create or replace function create_family(
  p_family_name text,
  p_group_type text,
  p_member_name text,
  p_requires_approval boolean,
  p_invite_code text,
  p_token_hash text,
  p_event_name text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select create_family(
    p_family_name,
    p_group_type,
    true,
    p_member_name,
    p_requires_approval,
    p_invite_code,
    p_token_hash,
    p_event_name
  );
$$;

create or replace function create_family(
  p_family_name text,
  p_member_name text,
  p_requires_approval boolean,
  p_invite_code text,
  p_token_hash text,
  p_event_name text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select create_family(
    p_family_name,
    'family',
    true,
    p_member_name,
    p_requires_approval,
    p_invite_code,
    p_token_hash,
    p_event_name
  );
$$;

revoke all on function create_family(text, text, text, boolean, text, text, text)
  from public, anon, authenticated;
grant execute on function create_family(text, text, text, boolean, text, text, text)
  to service_role;

revoke all on function create_family(text, text, boolean, text, text, text)
  from public, anon, authenticated;
grant execute on function create_family(text, text, boolean, text, text, text)
  to service_role;
