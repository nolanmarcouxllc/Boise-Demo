import type { MeetingNote } from '../data/types'
import type { WorkflowOverride } from '../state/AppContext'
import { workflowSteps } from '../data'

export const DISCOVERY_SECTIONS = [
  'What we understood correctly',
  'What is different in Westfield',
  'Current systems',
  'Manual steps',
  'Information gaps',
  'Routing constraints',
  'Customer-specific rules',
  'Private-fleet rules',
  'Third-party transportation rules',
  'Management visibility gaps',
  'Problems shared by other branches',
  'Questions for IT',
  'Questions for DMSi',
  'Questions for Trimble',
  'Potential pilot',
  'Required stakeholders',
  'Next meeting',
] as const

const KIND_LABEL: Record<MeetingNote['kind'], string> = {
  confirmed: 'Confirmed',
  assumption: 'Assumption',
  correction: 'Correction',
  question: 'Question',
}

export function notesToMarkdown(notes: MeetingNote[], overrides: WorkflowOverride[]): string {
  const lines: string[] = []
  lines.push('# Westfield Branch — Discovery Notes')
  lines.push('')
  lines.push('_Captured during an interactive concept walkthrough. All product data shown in that session was simulated._')
  lines.push('')
  lines.push(`Notes captured: ${notes.length}. Workflow corrections captured: ${overrides.length}.`)
  lines.push('')

  DISCOVERY_SECTIONS.forEach((section) => {
    const inSection = notes.filter((n) => n.section === section)
    if (!inSection.length) return
    lines.push(`## ${section}`)
    lines.push('')
    inSection.forEach((n) => {
      lines.push(`- **[${KIND_LABEL[n.kind]}]** ${n.text}`)
      lines.push(`  - Owner: ${n.owner || 'Unassigned'} · Priority: ${n.priority}`)
    })
    lines.push('')
  })

  if (overrides.length) {
    lines.push('## Workflow corrections recorded on the order-flow screen')
    lines.push('')
    const byStep = new Map<string, WorkflowOverride[]>()
    overrides.forEach((o) => byStep.set(o.stepId, [...(byStep.get(o.stepId) ?? []), o]))
    byStep.forEach((items, stepId) => {
      const step = workflowSteps.find((s) => s.id === stepId)
      lines.push(`### Step ${step?.index ?? '?'} — ${step?.name ?? stepId}`)
      items.forEach((o) => lines.push(`- ${o.field}: ${o.value}`))
      lines.push('')
    })
  }

  lines.push('## Agreed next step')
  lines.push('')
  lines.push('A technical discovery session to validate the workflow, integration options, security requirements, available data and a measurable business outcome.')
  lines.push('')
  return lines.join('\n')
}

export function notesToJson(notes: MeetingNote[], overrides: WorkflowOverride[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      source: 'Westfield Branch Intelligence Command Center — demonstration environment',
      disclaimer: 'All product data in the session was simulated. These notes record what branch participants said.',
      noteCount: notes.length,
      notes,
      workflowCorrections: overrides,
    },
    null,
    2,
  )
}

export type SaveOutcome = 'saved' | 'declined' | 'unavailable'

/**
 * Minimal shape of the hosted-page save bridge. When this application is served
 * inside a sandboxed viewer, an ordinary download link is inert and the host
 * supplies this instead. Running locally there is no bridge and the blob path is
 * used, so behaviour on the presentation laptop is unchanged.
 */
interface SaveBridge {
  save(request: { filename: string; data: string }): Promise<unknown>
}
interface HostRuntime {
  use?(name: string): Promise<unknown>
}

async function saveBridge(): Promise<SaveBridge | null> {
  try {
    const host = (globalThis as { claude?: HostRuntime }).claude
    if (typeof host?.use !== 'function') return null
    const ns = await host.use('downloads')
    return ns && typeof (ns as SaveBridge).save === 'function' ? (ns as SaveBridge) : null
  } catch {
    return null
  }
}

export async function download(filename: string, contents: string, type: string): Promise<SaveOutcome> {
  const bridge = await saveBridge()
  if (bridge) {
    try {
      await bridge.save({ filename, data: contents })
      return 'saved'
    } catch (err) {
      return (err as { code?: string })?.code === 'declined' ? 'declined' : 'unavailable'
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

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard access can be blocked; fall back to a selectable textarea.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}
