-- Seed data: Harsh Pandey's real portfolio content.
-- Idempotent: each table is cleared before re-inserting, so this file can be
-- re-run safely against the same database. Wrapped in a single transaction.
--
-- The copy here is written for one reader: someone deciding whether to hire
-- Harsh to hand a whole workflow over to an AI system. It states capability and
-- scope of ownership, and deliberately claims no metrics that could not be
-- defended in a sales call.
--
-- Requires the tables from `migrations/0001_schema.sql` to exist first.

begin;

-- ---------------------------------------------------------------------------
-- profile (singleton)
-- ---------------------------------------------------------------------------
delete from public.profile;

insert into public.profile (
  full_name, title, headline, bio, avatar_url, resume_url, location, email, phone, socials, singleton
) values (
  'Harsh Pandey',
  'AI Product Engineer',
  'I build AI systems that take over work a person used to do — tutors, interviewers, evaluators — live voice and video included, and everything around them.',
  'The interesting AI work right now is not a chatbot bolted onto a product. It is a system that takes over a job a person used to do, end to end. That is what I build: an AI tutor that plans a syllabus, teaches live, sets the assessment, marks it, and moves the learner on. An AI interviewer that runs screening, technical, and behavioural rounds inside one live session and scores the result. It means the live voice and video layer over LiveKit and WebRTC, the agent orchestration and evaluation behind it, and the unglamorous rest — FastAPI and Postgres services, background jobs, retries, migrations, reporting, and the admin surfaces someone actually runs it from. I take this work from an ambiguous first conversation to something that still holds up on its thousandth session, and I stay for the part where it breaks.',
  null,
  '/resume.pdf',
  'New Delhi, India · working with teams remotely',
  'harshp6421@gmail.com',
  null,
  '{"github":"https://github.com/whiteknight16","linkedin":"https://www.linkedin.com/in/harshpandey61/","instagram":"https://www.instagram.com/whiteknight__19/"}'::jsonb,
  true
);

-- ---------------------------------------------------------------------------
-- site_sections
--
-- Order is the argument the page makes: what can be bought, proof that it has
-- been built, the depth behind it, who is behind it, then the ask.
-- `achievements` and `education` are switched off rather than deleted — they
-- are student credentials that undercut a consulting pitch, but they stay one
-- click away in the admin.
-- ---------------------------------------------------------------------------
delete from public.site_sections;

insert into public.site_sections (key, label, enabled, sort_order) values
  ('services',     'Services',     true,  1),
  ('projects',     'Work',         true,  2),
  ('experience',   'Experience',   true,  3),
  ('about',        'About',        true,  4),
  ('skills',       'Capabilities', true,  5),
  ('achievements', 'Recognition',  false, 6),
  ('education',    'Education',    false, 7),
  ('contact',      'Contact',      true,  8),
  ('blog',         'Blog',         true,  9);

-- ---------------------------------------------------------------------------
-- experiences
--
-- Trimmed from exhaustive task lists to the work that demonstrates hard
-- capability. Everything cut is still on the resume.
-- ---------------------------------------------------------------------------
delete from public.experiences;

insert into public.experiences (
  role, company, location, start_date, end_date, is_current, highlights, sort_order
) values
  (
    'Software Engineer',
    'BerriBot',
    null,
    '2026-03-01',
    null,
    true,
    '{"Build an AI tutor that does what a human tutor does: teaches live over voice and video, sets and marks assessments, and moves the learner through the syllabus.","Designed the learning core end to end: syllabus generation, planner agents, coding assessments, mock interviews, verification pipelines, and automated course progression.","Built the backend on FastAPI, PostgreSQL, and Supabase — APIs, background jobs, retry paths, migrations, and deployments.","Built AI proctoring with video capture, live monitoring, secure storage, and candidate evaluation.","Diagnose and fix production failures across voice pipelines, agents, and enterprise deployments — the work that turns a demo into a product teams rely on."}',
    1
  ),
  (
    'Full Stack Engineer',
    'SkillSync',
    null,
    '2025-03-01',
    '2026-02-28',
    false,
    '{"Designed and shipped an AI interviewer that replaces the human screening loop — multi-round spoken interviews conducted live over LiveKit and WebRTC.","Orchestrated several AI agents across screening, technical, and behavioural rounds inside a single live session.","Owned the real-time voice layer: session lifecycle, low-latency audio streaming, reconnection, and the failure modes that only appear in production.","Built FastAPI services for session coordination, adaptive question generation, and scoring pipelines.","Led a database migration off the legacy schema with minimal production downtime, working directly with the founders."}',
    2
  ),
  (
    'Generative AI Intern',
    'EY',
    'Gurugram',
    '2024-07-01',
    '2024-08-31',
    false,
    '{"Built a bench management portal in React to improve utilisation of unassigned staff and reduce hiring spend.","Built an AI assistant over the internal database using FastAPI, the Gemini API, and fine-tuning.","Shipped the interactive reporting layer — filterable workforce statistics and charts."}',
    3
  ),
  (
    'Full Stack Developer Intern',
    'Ransh Innovations',
    'Remote',
    '2023-11-01',
    '2024-05-31',
    false,
    '{"First engineering hire at an early-stage startup, building the product end to end.","Designed and hardened REST APIs for performance and security, with authentication and data protection.","Worked directly with the founder on schema design and system architecture."}',
    4
  );

-- ---------------------------------------------------------------------------
-- skills
--
-- Grouped by capability, AI first, with the real-time layer right behind it
-- as the rarer differentiator. Deliberately omits HTML, CSS, Git,
-- and GitHub: listing them reads as a beginner inventory, and their absence
-- reads as seniority.
-- ---------------------------------------------------------------------------
delete from public.skills;

insert into public.skills (name, category, sort_order) values
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

-- ---------------------------------------------------------------------------
-- projects
--
-- Summaries state the problem before the stack. AI work leads; the delivered-
-- for-a-real-organisation work comes second.
-- ---------------------------------------------------------------------------
delete from public.projects;

insert into public.projects (
  title, slug, summary, content, cover_image_url, tags, links, featured, status, sort_order, published_at
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
    false,
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
    'published',
    4,
    now()
  );

-- ---------------------------------------------------------------------------
-- achievements
--
-- Section is disabled on the homepage (see site_sections). Kept here so the
-- data survives and the section can be switched back on from the admin.
-- ---------------------------------------------------------------------------
delete from public.achievements;

insert into public.achievements (title, description, sort_order) values
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

-- ---------------------------------------------------------------------------
-- education
-- Section is disabled on the homepage; the detail lives on the resume.
-- ---------------------------------------------------------------------------
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
