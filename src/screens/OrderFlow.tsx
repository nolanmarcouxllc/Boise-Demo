import { Check, Pencil, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { BulletList, Chip, Panel, SectionHeading } from '../components/ui'
import { agentById, workflowSteps } from '../data'
import type { WorkflowStep } from '../data/types'
import { useApp } from '../state/AppContext'

const EDITABLE: Array<{ field: keyof WorkflowStep; label: string }> = [
  { field: 'responsiblePerson', label: 'Responsible person' },
  { field: 'responsibleSystem', label: 'Responsible system' },
  { field: 'typicalDelay', label: 'Typical delay' },
  { field: 'manualWork', label: 'Manual work' },
  { field: 'failureRisk', label: 'Failure risk' },
  { field: 'humanApproval', label: 'Human approval point' },
]

export function OrderFlow() {
  const { select, workflowOverrides, setWorkflowOverride, addNote } = useApp()
  const [activeId, setActiveId] = useState(workflowSteps[5].id)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const step = workflowSteps.find((s) => s.id === activeId) ?? workflowSteps[0]
  const overrideFor = (stepId: string, field: string) => workflowOverrides.find((o) => o.stepId === stepId && o.field === field)?.value
  const valueOf = (s: WorkflowStep, field: keyof WorkflowStep) => overrideFor(s.id, field) ?? (s[field] as string)
  const stepEdited = (s: WorkflowStep) => workflowOverrides.some((o) => o.stepId === s.id)

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 2 · Where information and decisions move"
        title="Order flow"
        blurb="This is a starting assumption about how an order travels through the branch, not a claim about how Westfield actually works. Correct any step — the change is stored on this machine and appears in the meeting summary."
      />

      {/* ---------------------------------------------------- timeline */}
      <Panel title="Order lifecycle" subtitle="Select any step to inspect it" bodyClassName="p-4">
        <ol className="flex gap-2 overflow-x-auto pb-2">
          {workflowSteps.map((s) => {
            const active = s.id === activeId
            return (
              <li key={s.id} className="min-w-[140px] flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(s.id)
                    setEditing(false)
                  }}
                  aria-current={active ? 'step' : undefined}
                  className={`h-full w-full rounded-[3px] border px-3 py-2.5 text-left transition-colors ${
                    active ? 'border-forest-700 bg-forest-700 text-white' : 'border-charcoal-200 bg-white hover:border-charcoal-400'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${active ? 'text-forest-200' : 'text-charcoal-400'}`}>
                    {String(s.index).padStart(2, '0')}
                  </span>
                  <span className={`mt-1 block text-[13px] font-semibold leading-snug ${active ? 'text-white' : 'text-charcoal-800'}`}>
                    {s.name}
                  </span>
                  {stepEdited(s) && (
                    <span className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${active ? 'text-timber-200' : 'text-timber-600'}`}>
                      <Pencil className="h-2.5 w-2.5" aria-hidden /> Edited
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel
          title={`Step ${step.index} — ${step.name}`}
          subtitle="Responsibility, inputs, failure risk and where an agent could help"
          actions={
            <div className="flex gap-2">
              {editing && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    EDITABLE.forEach((e) => setWorkflowOverride({ stepId: step.id, field: e.field, value: '' }))
                    setEditing(false)
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Clear edits
                </button>
              )}
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing((v) => !v)}>
                <Pencil className="h-3.5 w-3.5" aria-hidden /> {editing ? 'Done editing' : 'Edit workflow'}
              </button>
            </div>
          }
        >
          {editing ? (
            <div className="space-y-3">
              <p className="text-[13px] text-charcoal-500">
                Record what is actually true at Westfield. Edits stay in this browser and are never sent anywhere.
              </p>
              {EDITABLE.map((e) => (
                <label key={e.field as string} className="block">
                  <span className="label-caps mb-1 block">{e.label}</span>
                  <input
                    type="text"
                    defaultValue={valueOf(step, e.field)}
                    onBlur={(ev) => setWorkflowOverride({ stepId: step.id, field: e.field as string, value: ev.target.value })}
                    className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                  />
                </label>
              ))}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    addNote({
                      section: 'What is different in Westfield',
                      text: `Step ${step.index} (${step.name}): correction captured during the walkthrough.`,
                      kind: 'correction',
                      owner: 'Operations',
                      priority: 'High',
                    })
                    setSaved(true)
                    window.setTimeout(() => setSaved(false), 2200)
                  }}
                >
                  Also add to the Discovery Board
                </button>
                {saved && (
                  <span className="flex items-center gap-1 text-[13px] text-forest-700">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Added
                  </span>
                )}
              </div>
            </div>
          ) : (
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Item label="Responsible person" value={valueOf(step, 'responsiblePerson')} edited={!!overrideFor(step.id, 'responsiblePerson')} />
              <Item label="Responsible system" value={valueOf(step, 'responsibleSystem')} edited={!!overrideFor(step.id, 'responsibleSystem')} />
              <Item label="Typical delay" value={valueOf(step, 'typicalDelay')} edited={!!overrideFor(step.id, 'typicalDelay')} />
              <Item label="Human approval point" value={valueOf(step, 'humanApproval')} edited={!!overrideFor(step.id, 'humanApproval')} />
              <Item label="Manual work" value={valueOf(step, 'manualWork')} edited={!!overrideFor(step.id, 'manualWork')} full />
              <Item label="Failure risk" value={valueOf(step, 'failureRisk')} edited={!!overrideFor(step.id, 'failureRisk')} full tone="risk" />
              <div className="sm:col-span-2">
                <dt className="label-caps mb-1.5">Required inputs</dt>
                <dd>
                  <BulletList items={step.requiredInputs} />
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="label-caps mb-1">Output produced</dt>
                <dd className="text-sm leading-relaxed text-charcoal-700">{step.outputProduced}</dd>
              </div>
            </dl>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Potential agent support" subtitle="What the command center could add at this step">
            <p className="pres-body text-sm leading-relaxed text-charcoal-700">{step.agentSupport}</p>
            <div className="mt-3 space-y-2">
              {step.agentIds.map((id) => {
                const a = agentById.get(id)
                if (!a) return null
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => select('agent', id)}
                    className="flex w-full items-center gap-2.5 rounded-[3px] border border-charcoal-200 px-3 py-2 text-left transition-colors hover:border-forest-600"
                  >
                    <span
                      aria-hidden
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] font-mono text-[11px] font-bold text-white"
                      style={{ backgroundColor: a.accent }}
                    >
                      {a.number}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{a.name}</span>
                      <span className="block truncate text-[11px] text-charcoal-500">Decision owner: {a.decisionOwner}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel title="What we are asking" subtitle="The point of this screen">
            <ul className="space-y-2.5 text-sm leading-relaxed text-charcoal-700">
              <li className="flex gap-2">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                Is this the order these steps actually happen in at Westfield?
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                Which step costs the most time that nobody sees?
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                Where does information get re-entered because it did not carry across?
              </li>
              <li className="flex gap-2">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500" />
                Which approvals must stay with a person no matter what?
              </li>
            </ul>
            {workflowOverrides.length > 0 && (
              <p className="mt-4 border-t border-charcoal-200 pt-3 text-[13px] text-charcoal-600">
                <Chip tone="timber">{workflowOverrides.length} edits captured</Chip> They appear in the Discovery Board export.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Item({
  label,
  value,
  edited,
  full = false,
  tone = 'neutral',
}: {
  label: string
  value: string
  edited: boolean
  full?: boolean
  tone?: 'neutral' | 'risk'
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="label-caps mb-1 flex items-center gap-1.5">
        {label}
        {edited && <Chip tone="timber">Edited</Chip>}
      </dt>
      <dd className={`text-sm leading-relaxed ${tone === 'risk' ? 'text-alert-warn' : 'text-charcoal-700'}`}>{value}</dd>
    </div>
  )
}
