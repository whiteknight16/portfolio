# Supabase Database Setup

This directory contains the database setup for the portfolio + admin CMS.

## Set up a new Supabase project

1. **Run the schema and starter content.** In the Supabase dashboard open
   **SQL Editor**, paste all of `supabase/setup.sql`, and click **Run**. Or from
   a terminal: `psql "<connection string>" -f supabase/setup.sql`.
2. **Create the admin user.** **Authentication** -> **Users** -> **Add user**
   with the email `harshp6421@gmail.com`.
3. **Disable public sign-ups.** **Authentication** -> **Providers** -> turn off
   sign-ups for the Email provider.
4. **Set the environment variables** from `.env.example` in `.env.local` (and
   in your hosting provider).

`setup.sql` is safe to re-run. It re-applies the schema, policies and storage
buckets, and only inserts starter content into tables that are empty, so it
never overwrites edits you made in the admin. It never touches `posts`,
`subscribers` or `contact_messages`.

`seed.sql` is different: it **resets** content. It deletes and re-inserts
`profile`, `site_sections`, `experiences`, `skills`, `projects`,
`achievements` and `education`, discarding admin edits to those tables. Use it
only when you want the starter content back. The values in both files are kept
identical (checked by `bash supabase/tests/smoke.sh`, which needs Docker).

For a database that already ran earlier migrations, apply the new ones in
order instead (see below).

## Migrations

Migrations are applied in order:
1. `0001_schema.sql` — Creates the 9 core tables: `profile`, `site_sections`, `projects`, `experiences`, `skills`, `achievements`, `education`, `posts`, `contact_messages`
2. `0002_rls.sql` — Enables Row Level Security (RLS) with policies for public read, admin full CRUD, and anonymous contact message insertion
3. `0003_storage.sql` — Creates the `media` storage bucket used for project/post images and uploads
4. `0004_updated_at.sql` — Adds `updated_at` triggers
5. `0005_blog_images_storage.sql` — Creates the public `blog-images` bucket and its policies
6. `0006_personal_brand.sql` — Adds the personal-brand columns (`profile.handle/tagline/career_start_date/now/now_updated_at/highlights`, `posts.source_*/tldr`, `experiences.tags`, `projects.label`), the `subscribers` table with its policies, and limits `site_sections` to `projects`, `blog`, `newsletter`, `experience`

## Manual Setup Steps

If you used `setup.sql`, the steps below are already covered by the list at the top (they are here for detail).

### Step 1: Admin email (baked into `is_admin()`)

The admin email is hardcoded in the `public.is_admin()` function in
`0002_rls.sql` (currently `harshp6421@gmail.com`). Hosted Supabase's SQL-editor
role cannot run `alter database ... set app.admin_email` (error `42501:
permission denied`), so the GUC approach is not used. To change the admin, edit
the email literal in `is_admin()` and re-run that function definition. Keep it
in sync with `ADMIN_EMAIL` in `.env`.

### Step 2: Disable Public Sign-ups

In the Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Disable public sign-ups (under Email provider or relevant auth method)
3. Ensure only the admin can create accounts (manually via dashboard or API)

### Step 3: Create the Admin User

Create a single user account in Supabase Auth with the email address matching your `<ADMIN_EMAIL>`:
1. Go to **Authentication** → **Users**
2. Click **Add user** and create a user with the admin email
3. Set a secure password or use passwordless auth

---

## Policy Summary

- **Public read**: `profile`, `experiences`, `skills`, `achievements`, `education` (always visible)
- **Conditional read**: `site_sections` (visible if enabled or user is admin), `projects` (visible if published or user is admin), `posts` (visible if published or user is admin)
- **Contact messages**: Anonymous users can insert (submit contact forms), but cannot read
- **Subscribers**: Anonymous users can insert only, and only with `status = 'active'`; they cannot read. Only the admin can read, update or delete
- **Admin full CRUD**: All tables accessible to the authenticated admin user
