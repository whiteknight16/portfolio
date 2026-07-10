# Supabase Database Setup

This directory contains database migrations for the portfolio + admin CMS.

## Migrations

Migrations are applied in order:
1. `0001_schema.sql` — Creates the 9 core tables: `profile`, `site_sections`, `projects`, `experiences`, `skills`, `achievements`, `education`, `posts`, `contact_messages`
2. `0002_rls.sql` — Enables Row Level Security (RLS) with policies for public read, admin full CRUD, and anonymous contact message insertion
3. `0003_storage.sql` — Creates the `media` storage bucket used for project/post images and uploads
4. `0004_updated_at.sql` — Adds `updated_at` triggers

## Manual Setup Steps

After running migrations, perform these steps once per Supabase project:

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
- **Admin full CRUD**: All tables accessible to the authenticated admin user
