-- Applied to project Boise-Demo. Stores only information created during the
-- presentation; the simulated Boise dataset stays in version-controlled seed
-- files inside the application.
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

create table public.presentation_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null default 'Boise Cascade',
  branch text not null default 'Westfield, MA',
  meeting_date date,
  presenter_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','active','complete','archived')),
  current_section text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index presentation_sessions_presenter_idx on public.presentation_sessions (presenter_user_id, created_at desc);

create table public.discovery_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.presentation_sessions (id) on delete cascade,
  section text not null,
  subject_type text,
  subject_id text,
  note text not null,
  classification text not null default 'assumption' check (classification in (
    'confirmed','assumption','partially_accurate','inaccurate',
    'already_handled','valuable_gap','needs_it_validation','measurement_required','explore_later')),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  owner text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index discovery_notes_session_idx on public.discovery_notes (session_id, created_at desc);
create index discovery_notes_creator_idx on public.discovery_notes (created_by);

create table public.capability_reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.presentation_sessions (id) on delete cascade,
  capability_key text not null,
  rating text check (rating in ('accurate','partially_accurate','inaccurate','already_handled','valuable_gap','explore_later')),
  operational_value text check (operational_value in ('high','medium','low','none')),
  current_process text, current_system text, comments text,
  validation_status text not null default 'not_reviewed' check (validation_status in ('not_reviewed','needs_it_validation','measurement_required','validated')),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, capability_key)
);
create index capability_reviews_session_idx on public.capability_reviews (session_id);

create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.presentation_sessions (id) on delete cascade,
  title text not null, decision text, rationale text, supporting_evidence text,
  owner text, due_date date,
  status text not null default 'open' check (status in ('open','approved','declined','deferred','complete')),
  expected_outcome text, actual_outcome text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index decisions_session_idx on public.decisions (session_id, created_at desc);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.presentation_sessions (id) on delete cascade,
  title text not null, description text, owner text,
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  due_date date,
  status text not null default 'open' check (status in ('open','in_progress','blocked','complete','cancelled')),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index action_items_session_idx on public.action_items (session_id, created_at desc);

create table public.meeting_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.presentation_sessions (id) on delete cascade,
  summary_markdown text, workflow_corrections text, confirmed_problems text,
  opportunities text, questions_for_it text, questions_for_dmsi text,
  questions_for_trimble text, required_stakeholders text, recommended_next_step text,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index meeting_summaries_session_idx on public.meeting_summaries (session_id, created_at desc);

create table public.presenter_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  default_mode text not null default 'explore' check (default_mode in ('explore','presentation')),
  reduced_motion boolean not null default false,
  last_session_id uuid references public.presentation_sessions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger presentation_sessions_touch before update on public.presentation_sessions for each row execute function public.set_updated_at();
create trigger discovery_notes_touch       before update on public.discovery_notes       for each row execute function public.set_updated_at();
create trigger capability_reviews_touch    before update on public.capability_reviews    for each row execute function public.set_updated_at();
create trigger decisions_touch             before update on public.decisions             for each row execute function public.set_updated_at();
create trigger action_items_touch          before update on public.action_items          for each row execute function public.set_updated_at();
create trigger meeting_summaries_touch     before update on public.meeting_summaries     for each row execute function public.set_updated_at();
create trigger presenter_preferences_touch before update on public.presenter_preferences for each row execute function public.set_updated_at();
