import { useEffect } from 'react'
import {
  agents,
  carrierById,
  customerName,
  driverById,
  exceptions,
  locationCity,
  locationName,
  orderById,
  orders,
  recommendations,
  routeById,
  routes,
  truckById,
  utilization,
} from '../data'
import { metrics, priorities, agentRows, toneHex, type Tone } from './data'
import { CapabilityDetail } from './CapabilityDetail'
import { capabilityByKey } from './capabilities'

export type Detail =
  | { kind: 'metric'; id: string }
  | { kind: 'priority'; id: number }
  | { kind: 'agent'; id: string }
  | { kind: 'route'; id: string }
  | { kind: 'exception'; id: string }
  | { kind: 'order'; id: string }
  | { kind: 'allPriorities' }
  | { kind: 'capability'; id: string }

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-lineSoft py-2 last:border-0">
      <div className="cond text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">{label}</div>
      <div className="mt-0.5 text-[12.5px] leading-snug text-ink">{children}</div>
    </div>
  )
}

function Pill({ text, tone }: { text: string; tone: Tone }) {
  return (
    <span
      className="cond inline-flex items-center gap-1.5 rounded-sm2 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em]"
      style={{ color: toneHex[tone], backgroundColor: `${toneHex[tone]}14`, border: `1px solid ${toneHex[tone]}44` }}
    >
      {text}
    </span>
  )
}

export function Drawer({ detail, onClose, onOpen }: { detail: Detail | null; onClose: () => void; onOpen: (d: Detail) => void }) {
  useEffect(() => {
    if (!detail) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [detail, onClose])

  if (!detail) return null
  const { title, eyebrow, body } = build(detail, onOpen)

  return (
    <div className="absolute inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close detail" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className={`relative flex h-full flex-col border-l border-line bg-white shadow-2xl ${detail.kind === 'capability' ? 'w-[640px]' : 'w-[520px]'}`}>
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-shell px-4 py-3">
          <div className="min-w-0">
            <div className="cond text-[10px] font-bold uppercase tracking-[0.1em] text-inkSoft">{eyebrow}</div>
            <h2 className="cond mt-0.5 text-[17px] font-bold leading-tight text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cond shrink-0 rounded-sm2 border border-line bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-inkSoft hover:text-ink"
          >
            Close
          </button>
        </header>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 py-3">{body}</div>
      </div>
    </div>
  )
}

function LinkBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cond rounded-sm2 border border-line bg-white px-2 py-1 text-[11px] font-semibold text-ink hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  )
}

function build(d: Detail, onOpen: (x: Detail) => void): { title: string; eyebrow: string; body: React.ReactNode } {
  switch (d.kind) {
    case 'capability': {
      const c = capabilityByKey.get(d.id)
      if (!c) return { eyebrow: 'Capability', title: d.id, body: <p className="text-[12.5px] text-inkSoft">Unknown capability.</p> }
      return { eyebrow: `Capability ${String(c.n).padStart(2, '0')} · ${c.department}`, title: c.name, body: <CapabilityDetail c={c} /> }
    }
    case 'metric': {
      const m = metrics.find((x) => x.id === d.id)!
      const rows = evidenceFor(d.id)
      return {
        eyebrow: 'Metric',
        title: `${m.label} — ${m.value}`,
        body: (
          <div>
            <p className="mb-3 text-[12.5px] leading-snug text-inkSoft">{rows.blurb}</p>
            <div className="cond mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Records behind this number</div>
            <ul className="space-y-1">
              {rows.items.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-3 border-b border-lineSoft py-1.5 last:border-0">
                  <span className="min-w-0 truncate text-[12.5px] text-ink">{r.label}</span>
                  {r.open ? <LinkBtn label="Open" onClick={() => onOpen(r.open!)} /> : <span className="num text-[12px] text-inkSoft">{r.value}</span>}
                </li>
              ))}
            </ul>
          </div>
        ),
      }
    }
    case 'priority': {
      const p = priorities.find((x) => x.n === d.id)!
      return {
        eyebrow: `Priority ${p.n}`,
        title: p.title,
        body: (
          <div>
            <div className="mb-3 flex gap-2">
              <Pill text={p.impact} tone={p.tone} />
              <Pill text={p.result} tone="neutral" />
            </div>
            <Row label="What was detected">{p.detail}</Row>
            <Row label="Why it matters">{priorityWhy[p.n]}</Row>
            <Row label="Recommended action">{priorityAction[p.n]}</Row>
            <Row label="Waiting on">{priorityOwner[p.n]}</Row>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {priorityLinks[p.n].map((l) => (
                <LinkBtn key={l.label} label={l.label} onClick={() => onOpen(l.detail)} />
              ))}
            </div>
            <p className="mt-4 rounded-sm2 border border-line bg-shell px-3 py-2 text-[11.5px] leading-snug text-inkSoft">
              Nothing here executes on its own. This records the decision inside the demonstration only.
            </p>
          </div>
        ),
      }
    }
    case 'allPriorities': {
      const extra = exceptions.filter((e) => e.status !== 'Resolved').slice(0, 7)
      return {
        eyebrow: 'Queue',
        title: 'All priorities (12)',
        body: (
          <ul className="space-y-1">
            {priorities.map((p) => (
              <li key={p.n} className="flex items-center gap-2 border-b border-lineSoft py-1.5">
                <span className="num flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: toneHex[p.tone] }}>
                  {p.n}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{p.title}</span>
                <LinkBtn label="Open" onClick={() => onOpen({ kind: 'priority', id: p.n })} />
              </li>
            ))}
            {extra.map((e, i) => (
              <li key={e.id} className="flex items-center gap-2 border-b border-lineSoft py-1.5 last:border-0">
                <span className="num flex h-5 w-5 items-center justify-center rounded-full bg-inkFaint text-[11px] font-bold text-white">{i + 6}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{e.title}</span>
                <LinkBtn label="Open" onClick={() => onOpen({ kind: 'exception', id: e.id })} />
              </li>
            ))}
          </ul>
        ),
      }
    }
    case 'agent': {
      const cap = capabilityByKey.get(d.id)
      if (cap) return { eyebrow: `Capability ${String(cap.n).padStart(2, '0')} · ${cap.department}`, title: cap.name, body: <CapabilityDetail c={cap} /> }
      const row = agentRows.find((x) => x.id === d.id)!
      const full = agents[agentRows.findIndex((x) => x.id === d.id)]
      const recs = recommendations.filter((r) => r.agentId === full?.id)
      return {
        eyebrow: `${row.specialty} · ${row.status}`,
        title: row.name,
        body: (
          <div>
            <p className="mb-3 text-[12.5px] leading-snug text-inkSoft">{full?.purpose ?? row.activity}</p>
            <Row label="Latest activity">{row.activity}</Row>
            <Row label="Permission level">{full?.permission ?? 'recommend'}</Row>
            <Row label="Decision owner">{full?.decisionOwner ?? 'Dispatcher'}</Row>
            <Row label="Not allowed to">
              <ul className="mt-1 space-y-1">
                {(full?.notAllowedTo ?? []).map((n) => (
                  <li key={n} className="text-[12px] text-inkSoft">• {n}</li>
                ))}
              </ul>
            </Row>
            {recs.length > 0 && (
              <>
                <div className="cond mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Open recommendations</div>
                <ul className="space-y-1">
                  {recs.slice(0, 4).map((r) => (
                    <li key={r.id} className="border-b border-lineSoft py-1.5 last:border-0">
                      <div className="text-[12.5px] font-semibold text-ink">{r.title}</div>
                      <div className="mt-0.5 text-[11.5px] text-inkSoft">{r.expectedImpact}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {r.relatedRouteIds.slice(0, 3).map((rid) => (
                          <LinkBtn key={rid} label={`Route ${routeById.get(rid)?.number ?? rid}`} onClick={() => onOpen({ kind: 'route', id: rid })} />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ),
      }
    }
    case 'route': {
      const r = routeById.get(d.id)
      if (!r) return { eyebrow: 'Route', title: d.id, body: <p className="text-[12.5px] text-inkSoft">Not modeled in this data set.</p> }
      const truck = r.truckId ? truckById.get(r.truckId) : null
      const driver = r.driverId ? driverById.get(r.driverId) : null
      const carrier = r.carrierId ? carrierById.get(r.carrierId) : null
      return {
        eyebrow: `${r.status} · ${r.mode}`,
        title: `Route ${r.number} — ${r.name}`,
        body: (
          <div>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {[
                ['Miles', String(r.plannedMiles)],
                ['Stops', String(r.stops.length)],
                ['Weight', `${(r.weightLbs / 1000).toFixed(1)}K`],
                ['Used', `${utilization(r)}%`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-sm2 border border-line px-2 py-1.5">
                  <div className="cond text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{l}</div>
                  <div className="num text-[15px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
            <Row label="Equipment">{truck ? `Unit ${truck.unit} · ${truck.type}` : carrier ? carrier.name : 'Not assigned'}</Row>
            <Row label="Driver">{driver ? driver.name : 'Carrier supplied'}</Row>
            <Row label="Corridor">{r.corridor}</Row>
            <div className="cond mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Stops</div>
            <ul className="space-y-1">
              {r.stops.map((s) => (
                <li key={s.seq} className="flex items-center gap-2 border-b border-lineSoft py-1.5 last:border-0">
                  <span className="num w-4 text-[11px] text-inkFaint">{s.seq}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-ink">{locationName(s.locationId)}</span>
                    <span className="block text-[11px] text-inkSoft">{locationCity(s.locationId)} · {s.plannedArrival}</span>
                  </span>
                  {s.orderIds[0] && <LinkBtn label={s.orderIds[0]} onClick={() => onOpen({ kind: 'order', id: s.orderIds[0] })} />}
                </li>
              ))}
            </ul>
          </div>
        ),
      }
    }
    case 'exception': {
      const e = exceptions.find((x) => x.id === d.id)!
      return {
        eyebrow: `${e.id} · ${e.category}`,
        title: e.title,
        body: (
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Pill text={e.severity} tone={e.severity === 'critical' ? 'red' : e.severity === 'warning' ? 'amber' : 'green'} />
              <Pill text={e.status} tone="neutral" />
              {e.overdue && <Pill text="Overdue" tone="red" />}
            </div>
            <Row label="Business impact">{e.businessImpact}</Row>
            <Row label="Owner">{e.owner}</Row>
            <Row label="Recommended action">{e.recommendedAction}</Row>
            <Row label="Escalation">{e.escalationPath}</Row>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {e.relatedRouteIds.map((rid) => (
                <LinkBtn key={rid} label={`Route ${routeById.get(rid)?.number ?? rid}`} onClick={() => onOpen({ kind: 'route', id: rid })} />
              ))}
              {e.relatedOrderIds.map((oid) => (
                <LinkBtn key={oid} label={oid} onClick={() => onOpen({ kind: 'order', id: oid })} />
              ))}
            </div>
          </div>
        ),
      }
    }
    case 'order': {
      const o = orderById.get(d.id)
      if (!o) return { eyebrow: 'Order', title: d.id, body: <p className="text-[12.5px] text-inkSoft">Not modeled in this data set.</p> }
      return {
        eyebrow: `Order · ${o.status}`,
        title: o.id,
        body: (
          <div>
            <Row label="Customer">{customerName(o.customerId)}</Row>
            <Row label="Deliver to">{locationName(o.locationId)} — {locationCity(o.locationId)}</Row>
            <Row label="Window">{o.requestedDate} · {o.window[0]}–{o.window[1]}</Row>
            <Row label="Weight">{o.totalWeightLbs.toLocaleString()} lbs · longest {o.maxLengthFt} ft</Row>
            <Row label="Notes">{o.notes}</Row>
            {o.dataFlags.length > 0 && (
              <Row label="Data flags">
                <ul className="mt-1 space-y-1">
                  {o.dataFlags.map((f) => (
                    <li key={f} className="text-[12px] text-amber">• {f}</li>
                  ))}
                </ul>
              </Row>
            )}
            {o.routeId && (
              <div className="mt-3">
                <LinkBtn label={`Open Route ${routeById.get(o.routeId)?.number}`} onClick={() => onOpen({ kind: 'route', id: o.routeId! })} />
              </div>
            )}
          </div>
        ),
      }
    }
  }
}

const priorityWhy: Record<number, string> = {
  1: 'Two stops for the same customer sit on one route 95 minutes apart. One arrival does the work of two.',
  2: 'Two routes cover the same corridor inside the same 90-minute block, so the branch pays twice for the same road.',
  3: 'Routing cannot plan an order without a delivery window. It will sit in the manual queue until someone calls.',
  4: 'Will Call volume is holding the dock, which pushes the Route 101 departure and every stop behind it.',
  5: 'An order with no movement for two days is usually a data problem, not a customer problem — but nobody is watching for it.',
}
const priorityAction: Record<number, string> = {
  1: 'Combine stops 15 and 16 into a single arrival on Route 102.',
  2: 'Group the shared corridor under one route and re-time the second.',
  3: 'Confirm the receiving window with ABC Lumber and put it on the order record.',
  4: 'Clear the Will Call backlog before the Route 101 load, or move the last stop.',
  5: 'Check whether the order is still live before it reaches the cutoff.',
}
const priorityOwner: Record<number, string> = {
  1: 'Dispatcher',
  2: 'Transportation Supervisor',
  3: 'Inside Sales',
  4: 'Yard / Load Supervisor',
  5: 'Inside Sales Lead',
}
const priorityLinks: Record<number, Array<{ label: string; detail: Detail }>> = {
  1: [{ label: 'Route 102', detail: { kind: 'route', id: 'RT-12' } }],
  2: [
    { label: 'Route 103', detail: { kind: 'route', id: 'RT-03' } },
    { label: 'Route 104', detail: { kind: 'route', id: 'RT-04' } },
  ],
  3: [{ label: 'EXC-008', detail: { kind: 'exception', id: 'EXC-008' } }],
  4: [{ label: 'Route 101', detail: { kind: 'route', id: 'RT-01' } }],
  5: [{ label: 'EXC-015', detail: { kind: 'exception', id: 'EXC-015' } }],
}

function evidenceFor(id: string): { blurb: string; items: Array<{ label: string; value?: string; open?: Detail }> } {
  switch (id) {
    case 'open-orders':
      return {
        blurb: 'Orders not yet delivered across the branch. Thirty are modeled in full detail in this environment.',
        items: orders.slice(0, 10).map((o) => ({ label: `${o.id} — ${customerName(o.customerId)}`, open: { kind: 'order', id: o.id } })),
      }
    case 'orders-review':
      return {
        blurb: 'Orders carrying at least one data flag raised by the watchdog agent.',
        items: orders.filter((o) => o.dataFlags.length).map((o) => ({ label: `${o.id} — ${o.dataFlags[0]}`, open: { kind: 'order', id: o.id } })),
      }
    case 'routes-planned':
      return {
        blurb: 'Routes on the board for the service day. Ten are modeled in full detail here.',
        items: routes.map((r) => ({ label: `Route ${r.number} — ${r.corridor}`, open: { kind: 'route', id: r.id } })),
      }
    case 'duplicate-stops':
      return {
        blurb: 'Locations scheduled more than once today, or on consecutive days, where one visit could do the work.',
        items: recommendations.filter((r) => r.agentId === 'AGT-02').map((r) => ({ label: r.title, open: r.relatedRouteIds[0] ? { kind: 'route', id: r.relatedRouteIds[0] } : undefined, value: 'review' })),
      }
    case 'at-risk':
      return {
        blurb: 'Stops currently projected to fall outside their delivery window.',
        items: routes
          .flatMap((r) => r.stops.filter((s) => s.status === 'At risk').map((s) => ({ r, s })))
          .map(({ r, s }) => ({ label: `Route ${r.number} — ${locationCity(s.locationId)}`, open: { kind: 'route', id: r.id } })),
      }
    default:
      return {
        blurb: 'Miles in open proposals that a dispatcher could remove today. Estimates for review, not committed savings.',
        items: [
          { label: 'Route 12 consolidation', value: '74 mi' },
          { label: 'Worcester duplicate stop', value: '42 mi' },
          { label: 'Windsor Locks duplicate stop', value: '28 mi' },
          { label: 'Torrington duplicate stop', value: '42 mi' },
        ],
      }
  }
}
