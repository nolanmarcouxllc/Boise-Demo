import { ChevronLeft, ChevronRight, Keyboard, Layers, Monitor, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { DISCLAIMER_SHORT } from '../data'
import { useApp } from '../state/AppContext'
import { sectionById, sections } from '../state/sections'
import { ConfirmDialog, Tooltip } from './ui'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className="flex h-9 w-9 shrink-0 flex-col justify-center gap-[3px] rounded-[3px] bg-forest-800 p-2">
        <span className="block h-[3px] w-full rounded-sm bg-timber-300" />
        <span className="block h-[3px] w-full rounded-sm bg-forest-300" />
        <span className="block h-[3px] w-2/3 rounded-sm bg-timber-100" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-[13px] font-bold uppercase leading-tight tracking-[0.13em] text-white">Westfield Branch</span>
          <span className="block text-[11px] uppercase leading-tight tracking-[0.16em] text-forest-300">Intelligence Command Center</span>
        </span>
      )}
    </div>
  )
}

export function DemoBadge({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <Tooltip label="Every record in this application is fictional. No production system is connected.">
      <span
        className={`chip cursor-help ${
          variant === 'dark' ? 'border-timber-400/40 bg-timber-500/15 text-timber-200' : 'border-timber-300 bg-timber-50 text-timber-600'
        }`}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-timber-400" />
        {DISCLAIMER_SHORT}
      </span>
    </Tooltip>
  )
}

export function ModeSwitch() {
  const { mode, setMode } = useApp()
  return (
    <div className="flex items-center rounded-[3px] border border-charcoal-600 bg-charcoal-800 p-0.5" role="group" aria-label="Display mode">
      {(
        [
          { id: 'presentation' as const, label: 'Presentation', icon: Monitor },
          { id: 'explore' as const, label: 'Explore', icon: Layers },
        ]
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          aria-pressed={mode === id}
          className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
            mode === id ? 'bg-forest-600 text-white' : 'text-charcoal-300 hover:text-white'
          }`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  )
}

export function Sidebar() {
  const { section, goToSection } = useApp()
  return (
    <nav aria-label="Command center sections" className="flex h-full w-64 shrink-0 flex-col bg-charcoal-900">
      <div className="border-b border-charcoal-700/70 px-4 py-4">
        <BrandMark />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {sections.map((s) => {
            const Icon = s.icon
            const active = section === s.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goToSection(s.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                    active ? 'bg-forest-700 text-white' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="truncate">{s.navLabel}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="border-t border-charcoal-700/70 px-4 py-3">
        <p className="text-[11px] leading-snug text-charcoal-400">
          Ten specialized agents. One branch view. Human control at every critical step.
        </p>
      </div>
    </nav>
  )
}

export function TopBar() {
  const { mode, section, resetDemo } = useApp()
  const [confirmReset, setConfirmReset] = useState(false)
  const def = sectionById.get(section)

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-700/60 bg-charcoal-900 px-5 py-3">
        <div className="flex min-w-0 items-center gap-4">
          {mode === 'presentation' && <BrandMark />}
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-300">
              {def?.act} · {def?.actTitle}
            </div>
            <div className="truncate text-sm font-semibold text-white">{def?.label}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DemoBadge variant="dark" />
          <Tooltip label="→ next · ← previous · F toggles presentation mode · Esc closes a detail panel">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-charcoal-400">
              <Keyboard className="h-3.5 w-3.5" aria-hidden /> Shortcuts
            </span>
          </Tooltip>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 rounded-[3px] border border-charcoal-600 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal-300 transition-colors hover:border-charcoal-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demonstration
          </button>
          <ModeSwitch />
        </div>
      </header>
      <ConfirmDialog
        open={confirmReset}
        title="Reset the demonstration?"
        body="This clears simulated approvals, dismissals and workflow edits made during this session. Discovery Board notes are kept — they are cleared separately from the Discovery Board."
        confirmLabel="Reset"
        onConfirm={() => {
          resetDemo()
          setConfirmReset(false)
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  )
}

export function PresentationControls() {
  const { next, prev, atFirst, atLast, section } = useApp()
  const def = sectionById.get(section)
  const idx = sections.findIndex((s) => s.id === section)
  return (
    <div className="sticky bottom-0 z-20 mt-8 flex items-end justify-between gap-4 border-t border-charcoal-200 bg-[#faf9f6]/95 px-6 py-4 backdrop-blur">
      <button type="button" onClick={prev} disabled={atFirst} className="btn btn-secondary">
        <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
      </button>
      <div className="hidden max-w-2xl flex-1 px-4 text-center md:block">
        <div className="label-caps mb-1">Presenter note</div>
        <p className="text-[13px] leading-snug text-charcoal-500">{def?.presenterNote}</p>
        <div className="mt-2 flex justify-center gap-1" aria-hidden>
          {sections.map((s, i) => (
            <span key={s.id} className={`h-1 w-6 rounded-full ${i <= idx ? 'bg-forest-600' : 'bg-charcoal-200'}`} />
          ))}
        </div>
      </div>
      <button type="button" onClick={next} disabled={atLast} className="btn btn-primary">
        Next <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
