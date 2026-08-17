import { useMemo, useState } from 'react'
import { exceptions } from '../../data'
import type { Detail } from '../Drawer'
import { ViewPanel } from './shared'

const FILTERS = ['All', 'Critical', 'Overdue', 'Unassigned', 'Transportation', 'Resolved'] as const

export function ExceptionsView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const list = useMemo(
    () =>
      exceptions.filter((e) => {
        if (filter === 'Critical') return e.severity === 'critical' && e.status !== 'Resolved'
        if (filter === 'Overdue') return e.overdue
        if (filter === 'Unassigned') return e.unassigned
        if (filter === 'Transportation') return e.transportation
        if (filter === 'Resolved') return e.status === 'Resolved'
        return true
      }),
    [filter],
  )
  const counts = (f: (typeof FILTERS)[number]) =>
    exceptions.filter((e) =>
      f === 'Critical' ? e.severity === 'critical' && e.status !== 'Resolved'
      : f === 'Overdue' ? e.overdue
      : f === 'Unassigned' ? e.unassigned
      : f === 'Transportation' ? e.transportation
      : f === 'Resolved' ? e.status === 'Resolved'
      : true,
    ).length

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`cond flex items-center gap-1.5 rounded-sm2 border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.07em] ${
              filter === f ? 'border-forest bg-forest text-white' : 'border-line bg-white text-inkSoft hover:border-inkSoft'
            }`}
          >
            {f}<span className="num opacity-70">{counts(f)}</span>
          </button>
        ))}
      </div>

      <ViewPanel title={`Exception queue — ${list.length}`} bodyClass="p-0">
        <ul>
          {list.map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => onOpen({ kind: 'exception', id: e.id })} className="flex w-full items-start gap-3 border-b border-lineSoft px-3.5 py-2.5 text-left last:border-0 hover:bg-shell">
                <span
                  aria-hidden
                  className="mt-1 h-[9px] w-[9px] shrink-0 rounded-full"
                  style={{ backgroundColor: e.severity === 'critical' ? '#D71920' : e.severity === 'warning' ? '#D98A00' : e.severity === 'resolved' ? '#148345' : '#1F5F99' }}
                />
                <span className="min-w-0 flex-1">
                  <span className="cond block text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">{e.id} · {e.category}</span>
                  <span className="block text-[12.5px] font-semibold leading-tight text-ink">{e.title}</span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-inkSoft">{e.businessImpact}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[11px] text-inkSoft">{e.owner}</span>
                  <span className="num block text-[11px] text-inkFaint">due {e.deadline.slice(11)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </ViewPanel>
    </div>
  )
}
