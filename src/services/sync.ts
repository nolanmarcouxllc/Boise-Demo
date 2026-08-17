import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { readAll, update, unsyncedCount, type SyncState } from '../lib/localStore'

/**
 * Pushes anything still marked unsynced. The client-generated id is reused as
 * the row's primary key and the upsert ignores duplicates, so a retry after a
 * half-completed request cannot create a second row.
 */
export async function syncNow(sessionId: string | null, userId: string | null): Promise<SyncState> {
  if (!isSupabaseConfigured || !supabase) return 'offline'
  if (!navigator.onLine) return 'offline'
  if (!sessionId || !userId) return 'sync-required'

  const pending = readAll().filter((r) => !r.synced)
  if (!pending.length) return 'saved'

  let failed = false
  for (const rec of pending) {
    const row = { id: rec.id, session_id: sessionId, created_by: userId, ...rec.payload }
    const { error } = await supabase.from(rec.table).upsert(row, { onConflict: 'id', ignoreDuplicates: false })
    if (error) {
      failed = true
      update(rec.id, { attempts: rec.attempts + 1, lastError: error.message })
    } else {
      update(rec.id, { synced: true, lastError: undefined })
    }
  }
  return failed ? 'sync-failed' : 'saved'
}

export function pendingCount(): number {
  return unsyncedCount()
}
