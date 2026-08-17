import { ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { BulletList, Chip, ConfidenceMeter, Panel, PermissionBadge, SectionHeading } from '../components/ui'
import { agentGroups, agents } from '../data'
import type { Agent } from '../data/types'
import { useApp } from '../state/AppContext'

export function AgentNetwork() {
  const { select } = useApp()
  const [focused, setFocused] = useState<Agent | null>(null)

  const related = focused ? new Set([...focused.inputs, ...focused.outputs]) : null
  const isDimmed = (a: Agent) => {
    if (!focused) return false
    if (a.id === focused.id) return false
    return !related?.has(a.name) && !related?.has(a.shortName)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Ten specialized services · one shared command center"
        title="Agent network"
        blurb="Each agent is an operational service with a defined job, a defined data source and a defined human owner. They share context with one another. They do not share permissions."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="rounded-[3px] border border-forest-700/25 bg-forest-800 px-5 py-3 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-300">Shared operating context</div>
                <p className="text-sm text-forest-50">Orders · routes · locations · equipment · exceptions · actual outcomes</p>
              </div>
              <Chip tone="timber">Agents share context, but permissions remain separate.</Chip>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {agentGroups.map((group, gi) => {
              const groupAgents = agents.filter((a) => a.group === group.key)
              return (
                <div key={group.key} className="flex flex-col">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-charcoal-400">{String(gi + 1).padStart(2, '0')}</span>
                    <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-charcoal-700">{group.label}</h2>
                  </div>
                  <p className="mb-3 text-[12px] leading-snug text-charcoal-500">{group.blurb}</p>
                  <ul className="flex-1 space-y-2">
                    {groupAgents.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setFocused(a)}
                          onFocus={() => setFocused(a)}
                          onMouseLeave={() => setFocused(null)}
                          onBlur={() => setFocused(null)}
                          onClick={() => select('agent', a.id)}
                          className={`w-full rounded-[3px] border bg-white p-3 text-left transition-all duration-200 ${
                            focused?.id === a.id ? 'border-forest-600 shadow-panel' : 'border-charcoal-200 hover:border-charcoal-400'
                          } ${isDimmed(a) ? 'opacity-35' : 'opacity-100'}`}
                        >
                          <span className="flex items-start gap-2">
                            <span
                              aria-hidden
                              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] font-mono text-[11px] font-bold text-white"
                              style={{ backgroundColor: a.accent }}
                            >
                              {a.number}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold leading-snug text-charcoal-900">{a.name}</span>
                              <span className="mt-0.5 block text-[11px] leading-snug text-charcoal-500">{a.role}</span>
                            </span>
                          </span>
                          <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                            <PermissionBadge level={a.permission} />
                            {a.recommendationsWaiting > 0 && <Chip tone="amber">{a.recommendationsWaiting} awaiting review</Chip>}
                          </span>
                          <span className="mt-2 flex items-center justify-between text-[11px] text-charcoal-400">
                            <span>
                              {a.itemsMonitored} monitored · {a.findingsToday} findings
                            </span>
                            <span className="font-mono">{a.lastActivity.slice(11)}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-[3px] border border-charcoal-200 bg-white px-4 py-3">
            <span className="label-caps">Flow</span>
            <span className="flex items-center gap-2 text-[13px] text-charcoal-600">
              Input control <ArrowRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden /> Planning{' '}
              <ArrowRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden /> Execution &amp; learning{' '}
              <ArrowRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden /> Management
            </span>
            <span className="ml-auto text-[12px] text-charcoal-500">Actual outcomes return to planning — that is the loop that matters.</span>
          </div>
        </div>

        {/* ------------------------------------------------- inspector rail */}
        <Panel
          title={focused ? focused.name : 'Agent inspector'}
          subtitle={focused ? focused.group : 'Hover or focus an agent to inspect it'}
          className="h-fit xl:sticky xl:top-20"
        >
          {focused ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-charcoal-700">{focused.purpose}</p>

              <div>
                <div className="label-caps mb-1">Confidence</div>
                <ConfidenceMeter confidence={focused.confidence} pct={focused.confidencePct} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <div className="label-caps mb-1.5">Inputs</div>
                  <ul className="space-y-1">
                    {focused.inputs.map((i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[13px] text-charcoal-600">
                        <ArrowRight className="h-3 w-3 shrink-0 text-forest-600" aria-hidden /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="label-caps mb-1.5">Outputs</div>
                  <ul className="space-y-1">
                    {focused.outputs.map((o) => (
                      <li key={o} className="flex items-center gap-1.5 text-[13px] text-charcoal-600">
                        <ArrowRight className="h-3 w-3 shrink-0 text-timber-500" aria-hidden /> {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-[3px] border border-charcoal-200 bg-charcoal-50 px-3 py-2.5">
                <div className="label-caps mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-forest-700" aria-hidden /> Human who owns the decision
                </div>
                <p className="text-sm font-semibold text-charcoal-800">{focused.decisionOwner}</p>
                <p className="mt-1 text-[12px] leading-snug text-charcoal-500">{focused.humanApproval}</p>
              </div>

              <div>
                <div className="label-caps mb-1.5 flex items-center gap-1.5 text-alert-critical">
                  <Lock className="h-3.5 w-3.5" aria-hidden /> Not allowed to do automatically
                </div>
                <BulletList items={focused.notAllowedTo} tone="risk" />
              </div>

              <button type="button" className="btn btn-primary btn-sm w-full" onClick={() => select('agent', focused.id)}>
                Open full agent detail <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-charcoal-600">
              <p>Hovering an agent highlights the services it exchanges information with and dims the rest.</p>
              <p>Each agent shows three things that matter more than its output: what it monitors, who owns the decision, and what it is not allowed to do on its own.</p>
              <p className="border-l-2 border-forest-600 pl-3 font-medium text-charcoal-800">
                The system catches the exception. The operator makes the decision.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
