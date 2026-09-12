
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null default '',
  bio text,
  avatar_url text,
  background_url text,
  background_video_url text,
  counter_label text,
  counter_value text,
  theme_id text not null default 'dark-elegant',
  plan text not null default 'free',
  status text not null default 'active',
  page_views integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index profiles_username_lower_idx on public.profiles (lower(username));

grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles_self_read" on public.user_roles for select to authenticated using (user_id = auth.uid());

create policy "profiles_public_read" on public.profiles for select to anon, authenticated using (true);
create policy "profiles_self_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_self_insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_admin_all" on public.profiles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  type text not null default 'url',
  value text not null default '',
  thumbnail text,
  position integer not null default 0,
  active boolean not null default true,
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);
create index links_user_idx on public.links (user_id, position);
grant select on public.links to anon;
grant select, insert, update, delete on public.links to authenticated;
grant all on public.links to service_role;
alter table public.links enable row level security;

create policy "links_public_read" on public.links for select to anon using (active);
create policy "links_read_auth" on public.links for select to authenticated using (active or user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "links_owner_write" on public.links for all to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null default '',
  reporter text not null default '',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.reports to anon;
grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports_anon_insert" on public.reports for insert to anon with check (true);
create policy "reports_auth_insert" on public.reports for insert to authenticated with check (true);
create policy "reports_admin_all" on public.reports for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'edit',
  message text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "logs_auth_insert" on public.activity_logs for insert to authenticated with check (true);
create policy "logs_admin_read" on public.activity_logs for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  n integer := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), '[^a-zA-Z0-9._-]', '', 'g'));
  if base_username is null or base_username = '' then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where lower(username) = final_username) loop
    n := n + 1;
    final_username := base_username || n::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, coalesce(new.raw_user_meta_data->>'display_name', final_username));

  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;

  insert into public.activity_logs (type, message) values ('signup', 'Novo cadastro: @' || final_username);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.increment_page_views(_profile_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.profiles set page_views = page_views + 1 where id = _profile_id;
$$;
grant execute on function public.increment_page_views(uuid) to anon, authenticated;

create or replace function public.increment_link_clicks(_link_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.links set clicks = clicks + 1 where id = _link_id;
$$;
grant execute on function public.increment_link_clicks(uuid) to anon, authenticated;

create policy "media_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media_owner_insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_owner_update" on storage.objects for update to authenticated using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "media_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);