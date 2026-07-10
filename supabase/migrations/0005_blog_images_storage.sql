-- Dedicated public bucket for blog cover + inline images. Mirrors the `media`
-- policies in 0003_storage.sql. Idempotent: safe whether or not the bucket was
-- already created by hand in the Supabase dashboard.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- If the bucket already existed as private, make sure public read works so
-- <img src> URLs load for visitors.
update storage.buckets set public = true where id = 'blog-images';

create policy blog_images_public_read on storage.objects
  for select using (bucket_id = 'blog-images');
create policy blog_images_admin_write on storage.objects
  for insert with check (bucket_id = 'blog-images' and public.is_admin());
create policy blog_images_admin_update on storage.objects
  for update using (bucket_id = 'blog-images' and public.is_admin());
create policy blog_images_admin_delete on storage.objects
  for delete using (bucket_id = 'blog-images' and public.is_admin());
