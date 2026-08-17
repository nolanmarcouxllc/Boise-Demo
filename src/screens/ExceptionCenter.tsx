import { useMemo, useState } from 'react'
import { ExceptionDetail } from '../components/DetailPanel'
import { Chip, EmptyState, Panel, SectionHeading, SeverityChip } from '../components/ui'
import { agentById, exceptions, routeLabel } from '../data'
import type { ExceptionRecord } from '../data/types'
import { useApp } from '../state/AppContext'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'today', label: 'Today' },
  { id: 'transportation', label: 'Transportation' },
  { id: 'customer', label: 'Customer risk' },
  { id: 'financial', label: 'Financial risk' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'resolved', label: 'Resolved' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

function matches(e: ExceptionRecord, f: FilterId): boolean {
  switch (f) {
    case 'critical':
      return e.severity === 'critical' && e.status !== 'Resolved'
    case 'today':
      return e.detectedAt.startsWith('2026-08-17')
    case 'transportation':
      return e.transportation
    case 'customer':
      return e.customerRisk
    case 'financial':
      return e.financialRisk
    case 'unassigned':
      return e.unassigned
    case 'overdue':
      return e.overdue
    case 'resolved':
      return e.status === 'Resolved'
    default:
      return true
  }
}

export function ExceptionCenter() {
  const { select } = useApp()
  const [filter, setFilter] = useState<FilterId>('all')
  const [activeId, setActiveId] = useState<string>('EXC-003')

  const list = useMemo(() => exceptions.filter((e) => matches(e, filter)), [filter])
  const active = exceptions.find((e) => e.id === activeId) ?? list[0] ?? null

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    FILTERS.forEach((f) => {
      map[f.id] = exceptions.filter((e) => matches(e, f.id)).length
    })
    return map
  }, [])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    exceptions.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + 1))
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [])

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 3 · One operational inbox"
        title="Exception center"
        blurb="Everything that needs attention in one queue — order data, inventory, loading, routing, driver, equipment, carrier, appointment, delivery, proof of delivery, billing and system integration. Each item carries a severity, an owner, a deadline and an escalation path."
      />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`flex items-center gap-1.5 rounded-[3px] border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.07em] transition-colors ${
              filter === f.id ? 'border-forest-700 bg-forest-700 text-white' : 'border-charcoal-300 bg-white text-charcoal-600 hover:border-charcoal-500'
            }`}
          >
            {f.label}
            <span className={`font-mono text-[11px] ${filter === f.id ? 'text-forest-200' : 'text-charcoal-400'}`}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel title={`Queue — ${list.length} item${list.length === 1 ? '' : 's'}`} subtitle="Sorted by severity, then detection time" bodyClassName="p-0">
          {list.length === 0 ? (
            <div className="p-4">
              <EmptyState message="No exceptions match this filter in the demonstration data set." />
            </div>
          ) : (
            <ul>
              {[...list]
                .sort((a, b) => severityRank(a) - severityRank(b) || a.detectedAt.localeCompare(b.detectedAt))
                .map((e) => (
                  <li key={e.id} className="data-row">
                    <button
                      type="button"
                      onClick={() => setActiveId(e.id)}
                      className={`w-full px-4 py-3 text-left transition-colors ${active?.id === e.id ? 'bg-charcoal-50' : 'hover:bg-charcoal-50/60'}`}
                    >
                      <span className="flex flex-wrap items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="label-caps mb-1 block">
                            {e.id} · {e.category}
                          </span>
                          <span className="block text-sm font-semibold leading-snug text-charcoal-900">{e.title}</span>
                        </span>
                        <SeverityChip severity={e.severity} />
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-charcoal-500">
                        <span>Owner: {e.owner}</span>
                        <span className="font-mono">Detected {e.detectedAt.slice(11)}</span>
                        <span className="font-mono">Due {e.deadline.slice(11)}</span>
                        {e.overdue && <Chip tone="red">Overdue</Chip>}
                        {e.unassigned && <Chip tone="red">Unassigned</Chip>}
                        {e.relatedRouteIds.map((r) => (
                          <Chip key={r} tone="neutral">
                            {routeLabel(r)}
                          </Chip>
                        ))}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
          {active ? (
            <Panel
              title={active.id}
              subtitle={`${active.category} · detected by ${agentById.get(active.detectedByAgentId)?.name ?? active.detectedByAgentId}`}
              actions={
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => select('exception', active.id)}>
                  Open panel
                </button>
              }
            >
              <h3 className="mb-3 text-[15px] font-semibold leading-snug">{active.title}</h3>
              <ExceptionDetail id={active.id} />
            </Panel>
          ) : (
            <Panel title="Exception detail">
              <EmptyState message="Select an exception from the queue." />
            </Panel>
          )}

          <Panel title="Queue composition" subtitle="Simulated exceptions by category">
            <ul className="space-y-1.5">
              {byCategory.map(([cat, count]) => (
                <li key={cat} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-[13px] text-charcoal-600">{cat}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-charcoal-100">
                    <span className="block h-full rounded-full bg-forest-500" style={{ width: `${(count / exceptions.length) * 100 * 3}%` }} />
                  </span>
                  <span className="w-6 shrink-0 text-right font-mono text-[12px] tabular-nums text-charcoal-500">{count}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-charcoal-200 pt-3 text-[13px] leading-relaxed text-charcoal-600">
              The goal is not another dashboard. The goal is fewer problems discovered too late.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function severityRank(e: ExceptionRecord): number {
  return { critical: 0, warning: 1, watch: 2, resolved: 3 }[e.severity]
}
