import { useEffect, useState } from 'react'
import { ViewPanel } from './shared'

interface Note { id: string; section: string; text: string; kind: string }

const SECTIONS = ['What we understood correctly', 'What is different in Westfield', 'Information gaps', 'Questions for IT', 'Potential pilot']
const KINDS = ['Confirmed', 'Correction', 'Question']
const KEY = 'bcc.discovery.notes'

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Note[]) : []
  } catch {
    return [] // storage can be blocked in a sandboxed viewer
  }
}

export function DiscoveryBoardView() {
  // Read storage in the initial state. A load effect would race the save effect,
  // which fires once with the empty array and wipes what was there.
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [section, setSection] = useState(SECTIONS[0])
  const [kind, setKind] = useState(KINDS[0])
  const [text, setText] = useState('')

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(notes)) } catch { /* storage may be blocked */ }
  }, [notes])

  const add = () => {
    if (!text.trim()) return
    setNotes((p) => [...p, { id: `N${Date.now().toString(36)}`, section, kind, text: text.trim() }])
    setText('')
  }

  return (
    <div className="grid min-h-0 grid-cols-[340px_minmax(0,1fr)] gap-2.5">
      <ViewPanel title="Capture what they say">
        <label className="block">
          <span className="cond text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Section</span>
          <select value={section} onChange={(e) => setSection(e.target.value)} className="mt-1 w-full rounded-sm2 border border-line px-2 py-1.5 text-[12px]">
            {SECTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="mt-2.5 block">
          <span className="cond text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Note</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="In their words where possible." className="mt-1 w-full rounded-sm2 border border-line px-2 py-1.5 text-[12px]" />
        </label>
        <div className="mt-2.5 flex gap-1.5">
          {KINDS.map((k) => (
            <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
              className={`cond rounded-sm2 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em] ${kind === k ? 'border-forest bg-forest text-white' : 'border-line bg-white text-inkSoft'}`}>
              {k}
            </button>
          ))}
        </div>
        <button type="button" onClick={add} disabled={!text.trim()} className="cond mt-3 w-full rounded-sm2 bg-forest py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-white disabled:opacity-40">
          Add note
        </button>
        <p className="mt-2 text-[11px] leading-snug text-inkSoft">Notes stay in this browser. Nothing is sent anywhere.</p>
      </ViewPanel>

      <ViewPanel title={`Captured — ${notes.length}`} right={notes.length ? <button type="button" onClick={() => setNotes([])} className="cond text-[10.5px] font-bold uppercase tracking-[0.07em] text-danger">Clear</button> : undefined} bodyClass="p-0">
        {notes.length === 0 ? (
          <p className="p-6 text-center text-[12px] text-inkSoft">Nothing captured yet. What the branch corrects here is the most useful output of the meeting.</p>
        ) : (
          <ul>
            {notes.map((n) => (
              <li key={n.id} className="flex items-start gap-3 border-b border-lineSoft px-3.5 py-2.5 last:border-0">
                <span className="cond shrink-0 rounded-sm2 border border-line px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-inkSoft">{n.kind}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] leading-snug text-ink">{n.text}</span>
                  <span className="mt-0.5 block text-[10.5px] text-inkFaint">{n.section}</span>
                </span>
                <button type="button" onClick={() => setNotes((p) => p.filter((x) => x.id !== n.id))} className="cond shrink-0 text-[10.5px] font-bold uppercase text-inkFaint hover:text-danger">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </ViewPanel>
    </div>
  )
}
