
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.increment_link_clicks(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.increment_page_views(uuid) TO authenticated, anon, service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

create or replace function public.admin_list_auth_users()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'not authorized';
  end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at
    from auth.users u;
end;
$$;

revoke all on function public.admin_list_auth_users() from public, anon;
grant execute on function public.admin_list_auth_users() to authenticated;