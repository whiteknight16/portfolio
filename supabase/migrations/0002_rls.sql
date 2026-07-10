-- helper: is the caller the single admin?
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') =
         current_setting('app.admin_email', true);
$$;
-- NOTE: set the GUC once per project:  alter database postgres set app.admin_email = 'harshp6421@gmail.com';
-- (documented in supabase/README; the user runs it with their ADMIN_EMAIL.)

alter table public.profile          enable row level security;
alter table public.site_sections    enable row level security;
alter table public.projects         enable row level security;
alter table public.experiences      enable row level security;
alter table public.skills           enable row level security;
alter table public.achievements     enable row level security;
alter table public.education        enable row level security;
alter table public.posts            enable row level security;
alter table public.contact_messages enable row level security;

-- Public read (always-visible content)
create policy pub_read_profile      on public.profile          for select using (true);
create policy pub_read_experiences  on public.experiences      for select using (true);
create policy pub_read_skills       on public.skills           for select using (true);
create policy pub_read_achievements on public.achievements     for select using (true);
create policy pub_read_education    on public.education        for select using (true);
create policy pub_read_sections     on public.site_sections    for select using (enabled = true or public.is_admin());
create policy pub_read_projects     on public.projects         for select using (status = 'published' or public.is_admin());
create policy pub_read_posts        on public.posts            for select using (status = 'published' or public.is_admin());

-- Contact: anon may insert only
create policy pub_insert_messages   on public.contact_messages for insert with check (true);

-- Admin full CRUD on every table
create policy admin_all_profile      on public.profile          for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_sections     on public.site_sections    for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_projects     on public.projects         for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_experiences  on public.experiences      for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_skills       on public.skills           for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_achievements on public.achievements     for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_education    on public.education        for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_posts        on public.posts            for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all_messages     on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
