import { useEffect, useState } from 'react'
import { CLOUD_DISABLED_MESSAGE, isSupabaseConfigured, supabase } from '../lib/supabase'
import { clearAll, download, exportJson, exportMarkdown, unsyncedCount } from '../lib/localStore'
import { syncNow } from '../services/sync'

const VERSION = '2.0.0'

export function SystemStatus({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState<string | null>(null)
  const [pending, setPending] = useState(0)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [state, setState] = useState<string>(isSupabaseConfigured ? 'Ready' : 'Local only')
  const [signInEmail, setSignInEmail] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setPending(unsyncedCount())
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setEmail(session?.user?.email ?? null))
    return () => sub.subscription.unsubscribe()
  }, [open])

  if (!open) return null

  const signIn = async () => {
    if (!supabase || !signInEmail.trim()) return
    setMsg('Sending link…')
    const { error } = await supabase.auth.signInWithOtp({ email: signInEmail.trim(), options: { emailRedirectTo: window.location.origin } })
    setMsg(error ? `Could not send: ${error.message}` : 'Check your email for the sign-in link.')
  }

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="System status">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative w-[520px] rounded-card border border-line bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="panel-title">System status</h2>
          <button type="button" onClick={onClose} className="cond rounded-sm2 border border-line px-2 py-1 text-[10.5px] font-bold uppercase text-inkSoft">Close</button>
        </div>
        <div className="px-4 py-3">
          <dl className="grid grid-cols-2 gap-x-4">
            {[
              ['Application version', VERSION],
              ['Cloud saving', isSupabaseConfigured ? 'Configured' : 'Not configured'],
              ['Authentication', email ? `Signed in as ${email}` : 'Signed out'],
              ['Unsynced local changes', String(pending)],
              ['Last successful sync', lastSync ?? 'Not yet this session'],
              ['Environment', import.meta.env.MODE],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-lineSoft py-1.5">
                <dt className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">{k}</dt>
                <dd className="text-[12px] text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          {!isSupabaseConfigured && (
            <p className="mt-3 rounded-sm2 border border-amber/40 bg-amber/5 px-3 py-2 text-[11.5px] text-amber">{CLOUD_DISABLED_MESSAGE}</p>
          )}

          {isSupabaseConfigured && !email && (
            <div className="mt-3 rounded-sm2 border border-line bg-shell p-3">
              <div className="cond mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Presenter sign-in (magic link)</div>
              <div className="flex gap-2">
                <input type="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} placeholder="you@example.com" className="flex-1 rounded-sm2 border border-line px-2 py-1.5 text-[12px]" />
                <button type="button" onClick={signIn} className="cond rounded-sm2 bg-forest px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-white">Send link</button>
              </div>
              {msg && <p className="mt-1.5 text-[11.5px] text-inkSoft">{msg}</p>}
              <p className="mt-1.5 text-[11px] leading-snug text-inkSoft">Saved meeting information requires sign-in. The presentation itself does not.</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                setState('Syncing…')
                const r = await syncNow(null, null)
                setState(r === 'saved' ? 'Saved' : r === 'offline' ? 'Offline — saved locally' : 'Sync required')
                if (r === 'saved') setLastSync(new Date().toLocaleTimeString())
                setPending(unsyncedCount())
              }}
              className="cond rounded-sm2 border border-line px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink hover:border-accent"
            >
              Sync now
            </button>
            <button type="button" onClick={() => download('westfield-meeting.json', exportJson(), 'application/json')} className="cond rounded-sm2 border border-line px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink hover:border-accent">Export JSON</button>
            <button type="button" onClick={() => download('westfield-meeting.md', exportMarkdown(), 'text/markdown')} className="cond rounded-sm2 border border-line px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-ink hover:border-accent">Export Markdown</button>
            {email && supabase && (
              <button type="button" onClick={() => void supabase?.auth.signOut()} className="cond rounded-sm2 border border-line px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-inkSoft">Sign out</button>
            )}
            <button
              type="button"
              onClick={() => { clearAll(); setPending(0) }}
              className="cond rounded-sm2 border border-danger/40 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-danger"
            >
              Reset local demo data
            </button>
          </div>
          <p className="mt-2 text-[11px] text-inkFaint">{state}</p>
        </div>
      </div>
    </div>
  )
}
