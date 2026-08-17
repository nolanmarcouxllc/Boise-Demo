import { useState } from 'react'
import { workflowSteps } from '../../data'
import { capabilityByKey } from '../capabilities'
import type { Detail } from '../Drawer'
import { ViewPanel } from './shared'
import { StatusChip } from './StatusChip'

/**
 * Which capabilities act at each step of the order lifecycle. Kept explicit
 * rather than derived, because the mapping is a claim the branch should be able
 * to correct step by step.
 */
const STEP_CAPABILITIES: Record<string, string[]> = {
  'WF-01': ['readiness', 'memory'],
  'WF-02': ['readiness'],
  'WF-03': ['readiness', 'change'],
  'WF-04': ['readiness', 'memory'],
  'WF-05': ['readiness', 'consolidation'],
  'WF-06': ['consolidation', 'capacity'],
  'WF-07': ['yard', 'change'],
  'WF-08': ['yard', 'risk'],
  'WF-09': ['risk', 'change'],
  'WF-10': ['memory', 'learning'],
  'WF-11': ['learning', 'cost'],
  'WF-12': ['learning', 'brief'],
}

/** The steps where information has to cross from one owner to another. */
const HANDOFFS = new Set(['WF-05', 'WF-06', 'WF-07', 'WF-11'])

export function OrderFlowView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const [active, setActive] = useState(workflowSteps[5].id)
  const step = workflowSteps.find((s) => s.id === active)!
  const caps = (STEP_CAPABILITIES[step.id] ?? []).map((k) => capabilityByKey.get(k)).filter(Boolean)

  return (
    <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-2.5">
      <div className="panel shrink-0 p-2.5">
        <ol className="flex gap-1.5">
          {workflowSteps.map((s) => {
            const on = s.id === active
            return (
              <li key={s.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setActive(s.id)}
                  aria-current={on ? 'step' : undefined}
                  className={`relative h-full w-full rounded-sm2 border px-2 py-2 text-left ${
                    on ? 'border-forest bg-forest text-white' : 'border-line bg-white hover:border-inkSoft'
                  }`}
                >
                  {HANDOFFS.has(s.id) && (
                    <span
                      aria-hidden
                      title="Information changes hands here"
                      className="absolute right-1.5 top-1.5 h-[6px] w-[6px] rounded-full"
                      style={{ backgroundColor: on ? '#8FD6A4' : '#D98A00' }}
                    />
                  )}
                  <span className={`num block text-[10px] ${on ? 'text-white/70' : 'text-inkFaint'}`}>
                    {String(s.index).padStart(2, '0')}
                  </span>
                  <span className={`cond block text-[11px] font-bold leading-tight ${on ? 'text-white' : 'text-ink'}`}>{s.name}</span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-inkFaint">
          <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-amber" />
          Marked steps are where information changes hands — the points a decision can be lost between systems.
        </p>
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,0.95fr)] gap-2.5" style={{ height: 386 }}>
        <ViewPanel
          title={`Step ${step.index} — ${step.name}`}
          right={HANDOFFS.has(step.id) ? <span className="meta text-amber">Handoff point</span> : undefined}
        >
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            {[
              ['Responsible person', step.responsiblePerson],
              ['Responsible system', step.responsibleSystem],
              ['Typical delay', step.typicalDelay],
              ['Human approval', step.humanApproval],
            ].map(([l, v]) => (
              <div key={l}>
                <dt className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">{l}</dt>
                <dd className="mt-0.5 text-[12px] leading-snug text-ink">{v}</dd>
              </div>
            ))}
            <div className="col-span-2">
              <dt className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Required inputs</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {step.requiredInputs.map((i) => (
                  <span key={i} className="rounded-sm2 border border-line bg-shell px-2 py-0.5 text-[11px] text-inkSoft">
                    {i}
                  </span>
                ))}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Output produced</dt>
              <dd className="mt-0.5 text-[12px] leading-snug text-ink">{step.outputProduced}</dd>
            </div>
            <div className="col-span-2">
              <dt className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Manual work today</dt>
              <dd className="mt-0.5 text-[12px] leading-snug text-ink">{step.manualWork}</dd>
            </div>
          </dl>
        </ViewPanel>

        <ViewPanel title="Where this step can fail">
          <p className="rounded-sm2 border-l-[3px] border-danger bg-shell px-3 py-2 text-[12px] leading-snug text-ink">
            {step.failureRisk}
          </p>

          <div className="mt-3">
            <div className="cond mb-1 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">What the command center adds here</div>
            <p className="text-[12px] leading-snug text-ink">{step.agentSupport}</p>
          </div>

          <div className="mt-3">
            <div className="cond mb-1 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">What stays where it is</div>
            <p className="text-[12px] leading-snug text-inkSoft">
              {step.responsibleSystem} remains the system of record for this step, and {step.responsiblePerson.toLowerCase()} remains
              accountable for it.
            </p>
          </div>

          <p className="mt-3 rounded-sm2 border-l-[3px] border-accent bg-shell px-3 py-2 text-[11.5px] leading-snug text-inkSoft">
            The system catches the exception. The operator makes the decision.
          </p>
        </ViewPanel>

        <ViewPanel title="Capabilities acting here" right={<span className="meta">{caps.length}</span>}>
          {caps.length === 0 ? (
            <p className="text-[12px] text-inkSoft">No capability acts at this step in the current model.</p>
          ) : (
            <ul className="space-y-2">
              {caps.map((c) => (
                <li key={c!.key}>
                  <button
                    type="button"
                    onClick={() => onOpen({ kind: 'capability', id: c!.key })}
                    className="w-full rounded-sm2 border border-line px-2.5 py-2 text-left hover:border-accent hover:bg-shell"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="cond min-w-0 flex-1 text-[12px] font-bold leading-tight text-ink">{c!.short}</span>
                      <StatusChip status={c!.infoStatus} />
                    </span>
                    <span className="mt-1 block text-[11px] italic leading-snug text-inkSoft">{c!.question}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-[11px] leading-snug text-inkFaint">
            This mapping is a starting assumption. If a capability belongs at a different step in how Westfield actually runs, correct it on the
            Discovery Board and the map changes.
          </p>
        </ViewPanel>
      </div>

      <ViewPanel
        title="The whole lifecycle on one screen"
        right={<span className="meta">{workflowSteps.length} steps · {HANDOFFS.size} handoffs</span>}
        bodyClass="p-0"
      >
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-line">
              {['Step', 'Responsible person', 'System of record', 'Typical delay', 'Human approval', 'Where it can fail'].map((h) => (
                <th key={h} className="cond px-3 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workflowSteps.map((s) => {
              const on = s.id === active
              return (
                <tr
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`cursor-pointer border-b border-lineSoft last:border-0 ${on ? 'bg-[#F1F6F2]' : 'hover:bg-shell'}`}
                >
                  <td className="px-3 py-1.5">
                    <span className="flex items-center gap-1.5">
                      {HANDOFFS.has(s.id) && <span aria-hidden title="Handoff" className="h-[6px] w-[6px] shrink-0 rounded-full bg-amber" />}
                      <span className={`cond text-[12px] ${on ? 'font-bold text-forest' : 'font-semibold text-ink'}`}>
                        {String(s.index).padStart(2, '0')} {s.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-[11.5px] text-inkSoft">{s.responsiblePerson}</td>
                  <td className="px-3 py-1.5 text-[11.5px] text-inkSoft">{s.responsibleSystem}</td>
                  <td className="num px-3 py-1.5 text-[11.5px] text-inkSoft">{s.typicalDelay}</td>
                  <td className="px-3 py-1.5 text-[11.5px] text-inkSoft">{s.humanApproval}</td>
                  <td className="px-3 py-1.5 text-[11.5px] text-inkSoft">{s.failureRisk}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ViewPanel>
    </div>
  )
}
