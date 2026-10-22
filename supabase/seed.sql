-- =====================================================================
-- Portfolio — content RESET
-- OVERWRITES content tables: profile, site_sections, experiences, skills,
-- projects, achievements, education. Anything you edited in the admin on
-- those tables is replaced with the values below.
-- Leaves posts, subscribers and contact_messages alone.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Needs the schema from setup.sql (or migrations 0001-0006) to exist first.
-- To set up a new project without overwriting anything, use setup.sql instead.
-- The values here must stay identical to the Content section of setup.sql.
-- =====================================================================

begin;

-- profile (singleton)
delete from public.profile;

insert into public.profile (
  full_name, title, handle, headline, tagline, bio, avatar_url, resume_url, location, email, phone, career_start_date, now, highlights, socials, singleton
) values (
  'Harsh Pandey',
  'AI engineer & builder',
  'Knight Developer',
  'I build AI that *does the actual work*: not chatbots, but interviewers and tutors that run live, on voice and video.',
  'I''ve spent the last {years} years shipping these to production, and owning everything that breaks around them. Here I write about what I''m building, what goes wrong, and what I''m figuring out next.',
  'I''m Harsh Pandey, known online as Knight Developer. I build AI that does real work: systems that take over a job a person used to do, end to end. Over the last {years} years that has meant an AI interviewer that runs live, multi-round spoken interviews, and an AI tutor that teaches over voice and video, sets the test, marks it and moves the learner on. I care about the whole system around the model as much as the model itself: the real-time voice layer, the FastAPI and Postgres services, the jobs, retries and migrations, and the part where it breaks in production and someone has to fix it. Before that I was the first engineering hire at an early-stage startup, built a GenAI assistant at EY, and reached the Smart India Hackathon 2024 grand finale. This site is where I write about what I''m building, what goes wrong, and what I''m learning next, including machine learning from first principles.',
  '/profile.png',
  '/resume.pdf',
  'New Delhi, India',
  'harshp6421@gmail.com',
  null::text,
  '2025-03-01'::date,
  '{"building":"an AI tutor that teaches live over voice & video","writing":"notes on voice agents and what breaks in production","learning":"ML from first principles"}'::jsonb,
  '[{"value":"2","label":"live voice & video AI products built"},{"value":"Finalist","label":"Smart India Hackathon 2024, national round"},{"value":"#1 hire","label":"first engineer at an early-stage startup"}]'::jsonb,
  '{"github":"https://github.com/whiteknight16","linkedin":"https://www.linkedin.com/in/harshpandey61/","instagram":"https://www.instagram.com/whiteknight__19/"}'::jsonb,
  true
);

-- site_sections: projects, blog, newsletter, experience
delete from public.site_sections;

insert into public.site_sections (key, label, enabled, sort_order) values
  ('projects', 'Things I''ve built', true, 1),
  ('blog', 'Notes', true, 2),
  ('newsletter', 'Subscribe', true, 3),
  ('experience', 'Work', true, 4);

-- experiences
delete from public.experiences;

insert into public.experiences (
  role, company, location, start_date, end_date, is_current, highlights, tags, sort_order
) values
  (
    'Software Engineer',
    'BerriBot',
    null,
    '2026-03-01',
    null,
    true,
    '{"Building an AI tutor that teaches live over voice and video, sets and marks assessments, and moves learners through a syllabus. Plus AI proctoring and the FastAPI and Postgres backend under it.","Designed the learning core end to end: syllabus generation, planner agents, coding assessments, mock interviews, verification pipelines, and automated course progression.","Built the backend on FastAPI, PostgreSQL, and Supabase — APIs, background jobs, retry paths, migrations, and deployments.","Built AI proctoring with video capture, live monitoring, secure storage, and candidate evaluation.","Diagnose and fix production failures across voice pipelines, agents, and enterprise deployments — the work that turns a demo into a product teams rely on."}',
    '{"voice agents","FastAPI"}',
    1
  ),
  (
    'Full Stack Engineer',
    'SkillSync',
    null,
    '2025-03-01',
    '2026-02-28',
    false,
    '{"Shipped an AI interviewer that replaced the human screening loop: several agents running spoken screening, technical and behavioural rounds in one live LiveKit session. Owned the real-time voice layer.","Owned the real-time voice layer: session lifecycle, low-latency audio streaming, reconnection, and the failure modes that only appear in production.","Built FastAPI services for session coordination, adaptive question generation, and scoring pipelines.","Led a database migration off the legacy schema with minimal production downtime, working directly with the founders."}',
    '{"LiveKit","multi-agent"}',
    2
  ),
  (
    'Generative AI Intern',
    'EY',
    'Gurugram',
    '2024-07-01',
    '2024-08-31',
    false,
    '{"Built an AI assistant over internal data with FastAPI and Gemini, and a portal to put unassigned staff back on work.","Shipped the interactive reporting layer — filterable workforce statistics and charts."}',
    '{"Gemini"}',
    3
  ),
  (
    'Full Stack Developer Intern',
    'Ransh Innovations',
    'Remote',
    '2023-11-01',
    '2024-05-31',
    false,
    '{"First engineering hire at an early-stage startup. Built the product end to end, side by side with the founder.","Designed and hardened REST APIs for performance and security, with authentication and data protection.","Worked directly with the founder on schema design and system architecture."}',
    '{"first hire"}',
    4
  );

-- skills, grouped by capability
delete from public.skills;

insert into public.skills (
  name, category, sort_order
) values
  -- AI & Agents
  ('LLMs',                        'AI & Agents', 1),
  ('LangChain',                   'AI & Agents', 2),
  ('LangGraph',                   'AI & Agents', 3),
  ('Multi-agent orchestration',   'AI & Agents', 4),
  ('Agentic workflows',           'AI & Agents', 5),
  ('Evaluation & scoring',        'AI & Agents', 6),
  ('Prompt engineering',          'AI & Agents', 7),
  -- Real-time & Voice
  ('LiveKit',                     'Real-time & Voice', 8),
  ('WebRTC',                      'Real-time & Voice', 9),
  ('Voice agent pipelines',       'Real-time & Voice', 10),
  ('Session orchestration',       'Real-time & Voice', 11),
  ('WebSockets',                  'Real-time & Voice', 12),
  -- Backend
  ('Python',                      'Backend', 13),
  ('FastAPI',                     'Backend', 14),
  ('Node.js',                     'Backend', 15),
  ('REST APIs',                   'Backend', 16),
  ('Auth (JWT, OAuth, 2FA)',      'Backend', 17),
  ('Background jobs & queues',    'Backend', 18),
  -- Data
  ('PostgreSQL',                  'Data', 19),
  ('Supabase',                    'Data', 20),
  ('MongoDB',                     'Data', 21),
  ('Prisma',                      'Data', 22),
  ('Schema migrations',           'Data', 23),
  -- Frontend
  ('TypeScript',                  'Frontend', 24),
  ('React',                       'Frontend', 25),
  ('Next.js',                     'Frontend', 26),
  ('Tailwind CSS',                'Frontend', 27),
  -- Infrastructure
  ('Docker',                      'Infrastructure', 28),
  ('Kubernetes',                  'Infrastructure', 29),
  ('CI/CD',                       'Infrastructure', 30),
  ('Inngest',                     'Infrastructure', 31);

-- projects (label = small tag on the card; featured ones appear on the home page)
delete from public.projects;

insert into public.projects (
  title, slug, summary, content, cover_image_url, tags, links, featured, label, status, sort_order, published_at
) values
  (
    'Interview Genie',
    'interview-genie',
    'Career advice is generic because it is cheap to produce. This turns one specific role into a tailored resume, cover letter, and practice set — and keeps the market data behind it fresh on a schedule.',
    '<p>Career tooling is full of templates that ignore the role you are actually applying for. Interview Genie starts from the specific job and works backwards.</p><ul><li>Resume generation, cover letters, and role-adapted practice built on the Gemini API.</li><li>Next.js, PostgreSQL, and Prisma, with Inngest running the scheduled jobs that keep career insights current rather than frozen at signup.</li><li>Analytics rendered with Recharts; end-to-end validation with Zod and React Hook Form.</li></ul>',
    null,
    '{"Next.js","PostgreSQL","Prisma","Gemini","Inngest","Recharts"}',
    '{"repo":"https://github.com/whiteknight16/interview-genie","live":"https://interview-genie-snowy.vercel.app"}'::jsonb,
    true,
    'AI product',
    'published',
    1,
    now()
  ),
  (
    'REC Mirzapur — Official College Website',
    'rec-mirzapur',
    'The official web presence for a state government engineering college, built and delivered solo — requirements gathered from faculty stakeholders, then handed over as a system they could run without me.',
    '<p>A state government engineering college needed an official website and had no in-house engineering team. I took it from requirements to handover on my own.</p><ul><li>Sole developer: scoping with faculty stakeholders, build, launch, and handover.</li><li>Content structured so non-technical staff could maintain it after delivery.</li></ul>',
    null,
    '{"Web Development","Solo delivery","Stakeholder management"}',
    '{}'::jsonb,
    true,
    'Delivered solo',
    'published',
    2,
    now()
  ),
  (
    'Notes Nest',
    'notes-nest',
    'A note-taking app built as a complete commercial slice rather than a demo: real authentication, real subscription billing, and a typed Postgres backend behind the editor.',
    '<p>Most side-project note apps stop at the editor. This one was built to prove out the parts that actually make a product sellable.</p><ul><li>Authentication via Kinde and subscription billing via Stripe.</li><li>Next.js and TypeScript on the front, Prisma and PostgreSQL behind it.</li></ul>',
    null,
    '{"Next.js","TypeScript","Prisma","PostgreSQL","Stripe"}',
    '{"repo":"https://github.com/whiteknight16/Notes-Nest","live":"https://notes-nest.vercel.app"}'::jsonb,
    true,
    'SaaS',
    'published',
    3,
    now()
  ),
  (
    'Gymkhana',
    'gymkhana',
    'A fitness platform with genuinely separate admin and member surfaces — role-based access, progress tracking, and charts that make the numbers mean something.',
    '<p>A fitness tracking platform built around two distinct audiences rather than one shared dashboard.</p><ul><li>Separate role-based admin and member experiences with enforced authorisation.</li><li>Progress and fitness metrics visualised for members, aggregate views for admins.</li></ul>',
    null,
    '{"MongoDB","Express","React","Node.js"}',
    '{"repo":"https://github.com/whiteknight16/Gymkhana"}'::jsonb,
    false,
    'Full-stack app',
    'published',
    4,
    now()
  );

-- achievements (kept for the admin; no public section)
delete from public.achievements;

insert into public.achievements (
  title, description, sort_order
) values
  (
    'Smart India Hackathon — 2024 Grand Finalist',
    'Reached the national Grand Finale of Smart India Hackathon 2024, after winning the college round in both 2023 and 2024.',
    1
  ),
  (
    'Top 100 — GirlScript Summer of Code',
    'Finished in the top 100 contributors of GirlScript Summer of Code.',
    2
  ),
  (
    'Web Development Team Lead',
    'Two years on the college web development team, leading it in the final year.',
    3
  );

-- education (kept for the admin; no public section)
delete from public.education;

insert into public.education (
  degree, institution, location, start_date, end_date, description, sort_order
) values (
  'B.Tech, Computer Science & Engineering',
  'Rajkiya Engineering College Sonbhadra',
  null,
  '2021-09-01',
  '2025-06-30',
  '',
  1
);

commit;
