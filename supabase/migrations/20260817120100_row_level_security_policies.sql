-- Owner-scoped RLS on every table. No permissive public policies.
-- The ownership helper lives in a schema PostgREST does not expose, so it is
-- not reachable as an RPC.
alter table public.presentation_sessions enable row level security;
alter table public.discovery_notes       enable row level security;
alter table public.capability_reviews    enable row level security;
alter table public.decisions             enable row level security;
alter table public.action_items          enable row level security;
alter table public.meeting_summaries     enable row level security;
alter table public.presenter_preferences enable row level security;

create schema if not exists private;
revoke all on schema private from anon, authenticated;

create or replace function private.owns_session(sid uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.presentation_sessions s
                 where s.id = sid and s.presenter_user_id = (select auth.uid()));
$$;
revoke all on function private.owns_session(uuid) from public, anon, authenticated;

create policy "sessions_select_own" on public.presentation_sessions
  for select to authenticated using ((select auth.uid()) = presenter_user_id);
create policy "sessions_insert_own" on public.presentation_sessions
  for insert to authenticated with check ((select auth.uid()) = presenter_user_id);
create policy "sessions_update_own" on public.presentation_sessions
  for update to authenticated using ((select auth.uid()) = presenter_user_id)
  with check ((select auth.uid()) = presenter_user_id);
create policy "sessions_delete_own" on public.presentation_sessions
  for delete to authenticated using ((select auth.uid()) = presenter_user_id);

do $$
declare t text;
begin
  foreach t in array array['discovery_notes','capability_reviews','decisions','action_items','meeting_summaries']
  loop
    execute format($f$
      create policy "%1$s_select_own" on public.%1$I for select to authenticated
        using ((select auth.uid()) = created_by or private.owns_session(session_id));
      create policy "%1$s_insert_own" on public.%1$I for insert to authenticated
        with check ((select auth.uid()) = created_by and private.owns_session(session_id));
      create policy "%1$s_update_own" on public.%1$I for update to authenticated
        using ((select auth.uid()) = created_by or private.owns_session(session_id))
        with check ((select auth.uid()) = created_by or private.owns_session(session_id));
      create policy "%1$s_delete_own" on public.%1$I for delete to authenticated
        using ((select auth.uid()) = created_by or private.owns_session(session_id));
    $f$, t);
  end loop;
end $$;

create policy "prefs_select_own" on public.presenter_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "prefs_insert_own" on public.presenter_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "prefs_update_own" on public.presenter_preferences
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "prefs_delete_own" on public.presenter_preferences
  for delete to authenticated using ((select auth.uid()) = user_id);
