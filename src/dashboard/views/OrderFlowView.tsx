import { useState } from 'react'
import { workflowSteps } from '../../data'
import { ViewPanel } from './shared'

export function OrderFlowView() {
  const [active, setActive] = useState(workflowSteps[5].id)
  const step = workflowSteps.find((s) => s.id === active)!

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="panel shrink-0 p-2.5">
        <ol className="flex gap-1.5 overflow-x-auto">
          {workflowSteps.map((s) => (
            <li key={s.id} className="min-w-[118px] flex-1">
              <button
                type="button"
                onClick={() => setActive(s.id)}
                aria-current={s.id === active ? 'step' : undefined}
                className={`h-full w-full rounded-sm2 border px-2.5 py-2 text-left ${
                  s.id === active ? 'border-forest bg-forest text-white' : 'border-line bg-white hover:border-inkSoft'
                }`}
              >
                <span className={`num block text-[10px] ${s.id === active ? 'text-white/70' : 'text-inkFaint'}`}>{String(s.index).padStart(2, '0')}</span>
                <span className={`cond block text-[11.5px] font-bold leading-tight ${s.id === active ? 'text-white' : 'text-ink'}`}>{s.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2.5">
        <ViewPanel title={`Step ${step.index} — ${step.name}`}>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            {[
              ['Responsible person', step.responsiblePerson],
              ['Responsible system', step.responsibleSystem],
              ['Typical delay', step.typicalDelay],
              ['Human approval', step.humanApproval],
              ['Manual work', step.manualWork],
              ['Failure risk', step.failureRisk],
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
                  <span key={i} className="rounded-sm2 border border-line bg-shell px-2 py-0.5 text-[11px] text-inkSoft">{i}</span>
                ))}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Output produced</dt>
              <dd className="mt-0.5 text-[12px] leading-snug text-ink">{step.outputProduced}</dd>
            </div>
          </dl>
        </ViewPanel>

        <ViewPanel title="Where an agent could help">
          <p className="text-[12.5px] leading-snug text-ink">{step.agentSupport}</p>
          <p className="mt-3 rounded-sm2 border-l-[3px] border-accent bg-shell px-3 py-2 text-[11.5px] leading-snug text-inkSoft">
            The system catches the exception. The operator makes the decision.
          </p>
        </ViewPanel>
      </div>
    </div>
  )
}
