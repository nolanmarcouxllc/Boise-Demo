import { Check, ClipboardCopy, Download, FileJson, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Chip, ConfirmDialog, EmptyState, Panel, SectionHeading } from '../components/ui'
import type { MeetingNote } from '../data/types'
import { copyToClipboard, DISCOVERY_SECTIONS, download, notesToJson, notesToMarkdown } from '../lib/exportNotes'
import { useApp } from '../state/AppContext'

const KINDS: Array<{ id: MeetingNote['kind']; label: string; tone: 'green' | 'amber' | 'blue' | 'timber' }> = [
  { id: 'confirmed', label: 'Confirmed', tone: 'green' },
  { id: 'assumption', label: 'Assumption', tone: 'amber' },
  { id: 'correction', label: 'Correction', tone: 'timber' },
  { id: 'question', label: 'Question', tone: 'blue' },
]

const PRIORITIES: Array<MeetingNote['priority']> = ['High', 'Medium', 'Low']

const PROMPTS: Record<string, string> = {
  'What we understood correctly': 'Which parts of the simulated workflow matched how Westfield actually operates?',
  'What is different in Westfield': 'Where did the model get it wrong — sequence, ownership, timing, terminology?',
  'Current systems': 'Which systems hold each piece of this workflow today, and who administers them?',
  'Manual steps': 'What is typed twice, printed, or held in a spreadsheet?',
  'Information gaps': 'What does routing not receive that it needs?',
  'Routing constraints': 'What constraints must always be respected — bridges, lengths, equipment, permits?',
  'Customer-specific rules': 'Which customers have rules that a system must never break?',
  'Private-fleet rules': 'When must freight stay on the private fleet regardless of cost?',
  'Third-party transportation rules': 'How are carriers approved, tendered and measured?',
  'Management visibility gaps': 'What does the branch manager want to know that is hard to get today?',
  'Problems shared by other branches': 'Is this pattern the same at other BMD locations?',
  'Questions for IT': 'Security, deployment boundaries, data access, environments.',
  'Questions for DMSi': 'API availability, licensing, event access, supported integration patterns.',
  'Questions for Trimble': 'PC*MILER and Trimble Maps licensing, API scope, routing parameters.',
  'Potential pilot': 'What is the narrowest thing worth measuring first?',
  'Required stakeholders': 'Who must be in the technical discovery session?',
  'Next meeting': 'Date, participants, and what each person brings.',
}

export function DiscoveryBoard() {
  const { notes, addNote, updateNote, removeNote, clearNotes, workflowOverrides } = useApp()
  const [section, setSection] = useState<string>(DISCOVERY_SECTIONS[0])
  const [text, setText] = useState('')
  const [kind, setKind] = useState<MeetingNote['kind']>('confirmed')
  const [owner, setOwner] = useState('')
  const [priority, setPriority] = useState<MeetingNote['priority']>('Medium')
  const [copied, setCopied] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  const save = async (filename: string, contents: string, type: string) => {
    const outcome = await download(filename, contents, type)
    setStatus(
      outcome === 'saved'
        ? ''
        : outcome === 'declined'
          ? 'Save cancelled. Nothing was written.'
          : 'This viewer will not let the page save a file. Use the copy button, or run the demonstration locally to export.',
    )
  }

  const markdown = useMemo(() => notesToMarkdown(notes, workflowOverrides), [notes, workflowOverrides])
  const grouped = useMemo(() => {
    const map = new Map<string, MeetingNote[]>()
    notes.forEach((n) => map.set(n.section, [...(map.get(n.section) ?? []), n]))
    return map
  }, [notes])

  const submit = () => {
    if (!text.trim()) return
    addNote({ section, text: text.trim(), kind, owner: owner.trim(), priority })
    setText('')
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 6 · Boise corrects the model"
        title="Discovery board"
        blurb="This is the part of the meeting that matters. Capture what we got right, what is different at Westfield, and what has to be asked of IT and the application owners. Notes stay in this browser and are never sent anywhere."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ------------------------------------------------------- capture */}
        <div className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
          <Panel title="Add a note" subtitle="Two clicks and a sentence">
            <div className="space-y-3">
              <label className="block">
                <span className="label-caps mb-1 block">Section</span>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                >
                  {DISCOVERY_SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[12px] leading-snug text-charcoal-500">{PROMPTS[section]}</span>
              </label>

              <label className="block">
                <span className="label-caps mb-1 block">Note</span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
                  }}
                  rows={4}
                  placeholder="What was said, in their words where possible."
                  className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                />
              </label>

              <div>
                <span className="label-caps mb-1 block">Type</span>
                <div className="flex flex-wrap gap-1.5">
                  {KINDS.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setKind(k.id)}
                      aria-pressed={kind === k.id}
                      className={`rounded-[3px] border px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.06em] ${
                        kind === k.id ? 'border-forest-700 bg-forest-700 text-white' : 'border-charcoal-300 bg-white text-charcoal-600'
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label-caps mb-1 block">Owner</span>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. Branch IT"
                    className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="label-caps mb-1 block">Priority</span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MeetingNote['priority'])}
                    className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button type="button" className="btn btn-primary w-full" onClick={submit} disabled={!text.trim()}>
                <Plus className="h-4 w-4" aria-hidden /> Add note
              </button>
              <p className="text-[11px] text-charcoal-400">Tip: ⌘/Ctrl + Enter adds the note without leaving the keyboard.</p>
            </div>
          </Panel>

          <Panel title="Export" subtitle={`${notes.length} note(s) · ${workflowOverrides.length} workflow correction(s)`}>
            <div className="space-y-2">
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => save('westfield-discovery-notes.json', notesToJson(notes, workflowOverrides), 'application/json')}
                disabled={!notes.length && !workflowOverrides.length}
              >
                <FileJson className="h-4 w-4" aria-hidden /> Export notes as JSON
              </button>
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => save('westfield-meeting-summary.md', markdown, 'text/markdown')}
                disabled={!notes.length && !workflowOverrides.length}
              >
                <Download className="h-4 w-4" aria-hidden /> Export meeting summary as Markdown
              </button>
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={async () => {
                  const ok = await copyToClipboard(markdown)
                  setCopied(ok)
                  setStatus(ok ? '' : 'This browser blocked the clipboard. Use one of the export buttons instead.')
                  window.setTimeout(() => setCopied(false), 2400)
                }}
                disabled={!notes.length && !workflowOverrides.length}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
                {copied ? 'Copied to clipboard' : 'Copy summary to clipboard'}
              </button>
              <button type="button" className="btn btn-secondary w-full" onClick={() => setConfirmClear(true)} disabled={!notes.length}>
                <Trash2 className="h-4 w-4" aria-hidden /> Clear all notes
              </button>
            </div>
            {status && (
              <p role="status" className="mt-3 rounded-[3px] border border-alert-warn/40 bg-alert-warn/5 px-3 py-2 text-[12px] leading-relaxed text-alert-warn">
                {status}
              </p>
            )}
            <p className="mt-3 text-[12px] leading-relaxed text-charcoal-500">
              Notes are stored in this browser only. Nothing is sent to an external service.
            </p>
          </Panel>
        </div>

        {/* ------------------------------------------------------- board */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <Panel title="Captured notes">
              <EmptyState message="No notes yet. Everything captured here appears in the meeting summary and the scoping summary on the next screen." />
            </Panel>
          ) : (
            DISCOVERY_SECTIONS.filter((s) => grouped.has(s)).map((s) => (
              <Panel key={s} title={s} subtitle={`${grouped.get(s)?.length} note(s)`} bodyClassName="p-0">
                <ul>
                  {grouped.get(s)?.map((n) => (
                    <li key={n.id} className="data-row px-4 py-3">
                      {editingId === n.id ? (
                        <div className="space-y-2">
                          <textarea
                            defaultValue={n.text}
                            rows={3}
                            onBlur={(e) => updateNote(n.id, { text: e.target.value })}
                            className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                          />
                          <div className="flex flex-wrap gap-2">
                            <input
                              type="text"
                              defaultValue={n.owner}
                              placeholder="Owner"
                              onBlur={(e) => updateNote(n.id, { owner: e.target.value })}
                              className="rounded-[3px] border border-charcoal-300 px-2 py-1 text-[13px]"
                            />
                            <select
                              defaultValue={n.priority}
                              onChange={(e) => updateNote(n.id, { priority: e.target.value as MeetingNote['priority'] })}
                              className="rounded-[3px] border border-charcoal-300 px-2 py-1 text-[13px]"
                            >
                              {PRIORITIES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditingId(null)}>
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="min-w-0 flex-1 text-sm leading-relaxed text-charcoal-800">{n.text}</p>
                            <div className="flex shrink-0 gap-1.5">
                              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(n.id)}>
                                Edit
                              </button>
                              <button type="button" className="btn btn-ghost btn-sm text-alert-critical" onClick={() => removeNote(n.id)}>
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {KINDS.map((k) => (
                              <button
                                key={k.id}
                                type="button"
                                onClick={() => updateNote(n.id, { kind: k.id })}
                                aria-pressed={n.kind === k.id}
                                className={`rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${
                                  n.kind === k.id
                                    ? 'border-forest-700 bg-forest-700 text-white'
                                    : 'border-charcoal-200 bg-white text-charcoal-400 hover:border-charcoal-400'
                                }`}
                              >
                                {k.label}
                              </button>
                            ))}
                            <span className="ml-2 text-[12px] text-charcoal-500">Owner: {n.owner || 'Unassigned'}</span>
                            <Chip tone={n.priority === 'High' ? 'red' : n.priority === 'Medium' ? 'amber' : 'neutral'}>{n.priority}</Chip>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))
          )}

          {workflowOverrides.length > 0 && (
            <Panel title="Workflow corrections" subtitle="Captured on the order-flow screen">
              <ul className="space-y-1.5">
                {workflowOverrides.map((o) => (
                  <li key={`${o.stepId}-${o.field}`} className="text-[13px] text-charcoal-700">
                    <span className="font-mono text-[12px] text-charcoal-400">{o.stepId}</span> · <span className="font-semibold">{o.field}</span>:{' '}
                    {o.value}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all discovery notes?"
        body="This permanently removes every note captured in this browser. Export them first if you need them."
        confirmLabel="Clear notes"
        onConfirm={() => {
          clearNotes()
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
