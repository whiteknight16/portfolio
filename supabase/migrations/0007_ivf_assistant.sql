-- 0007_ivf_assistant.sql
-- Adds the "IVF Assistant" project (a personal project, shown under "Things I've
-- built") and un-features REC Mirzapur so the home page trio becomes
-- IVF Assistant, Interview Genie, Notes Nest. REC Mirzapur stays published.
--
-- Idempotent: safe to run more than once (the insert is skipped if the slug
-- exists; the update just sets the same value again).
-- How to run: paste this whole file into the Supabase dashboard SQL editor and Run.

insert into public.projects (
  title, slug, summary, content, cover_image_url, tags, links, featured, label, status, sort_order, published_at
)
select
  'IVF Assistant',
  'ivf-assistant',
  'A live copilot for IVF clinic counsellors: it listens to the counselling conversation and prompts the relationship manager with the right thing to say at the right moment, so more consultations turn into treatment.',
  '<p>IVF clinics rely on counsellors and relationship managers (RMs) to guide patients through one of the biggest decisions of their lives. How that conversation goes decides whether a patient moves ahead with treatment, and the quality of it varies a lot from one RM to the next.</p><p>The IVF Assistant sits in on the conversation and helps the RM in the moment.</p><ul><li><strong>Live prompting:</strong> it listens to the whole counselling conversation and suggests what to say next: the question to ask, the concern to address, the information the patient still needs.</li><li><strong>Gamification for RMs:</strong> streaks and progress, so using the assistant becomes a daily habit rather than a chore.</li><li><strong>Multi-level admin panel:</strong> every stakeholder sees what the people reporting to them are doing, from individual RMs up to clinic leadership.</li></ul>',
  null::text,
  '{"Real-time AI","Conversation intelligence","Gamification","Multi-level admin"}',
  '{}'::jsonb,
  true,
  'AI product',
  'published',
  0,
  now()
where not exists (select 1 from public.projects where slug = 'ivf-assistant');

update public.projects set featured = false where slug = 'rec-mirzapur';
