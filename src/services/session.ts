import { isSupabaseConfigured, supabase } from '../lib/supabase'

export interface PresenterSession {
  id: string
  title: string
  status: string
}

/** Finds the presenter's active session or creates one. */
export async function ensureSession(userId: string): Promise<PresenterSession | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: existing } = await supabase
    .from('presentation_sessions')
    .select('id,title,status')
    .eq('presenter_user_id', userId)
    .in('status', ['draft', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)

  if (existing && existing.length) return existing[0] as PresenterSession

  const { data, error } = await supabase
    .from('presentation_sessions')
    .insert({
      title: 'Westfield Branch Intelligence Walkthrough',
      branch: 'Westfield, MA',
      meeting_date: new Date().toISOString().slice(0, 10),
      presenter_user_id: userId,
      status: 'active',
    })
    .select('id,title,status')
    .single()

  if (error) return null
  return data as PresenterSession
}
