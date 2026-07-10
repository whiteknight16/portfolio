-- Seed data: Harsh Pandey's real portfolio content.
-- Idempotent: each table is cleared before re-inserting, so this file can be
-- re-run safely against the same database. Wrapped in a single transaction.

begin;

-- ---------------------------------------------------------------------------
-- profile (singleton)
-- ---------------------------------------------------------------------------
delete from public.profile;

insert into public.profile (
  full_name, title, headline, bio, avatar_url, resume_url, location, email, phone, socials, singleton
) values (
  'Harsh Pandey',
  'Full Stack Developer',
  'Full Stack Developer specializing in MERN, Next.js, FastAPI & Generative AI',
  'Full Stack Developer specializing in the MERN stack, Next.js, FastAPI, and Generative AI. Currently building an agentic AI-powered interview platform at SkillSync. Experienced with real-time systems (WebRTC/LiveKit), LLM integrations (LangChain, LangGraph), and end-to-end product ownership from requirements to production.',
  null,
  '/resume.pdf',
  'Dwarka, New Delhi, India',
  'harshp6421@gmail.com',
  null,
  '{"github":"https://github.com/whiteknight16","linkedin":"https://www.linkedin.com/in/harshpandey61/","instagram":"https://www.instagram.com/knightcoder19/"}'::jsonb,
  true
);

-- ---------------------------------------------------------------------------
-- site_sections
-- ---------------------------------------------------------------------------
delete from public.site_sections;

insert into public.site_sections (key, label, enabled, sort_order) values
  ('about',        'About',        true, 1),
  ('experience',   'Experience',   true, 2),
  ('skills',       'Skills',       true, 3),
  ('projects',     'Projects',     true, 4),
  ('achievements', 'Achievements', true, 5),
  ('education',    'Education',    true, 6),
  ('contact',      'Contact',      true, 7),
  ('blog',         'Blog',         true, 8);

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------
delete from public.experiences;

insert into public.experiences (
  role, company, location, start_date, end_date, is_current, highlights, sort_order
) values
  (
    'Full Stack Engineer',
    'SkillSync',
    null,
    '2025-03-01',
    null,
    true,
    '{"Designed, developed, and deployed a unified agentic AI-powered interview platform combining multi-round AI interviews with LiveKit-based WebRTC for real-time audio/video.","Implemented multi-agent interview orchestration — AI agents conducting screening, technical, and behavioral rounds within a single live interview flow.","Built the real-time interview experience with LiveKit (WebRTC): session lifecycle management, low-latency streaming, reconnections, and production reliability.","Integrated AI-generated interview questions and evaluation logic dynamically adapted to job roles, stages, and candidate responses.","Developed FastAPI backend services for interview sessions, agent coordination, scoring pipelines, and data persistence.","Led a database schema migration from legacy structure to optimized design with minimal production downtime.","Built background jobs and cron services for notifications, reporting, and data sync.","Owned features end-to-end, collaborating directly with founders and product stakeholders."}',
    1
  ),
  (
    'Generative AI Intern',
    'EY',
    'Gurugram',
    '2024-07-01',
    '2024-08-31',
    false,
    '{"Developed a Bench Management System (ERB portal) in React.js to optimize utilization of benched employees, reducing hiring costs.","Built an AI-powered chatbot using FastAPI, Gemini API, and fine-tuning to handle database queries and provide insights.","Integrated interactive data visualization (employee statistics, filterable graphs).","Hands-on with LLMs, LangChain, and model fine-tuning for real-world applications."}',
    2
  ),
  (
    'Full Stack Developer Intern',
    'Ransh Innovations',
    'Remote',
    '2023-11-01',
    '2024-05-31',
    false,
    '{"Full-Stack (MERN) developer at an early-stage startup.","Developed and optimized RESTful APIs for performance, scalability, and security.","Implemented secure authentication and data protection.","Translated Figma designs into functional UIs; wrote unit tests for front-end components.","Collaborated with the founder on schema design and HLD/LLD system architecture."}',
    3
  );

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
delete from public.skills;

insert into public.skills (name, category, sort_order) values
  -- Languages
  ('Python',               'Languages', 1),
  ('JavaScript (ES6+)',    'Languages', 2),
  ('TypeScript',           'Languages', 3),
  -- Frontend
  ('HTML5',                'Frontend', 4),
  ('CSS3',                 'Frontend', 5),
  ('Tailwind CSS',         'Frontend', 6),
  ('React.js',             'Frontend', 7),
  ('Next.js',              'Frontend', 8),
  -- Backend
  ('Node.js',              'Backend', 9),
  ('Express.js',           'Backend', 10),
  ('FastAPI',              'Backend', 11),
  ('REST APIs',            'Backend', 12),
  ('Auth (JWT, OAuth, 2FA)', 'Backend', 13),
  -- Databases & ORMs
  ('PostgreSQL',           'Databases & ORMs', 14),
  ('MongoDB',              'Databases & ORMs', 15),
  ('Firebase',             'Databases & ORMs', 16),
  ('Prisma ORM',           'Databases & ORMs', 17),
  -- AI / GenAI
  ('LLMs',                 'AI / GenAI', 18),
  ('LangChain',            'AI / GenAI', 19),
  ('LangGraph',            'AI / GenAI', 20),
  ('Prompt Engineering',   'AI / GenAI', 21),
  -- DevOps & Tooling
  ('Git',                  'DevOps & Tooling', 22),
  ('GitHub',               'DevOps & Tooling', 23),
  ('Docker',               'DevOps & Tooling', 24),
  ('Kubernetes',           'DevOps & Tooling', 25),
  ('CI/CD',                'DevOps & Tooling', 26),
  ('Cron Jobs',            'DevOps & Tooling', 27),
  ('Inngest',              'DevOps & Tooling', 28);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
delete from public.projects;

insert into public.projects (
  title, slug, summary, content, cover_image_url, tags, links, featured, status, sort_order, published_at
) values
  (
    'Interview Genie',
    'interview-genie',
    'AI-powered career platform for job insights, AI resume building, cover letters, quizzes, and career analytics.',
    '<p>AI-powered platform for job insights, AI resume building, cover letters, quizzes, and career analytics.</p><ul><li>Gemini API for resume generation, cover letter suggestions, and AI-driven career insights.</li><li>Next.js, PostgreSQL, Prisma ORM; Inngest for cron jobs and background tasks.</li><li>Interactive data visualizations with Recharts; form validation with Zod + React Hook Form.</li></ul>',
    null,
    '{"Next.js","PostgreSQL","Prisma","Gemini","Inngest","Recharts"}',
    '{"repo":"https://github.com/whiteknight16/interview-genie","live":"https://interview-genie-snowy.vercel.app"}'::jsonb,
    true,
    'published',
    1,
    now()
  ),
  (
    'Gymkhana',
    'gymkhana',
    'Comprehensive fitness tracking app built on the MERN stack with role-based admin and user panels.',
    '<p>Comprehensive fitness tracking app built on the MERN stack.</p><ul><li>Role-based Admin and User panels.</li><li>Interactive charts for user progress and fitness metrics.</li><li>Secure authentication and authorization.</li></ul>',
    null,
    '{"MongoDB","Express","React","Node.js"}',
    '{"repo":"https://github.com/whiteknight16/Gymkhana"}'::jsonb,
    true,
    'published',
    2,
    now()
  ),
  (
    'REC Mirzapur — Official College Website',
    'rec-mirzapur',
    'Official website for REC Mirzapur, a state government engineering college, built independently.',
    '<p>Independently developed the official website for REC Mirzapur, a state government engineering college.</p>',
    null,
    '{"Web Development"}',
    '{}'::jsonb,
    false,
    'published',
    3,
    now()
  ),
  (
    'Notes Nest',
    'notes-nest',
    'Next.js-powered note-taking web app with authentication, billing, and a Prisma/PostgreSQL backend.',
    '<p>Your next-generation, Next.js-powered web-based note-taking app.</p><ul><li>Auth via Kinde; payments/billing via Stripe.</li><li>Next.js, TypeScript, Tailwind CSS, ShadCN/UI.</li><li>Prisma ORM with PostgreSQL.</li></ul>',
    null,
    '{"Next.js","TypeScript","Tailwind CSS","Prisma","PostgreSQL","Stripe"}',
    '{"repo":"https://github.com/whiteknight16/Notes-Nest","live":"https://notes-nest.vercel.app"}'::jsonb,
    false,
    'published',
    4,
    now()
  );

-- ---------------------------------------------------------------------------
-- achievements
-- ---------------------------------------------------------------------------
delete from public.achievements;

insert into public.achievements (title, description, sort_order) values
  (
    'Top 100 — GirlScript Summer of Code',
    'Achieved a Top 100 rank in GirlScript Summer of Code (open source program).',
    1
  ),
  (
    '1st Place — Smart India Hackathon (College Round)',
    'Won 1st place in the college-level round of Smart India Hackathon (SIH) in both 2023 and 2024.',
    2
  ),
  (
    'SIH 2024 Grand Finalist',
    'Qualified for the Grand Finale of Smart India Hackathon 2024.',
    3
  ),
  (
    'Web Development Team Lead',
    'Web Development Team Member for 2 years; Team Lead in final year at college.',
    4
  ),
  (
    'Built REC Mirzapur Official Website',
    'Independently built the official website for REC Mirzapur.',
    5
  );

-- ---------------------------------------------------------------------------
-- education
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
