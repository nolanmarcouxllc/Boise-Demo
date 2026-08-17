/**
 * Local-first persistence.
 *
 * Every write lands in localStorage first and is only then queued for Supabase.
 * A dropped connection during the meeting must never lose a note, so the local
 * copy is always the source the UI reads from.
 */
export type SyncState = 'saved' | 'saving' | 'offline' | 'sync-required' | 'sync-failed'

export interface LocalRecord {
  /** Client-generated id, reused on retry so a retry cannot duplicate a row. */
  id: string
  table: string
  payload: Record<string, unknown>
  createdAt: string
  synced: boolean
  attempts: number
  lastError?: string
}

const KEY = 'bcc.local.v1'

export function readAll(): LocalRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LocalRecord[]) : []
  } catch {
    return []
  }
}

export function writeAll(records: LocalRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records))
  } catch {
    /* storage can be blocked in a sandboxed viewer; the session still works in memory */
  }
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `loc-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`
}

export function append(table: string, payload: Record<string, unknown>): LocalRecord {
  const rec: LocalRecord = { id: uuid(), table, payload, createdAt: new Date().toISOString(), synced: false, attempts: 0 }
  writeAll([...readAll(), rec])
  return rec
}

export function update(id: string, patch: Partial<LocalRecord>): void {
  writeAll(readAll().map((r) => (r.id === id ? { ...r, ...patch } : r)))
}

export function remove(id: string): void {
  writeAll(readAll().filter((r) => r.id !== id))
}

export function byTable(table: string): LocalRecord[] {
  return readAll().filter((r) => r.table === table)
}

export function unsyncedCount(): number {
  return readAll().filter((r) => !r.synced).length
}

export function clearAll(): void {
  writeAll([])
}

export function exportJson(): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), records: readAll() }, null, 2)
}

export function exportMarkdown(): string {
  const rows = readAll()
  const lines = ['# Westfield Branch Intelligence — Meeting Record', '']
  lines.push('_Captured during a demonstration walkthrough. All product data shown was simulated._', '')
  const groups = new Map<string, LocalRecord[]>()
  rows.forEach((r) => groups.set(r.table, [...(groups.get(r.table) ?? []), r]))
  groups.forEach((items, table) => {
    lines.push(`## ${table.replace(/_/g, ' ')}`, '')
    items.forEach((r) => {
      const p = r.payload as Record<string, string>
      const label = p.note ?? p.title ?? p.comments ?? '(no text)'
      lines.push(`- ${label}`)
      const meta = [p.section, p.classification, p.capability_key, p.rating, p.owner, p.priority].filter(Boolean)
      if (meta.length) lines.push(`  - ${meta.join(' · ')}`)
      lines.push(`  - ${r.synced ? 'synced' : 'local only'}`)
    })
    lines.push('')
  })
  if (!rows.length) lines.push('_Nothing captured yet._')
  return lines.join('\n')
}

/**
 * Minimal shape of the host runtime available when the board is opened through
 * a sandboxed viewer rather than served from its own origin.
 */
interface HostRuntime {
  use(name: 'downloads'): Promise<{ save(r: { filename: string; data: string }): Promise<unknown> } | null>
}

export type DownloadResult = 'saved' | 'declined' | 'unavailable'

/**
 * Hand the export to the operator. A sandboxed viewer blocks page-initiated
 * downloads outright, so ask the host to save the file when it offers that and
 * fall back to an anchor when the board is served normally. The caller needs to
 * know which happened — a silent no-op looks like the meeting notes vanished.
 */
export async function download(filename: string, contents: string, type: string): Promise<DownloadResult> {
  const host = (globalThis as { claude?: HostRuntime }).claude
  if (host?.use) {
    try {
      const downloads = await host.use('downloads')
      if (downloads) {
        await downloads.save({ filename, data: contents })
        return 'saved'
      }
    } catch (err) {
      const code = (err as { code?: string } | null)?.code
      // Only a lifecycle failure is worth retrying through an anchor; a viewer
      // who declined has answered the question.
      if (code === 'declined' || code === 'rate_limited') return 'declined'
    }
  }

  try {
    const blob = new Blob([contents], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return 'saved'
  } catch {
    return 'unavailable'
  }
}
