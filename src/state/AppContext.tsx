import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MeetingNote } from '../data/types'
import { sectionIndex, sections } from './sections'
import { useLocalStorage } from './useLocalStorage'

export type Mode = 'presentation' | 'explore'

export type SelectionKind = 'order' | 'route' | 'exception' | 'recommendation' | 'agent' | 'customer'
export interface Selection {
  kind: SelectionKind
  id: string
}

export interface WorkflowOverride {
  stepId: string
  field: string
  value: string
}

interface AppState {
  mode: Mode
  setMode: (m: Mode) => void
  toggleMode: () => void
  section: string
  goToSection: (id: string) => void
  next: () => void
  prev: () => void
  atFirst: boolean
  atLast: boolean
  selection: Selection | null
  select: (kind: SelectionKind, id: string) => void
  clearSelection: () => void
  highlight: string[]
  setHighlight: (ids: string[]) => void
  notes: MeetingNote[]
  addNote: (note: Omit<MeetingNote, 'id' | 'createdAt'>) => void
  updateNote: (id: string, patch: Partial<MeetingNote>) => void
  removeNote: (id: string) => void
  clearNotes: () => void
  workflowOverrides: WorkflowOverride[]
  setWorkflowOverride: (o: WorkflowOverride) => void
  decisions: Record<string, 'approved' | 'dismissed' | 'discussion'>
  recordDecision: (recId: string, decision: 'approved' | 'dismissed' | 'discussion', reason?: string) => void
  decisionReasons: Record<string, string>
  resetDemo: () => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useLocalStorage<Mode>('bcc.mode', 'presentation')
  const [section, setSection] = useLocalStorage<string>('bcc.section', 'opening')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [highlight, setHighlight] = useState<string[]>([])
  const [notes, setNotes, clearStoredNotes] = useLocalStorage<MeetingNote[]>('bcc.notes', [])
  const [workflowOverrides, setWorkflowOverrides, clearOverrides] = useLocalStorage<WorkflowOverride[]>('bcc.workflow', [])
  const [decisions, setDecisions, clearDecisions] = useLocalStorage<Record<string, 'approved' | 'dismissed' | 'discussion'>>('bcc.decisions', {})
  const [decisionReasons, setDecisionReasons, clearReasons] = useLocalStorage<Record<string, string>>('bcc.decisionReasons', {})

  const idx = sectionIndex(section)
  const safeIdx = idx < 0 ? 0 : idx

  const goToSection = useCallback(
    (id: string) => {
      setSection(id)
      setSelection(null)
      setHighlight([])
      window.scrollTo({ top: 0, behavior: 'auto' })
    },
    [setSection],
  )

  const next = useCallback(() => {
    const n = sections[Math.min(safeIdx + 1, sections.length - 1)]
    if (n.id !== section) goToSection(n.id)
  }, [safeIdx, section, goToSection])

  const prev = useCallback(() => {
    const p = sections[Math.max(safeIdx - 1, 0)]
    if (p.id !== section) goToSection(p.id)
  }, [safeIdx, section, goToSection])

  const select = useCallback((kind: SelectionKind, id: string) => setSelection({ kind, id }), [])
  const clearSelection = useCallback(() => setSelection(null), [])

  const addNote = useCallback(
    (note: Omit<MeetingNote, 'id' | 'createdAt'>) => {
      setNotes((prev) => [
        ...prev,
        { ...note, id: `NOTE-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString() },
      ])
    },
    [setNotes],
  )

  const updateNote = useCallback(
    (id: string, patch: Partial<MeetingNote>) => setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n))),
    [setNotes],
  )

  const removeNote = useCallback((id: string) => setNotes((prev) => prev.filter((n) => n.id !== id)), [setNotes])

  const setWorkflowOverride = useCallback(
    (o: WorkflowOverride) =>
      setWorkflowOverrides((prev) => {
        const rest = prev.filter((p) => !(p.stepId === o.stepId && p.field === o.field))
        return o.value.trim() ? [...rest, o] : rest
      }),
    [setWorkflowOverrides],
  )

  const recordDecision = useCallback(
    (recId: string, decision: 'approved' | 'dismissed' | 'discussion', reason?: string) => {
      setDecisions((prev) => ({ ...prev, [recId]: decision }))
      if (reason !== undefined) setDecisionReasons((prev) => ({ ...prev, [recId]: reason }))
    },
    [setDecisions, setDecisionReasons],
  )

  const resetDemo = useCallback(() => {
    clearDecisions()
    clearOverrides()
    clearReasons()
    setSelection(null)
    setHighlight([])
  }, [clearDecisions, clearOverrides, clearReasons])

  const toggleMode = useCallback(() => setMode(mode === 'presentation' ? 'explore' : 'presentation'), [mode, setMode])

  // Keyboard controls. Text inputs keep their own keys.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)
      if (e.key === 'Escape') {
        setSelection(null)
        return
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, toggleMode])

  const value = useMemo<AppState>(
    () => ({
      mode,
      setMode,
      toggleMode,
      section,
      goToSection,
      next,
      prev,
      atFirst: safeIdx === 0,
      atLast: safeIdx === sections.length - 1,
      selection,
      select,
      clearSelection,
      highlight,
      setHighlight,
      notes,
      addNote,
      updateNote,
      removeNote,
      clearNotes: clearStoredNotes,
      workflowOverrides,
      setWorkflowOverride,
      decisions,
      recordDecision,
      decisionReasons,
      resetDemo,
    }),
    [
      mode,
      setMode,
      toggleMode,
      section,
      goToSection,
      next,
      prev,
      safeIdx,
      selection,
      select,
      clearSelection,
      highlight,
      notes,
      addNote,
      updateNote,
      removeNote,
      clearStoredNotes,
      workflowOverrides,
      setWorkflowOverride,
      decisions,
      recordDecision,
      decisionReasons,
      resetDemo,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}
