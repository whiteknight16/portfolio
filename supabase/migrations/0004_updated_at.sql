-- `updated_at` columns default to `now()`, but that only fires on INSERT.
-- Without a trigger, UPDATEs never bump the timestamp. This adds a single
-- shared trigger function and wires it up to every table that has an
-- `updated_at` column (`profile`, `projects`, `posts`).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profile;
create trigger set_updated_at
  before update on public.profile
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();
