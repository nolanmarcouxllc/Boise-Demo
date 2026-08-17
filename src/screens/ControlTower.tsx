import { CloudSun, List, Map as MapIcon, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapLegend, RouteMap } from '../components/RouteMap'
import { Chip, Panel, ProgressBar, SectionHeading, SeverityChip } from '../components/ui'
import { carrierById, driverById, exceptions, locationCity, locationName, routes, truckById, utilization } from '../data'
import { useApp } from '../state/AppContext'

type View = 'map' | 'timeline' | 'list'

const FILTERS = [
  { id: 'all', label: 'All routes' },
  { id: 'private', label: 'Private fleet' },
  { id: 'third', label: 'Third party' },
  { id: 'risk', label: 'At risk' },
  { id: 'moving', label: 'In transit' },
  { id: 'unreleased', label: 'Not released' },
] as const

export function ControlTower() {
  const { select } = useApp()
  const [view, setView] = useState<View>('map')
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [active, setActive] = useState<string | null>('RT-12')

  const visible = useMemo(() => {
    switch (filter) {
      case 'private':
        return routes.filter((r) => r.mode === 'Private fleet')
      case 'third':
        return routes.filter((r) => r.mode === 'Third party')
      case 'risk':
        return routes.filter((r) => r.health === 'risk' || r.stops.some((s) => s.status === 'At risk'))
      case 'moving':
        return routes.filter((r) => r.status === 'In transit' || r.status === 'Dispatched')
      case 'unreleased':
        return routes.filter((r) => r.status === 'Planning' || r.status === 'Loading')
      default:
        return routes
    }
  }, [filter])

  const activeRoute = routes.find((r) => r.id === active) ?? null

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 3 · The dispatcher stays in control"
        title="Transportation control tower"
        blurb="Private fleet, approved carriers, planned routes, progress, at-risk deliveries and the information gaps behind them — on one screen, with the map, the timeline and a list view of the same data."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-[3px] border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.07em] transition-colors ${
                filter === f.id ? 'border-forest-700 bg-forest-700 text-white' : 'border-charcoal-300 bg-white text-charcoal-600 hover:border-charcoal-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-[3px] border border-charcoal-300 bg-white p-0.5" role="group" aria-label="View">
          {(
            [
              { id: 'map' as const, label: 'Map', icon: MapIcon },
              { id: 'timeline' as const, label: 'Timeline', icon: Timer },
              { id: 'list' as const, label: 'List', icon: List },
            ]
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={view === id}
              className={`flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.07em] ${
                view === id ? 'bg-charcoal-800 text-white' : 'text-charcoal-600 hover:bg-charcoal-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {view === 'map' && (
            <>
              <RouteMap selectedRouteId={active} onSelectRoute={setActive} visibleRouteIds={visible.map((r) => r.id)} />
              <MapLegend />
            </>
          )}
          {view === 'timeline' && <Timeline routeIds={visible.map((r) => r.id)} active={active} onSelect={setActive} />}
          {view === 'list' && <RouteList routeIds={visible.map((r) => r.id)} active={active} onSelect={setActive} />}
          <p className="text-[12px] text-charcoal-500">
            Showing {visible.length} of {routes.length} modeled routes. Route geometry is a simplified corridor model for display, not a routing-engine
            output.
          </p>
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
          {activeRoute ? (
            <Panel
              title={`Route ${activeRoute.number} — ${activeRoute.name}`}
              subtitle={activeRoute.corridor}
              actions={
                <button type="button" className="btn btn-primary btn-sm" onClick={() => select('route', activeRoute.id)}>
                  Full detail
                </button>
              }
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <SeverityChip
                  severity={activeRoute.health === 'ok' ? 'resolved' : activeRoute.health === 'attention' ? 'warning' : 'critical'}
                  label={activeRoute.status}
                />
                <Chip tone={activeRoute.mode === 'Private fleet' ? 'green' : 'timber'}>{activeRoute.mode}</Chip>
                {activeRoute.actualDepart && activeRoute.actualDepart > activeRoute.plannedDepart && (
                  <Chip tone="red">Departed {minutesLate(activeRoute.plannedDepart, activeRoute.actualDepart)} min late</Chip>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Row label="Truck">
                  {activeRoute.truckId
                    ? `Unit ${truckById.get(activeRoute.truckId)?.unit} · ${truckById.get(activeRoute.truckId)?.type}`
                    : activeRoute.carrierId
                      ? carrierById.get(activeRoute.carrierId)?.name
                      : 'Not assigned'}
                </Row>
                <Row label="Driver">{activeRoute.driverId ? driverById.get(activeRoute.driverId)?.name : 'Carrier supplied'}</Row>
                <Row label="Planned miles">{activeRoute.plannedMiles}</Row>
                <Row label="Duration">
                  {Math.floor(activeRoute.plannedDurationMin / 60)}h {activeRoute.plannedDurationMin % 60}m
                </Row>
                <Row label="Weight">{activeRoute.weightLbs.toLocaleString()} lbs</Row>
                <Row label="Departure">
                  {activeRoute.plannedDepart}
                  {activeRoute.actualDepart ? ` (actual ${activeRoute.actualDepart})` : ''}
                </Row>
              </dl>

              <div className="mt-3">
                <div className="label-caps mb-1">Capacity utilization</div>
                <ProgressBar pct={utilization(activeRoute)} tone={utilization(activeRoute) > 85 ? 'amber' : 'green'} />
              </div>

              <div className="mt-4">
                <div className="label-caps mb-2">Stops</div>
                <ol className="space-y-1.5">
                  {activeRoute.stops.map((s) => (
                    <li key={s.seq} className="flex items-center gap-2 rounded-[3px] border border-charcoal-200 px-2.5 py-2 text-[13px]">
                      <span aria-hidden className="font-mono text-charcoal-400">{s.seq}</span>
                      <span className="min-w-0 flex-1 truncate">{locationName(s.locationId)}</span>
                      <span className="shrink-0 font-mono text-[12px] text-charcoal-500">{s.plannedArrival}</span>
                      <SeverityChip
                        severity={s.status === 'At risk' ? 'critical' : s.status === 'Complete' ? 'resolved' : 'info'}
                        label={s.status}
                      />
                    </li>
                  ))}
                </ol>
              </div>

              {activeRoute.exceptionIds.length > 0 && (
                <div className="mt-4">
                  <div className="label-caps mb-2">Open exceptions</div>
                  <div className="space-y-1.5">
                    {activeRoute.exceptionIds.map((id) => {
                      const e = exceptions.find((x) => x.id === id)
                      if (!e) return null
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => select('exception', id)}
                          className="flex w-full items-start gap-2 rounded-[3px] border border-charcoal-200 px-2.5 py-2 text-left text-[13px] hover:border-alert-critical/50"
                        >
                          <SeverityChip severity={e.severity} />
                          <span className="min-w-0 flex-1">{e.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </Panel>
          ) : (
            <Panel title="Route detail">
              <p className="text-sm text-charcoal-500">Select a route on the map, timeline or list.</p>
            </Panel>
          )}

          <Panel title="Conditions and risk" subtitle="Simulated">
            <ul className="space-y-2 text-[13px] leading-relaxed text-charcoal-700">
              <li className="flex gap-2">
                <CloudSun className="mt-0.5 h-4 w-4 shrink-0 text-alert-warn" aria-hidden />
                Scattered rain forecast in the Berkshires after 14:00. The Hadley job site restricts access in wet conditions.
              </li>
              <li className="flex gap-2">
                <Timer className="mt-0.5 h-4 w-4 shrink-0 text-alert-critical" aria-hidden />
                Truck 108 came out of maintenance 40 minutes late, which is the root of the Route 12 delay.
              </li>
              <li className="flex gap-2">
                <MapIcon className="mt-0.5 h-4 w-4 shrink-0 text-charcoal-400" aria-hidden />
                Route 1 and Route 12 share 31 corridor miles in each direction — the clearest consolidation signal on the board.
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className="mt-0.5 text-charcoal-700">{children}</dd>
    </div>
  )
}

function minutesLate(planned: string, actual: string): number {
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
  return toMin(actual) - toMin(planned)
}

const HOUR_START = 5
const HOUR_END = 15

function Timeline({ routeIds, active, onSelect }: { routeIds: string[]; active: string | null; onSelect: (id: string) => void }) {
  const shown = routes.filter((r) => routeIds.includes(r.id))
  const span = HOUR_END - HOUR_START
  const pos = (t: string) => ((Number(t.slice(0, 2)) + Number(t.slice(3, 5)) / 60 - HOUR_START) / span) * 100

  return (
    <div className="panel overflow-x-auto p-4">
      <div className="min-w-[720px]">
        <div className="relative mb-2 h-5 border-b border-charcoal-200">
          {Array.from({ length: span + 1 }, (_, i) => HOUR_START + i).map((h) => (
            <span key={h} className="absolute -translate-x-1/2 font-mono text-[11px] text-charcoal-400" style={{ left: `${((h - HOUR_START) / span) * 100}%` }}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>
        <ul className="space-y-1.5">
          {shown.map((r) => {
            const left = pos(r.actualDepart ?? r.plannedDepart)
            const end = pos(r.stops[r.stops.length - 1]?.plannedDepart ?? r.plannedDepart)
            const color = r.health === 'ok' ? 'bg-forest-600' : r.health === 'attention' ? 'bg-alert-warn' : 'bg-alert-critical'
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  className={`flex w-full items-center gap-3 rounded-[3px] px-2 py-1.5 text-left ${active === r.id ? 'bg-charcoal-100' : 'hover:bg-charcoal-50'}`}
                >
                  <span className="w-20 shrink-0 font-mono text-[12px] font-semibold">Route {r.number}</span>
                  <span className="relative h-7 flex-1 rounded-[2px] bg-charcoal-100">
                    <span
                      className={`absolute top-1 h-5 rounded-[2px] ${color} ${r.mode === 'Third party' ? 'opacity-70' : ''}`}
                      style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(3, end - left)}%` }}
                    />
                    {r.stops.map((s) => (
                      <span
                        key={s.seq}
                        title={`${locationName(s.locationId)} ${s.plannedArrival}`}
                        className={`absolute top-0 h-7 w-[2px] ${s.status === 'At risk' ? 'bg-alert-critical' : 'bg-white/80'}`}
                        style={{ left: `${pos(s.plannedArrival)}%` }}
                      />
                    ))}
                  </span>
                  <span className="w-24 shrink-0 truncate text-[11px] uppercase tracking-wide text-charcoal-400">{r.status}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function RouteList({ routeIds, active, onSelect }: { routeIds: string[]; active: string | null; onSelect: (id: string) => void }) {
  const shown = routes.filter((r) => routeIds.includes(r.id))
  return (
    <div className="panel overflow-x-auto p-0">
      <table className="w-full min-w-[760px] text-sm">
        <caption className="sr-only">List view of simulated routes — an alternative to the map</caption>
        <thead>
          <tr className="border-b border-charcoal-200 text-left">
            {['Route', 'Stops', 'Depart', 'Miles', 'Utilization', 'Status'].map((h) => (
              <th key={h} scope="col" className="label-caps px-4 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr
              key={r.id}
              className={`data-row cursor-pointer ${active === r.id ? 'bg-charcoal-50' : 'hover:bg-charcoal-50'}`}
              onClick={() => onSelect(r.id)}
            >
              <td className="px-4 py-2.5 font-mono font-semibold">Route {r.number}</td>
              <td className="px-4 py-2.5 text-charcoal-600">{r.stops.map((s) => locationCity(s.locationId)).join(' → ')}</td>
              <td className="px-4 py-2.5 font-mono">{r.actualDepart ?? r.plannedDepart}</td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums">{r.plannedMiles}</td>
              <td className="px-4 py-2.5 font-mono tabular-nums">{utilization(r)}%</td>
              <td className="px-4 py-2.5">
                <SeverityChip
                  severity={r.health === 'ok' ? 'resolved' : r.health === 'attention' ? 'warning' : 'critical'}
                  label={r.status}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
