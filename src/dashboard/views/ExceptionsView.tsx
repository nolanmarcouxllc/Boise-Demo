import { useMemo, useState } from 'react'
import { exceptions } from '../../data'
import type { Detail } from '../Drawer'
import { ViewPanel } from './shared'

const FILTERS = ['All', 'Critical', 'Overdue', 'Unassigned', 'Transportation', 'Resolved'] as const
type Filter = (typeof FILTERS)[number]

const SEVERITY: Record<string, string> = {
  critical: '#D71920',
  warning: '#D98A00',
  resolved: '#148345',
}
const severityColor = (s: string) => SEVERITY[s] ?? '#1F5F99'

function matches(e: (typeof exceptions)[number], f: Filter) {
  if (f === 'Critical') return e.severity === 'critical' && e.status !== 'Resolved'
  if (f === 'Overdue') return e.overdue
  if (f === 'Unassigned') return e.unassigned
  if (f === 'Transportation') return e.transportation
  if (f === 'Resolved') return e.status === 'Resolved'
  return true
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">{label}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-ink">{children}</div>
    </div>
  )
}

export function ExceptionsView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const [filter, setFilter] = useState<Filter>('All')
  const list = useMemo(() => exceptions.filter((e) => matches(e, filter)), [filter])
  const [selectedId, setSelectedId] = useState(exceptions[0].id)

  // Keep the detail pane on a record the current filter still shows.
  const selected = list.find((e) => e.id === selectedId) ?? list[0]

  const related: Array<{ label: string; detail: Detail }> = selected
    ? [
        ...selected.relatedOrderIds.map((id) => ({ label: id, detail: { kind: 'order' as const, id } })),
        ...selected.relatedRouteIds.map((id) => ({ label: id, detail: { kind: 'route' as const, id } })),
      ]
    : []

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
            {f}
            <span className="num opacity-70">{exceptions.filter((e) => matches(e, f)).length}</span>
          </button>
        ))}
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-2.5">
        <ViewPanel title={`Exception queue — ${list.length}`} bodyClass="p-0">
          {list.length === 0 ? (
            <p className="p-3.5 text-[12px] text-inkSoft">Nothing in this filter right now.</p>
          ) : (
            <ul>
              {list.map((e) => {
                const on = selected?.id === e.id
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(e.id)}
                      aria-current={on ? 'true' : undefined}
                      className={`flex w-full items-start gap-3 border-b border-lineSoft px-3.5 py-2.5 text-left last:border-0 ${
                        on ? 'bg-[#F1F6F2]' : 'hover:bg-shell'
                      }`}
                    >
                      <span aria-hidden className="mt-1 h-[9px] w-[9px] shrink-0 rounded-full" style={{ backgroundColor: severityColor(e.severity) }} />
                      <span className="min-w-0 flex-1">
                        <span className="cond block text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">
                          {e.id} · {e.category}
                        </span>
                        <span className="block text-[12.5px] font-semibold leading-tight text-ink">{e.title}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          {e.overdue && <span className="cond rounded-sm2 bg-danger/10 px-1.5 text-[9px] font-bold uppercase text-danger">Overdue</span>}
                          {e.unassigned && <span className="cond rounded-sm2 bg-amber/10 px-1.5 text-[9px] font-bold uppercase text-amber">Unassigned</span>}
                          {e.customerRisk && <span className="cond rounded-sm2 bg-info/10 px-1.5 text-[9px] font-bold uppercase text-info">Customer</span>}
                          {e.financialRisk && <span className="cond rounded-sm2 bg-info/10 px-1.5 text-[9px] font-bold uppercase text-info">Financial</span>}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[11px] text-inkSoft">{e.owner}</span>
                        <span className="num block text-[11px] text-inkFaint">due {e.deadline.slice(11)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </ViewPanel>

        {selected ? (
          <ViewPanel
            title={`${selected.id} — ${selected.status}`}
            right={
              <span
                className="cond rounded-sm2 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.07em]"
                style={{
                  color: severityColor(selected.severity),
                  backgroundColor: `${severityColor(selected.severity)}14`,
                  border: `1px solid ${severityColor(selected.severity)}40`,
                }}
              >
                {selected.severity}
              </span>
            }
          >
            <h3 className="text-[14px] font-bold leading-tight text-ink">{selected.title}</h3>

            <div className="mt-3 space-y-2.5">
              <Field label="Business impact">{selected.businessImpact}</Field>
              <Field label="Recommended action">
                <span className="block rounded-sm2 border-l-[3px] border-accent bg-shell px-3 py-2">{selected.recommendedAction}</span>
              </Field>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5">
              <Field label="Owner">{selected.owner}</Field>
              <Field label="Due">{selected.deadline.replace('T', ' ')}</Field>
              <Field label="Detected">{selected.detectedAt.replace('T', ' ')}</Field>
              <Field label="Category">{selected.category}</Field>
              <div className="col-span-2">
                <Field label="Escalation path">{selected.escalationPath}</Field>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-3">
                <div className="cond mb-1 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Related records</div>
                <div className="flex flex-wrap gap-1.5">
                  {related.map((r) => (
                    <button
                      key={`${r.detail.kind}-${r.label}`}
                      type="button"
                      onClick={() => onOpen(r.detail)}
                      className="cond rounded-sm2 border border-line bg-white px-2 py-[3px] text-[11px] font-semibold text-ink hover:border-accent hover:text-accent"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selected.resolutionNotes && (
              <div className="mt-3">
                <Field label="Notes">
                  <span className="text-inkSoft">{selected.resolutionNotes}</span>
                </Field>
              </div>
            )}

            <div className="mt-3">
              <div className="cond mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Why this one is flagged</div>
              <ul className="space-y-1.5">
                {[
                  [selected.severity === 'critical', 'Critical', 'Service or cost consequence lands today if nobody acts.'],
                  [selected.overdue, 'Overdue', 'Past its deadline and still open.'],
                  [selected.unassigned, 'Unassigned', 'No named owner has picked it up yet.'],
                  [selected.customerRisk, 'Customer risk', 'A customer notices this if it is not resolved.'],
                  [selected.financialRisk, 'Financial risk', 'Detention, rework or margin exposure attached.'],
                  [selected.transportation, 'Transportation', 'Affects a vehicle, driver or route already planned.'],
                ]
                  .filter(([on]) => on)
                  .map(([, label, why]) => (
                    <li key={label as string} className="flex gap-2 text-[11.5px] leading-snug">
                      <span aria-hidden className="mt-[6px] h-[4px] w-[4px] shrink-0 rounded-full bg-inkFaint" />
                      <span>
                        <span className="font-semibold text-ink">{label as string}</span>
                        <span className="text-inkSoft"> — {why as string}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {(() => {
              const siblings = exceptions.filter((e) => e.category === selected.category && e.id !== selected.id)
              if (siblings.length === 0) return null
              return (
                <div className="mt-3">
                  <div className="cond mb-1 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">
                    Others in {selected.category.toLowerCase()} — {siblings.length}
                  </div>
                  <ul>
                    {siblings.map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(e.id)}
                          className="flex w-full items-start gap-2 border-b border-lineSoft py-1.5 text-left last:border-0 hover:bg-shell"
                        >
                          <span aria-hidden className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: severityColor(e.severity) }} />
                          <span className="min-w-0 flex-1 text-[11.5px] leading-snug text-ink">{e.title}</span>
                          <span className="num shrink-0 text-[11px] text-inkFaint">{e.id}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[11px] leading-snug text-inkFaint">
                    A repeated category is usually a process signal rather than {siblings.length + 1} separate mistakes.
                  </p>
                </div>
              )
            })()}

            <p className="mt-3 rounded-sm2 border border-line bg-shell px-3 py-2 text-[11px] leading-snug text-inkFaint">
              Every exception here is queued to a named owner with an escalation path. Nothing resolves itself, and nothing leaves the queue without
              a person closing it.
            </p>
          </ViewPanel>
        ) : (
          <ViewPanel title="Exception detail">
            <p className="text-[12px] text-inkSoft">Select an exception to see its full record.</p>
          </ViewPanel>
        )}
      </div>
    </div>
  )
}
