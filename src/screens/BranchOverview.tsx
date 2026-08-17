import { ArrowRight, Clock, Search, Truck } from 'lucide-react'
import { useState } from 'react'
import { Panel, SectionHeading, SeverityChip, Chip, Metric, ProgressBar } from '../components/ui'
import {
  branch,
  branchMetrics,
  locationCity,
  managementBrief,
  orderPressure,
  routeLabel,
  routes,
  todaysPriorities,
  transportSnapshot,
  utilization,
} from '../data'
import { useApp } from '../state/AppContext'

export function BranchOverview() {
  const { select, goToSection, highlight, setHighlight } = useApp()
  const [briefOpen, setBriefOpen] = useState(false)

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={`${branch.name} · Monday 17 August 2026 · 08:12 local`}
        title="Branch overview"
        blurb="One view of the service day, assembled from simulated order, routing, dispatch and delivery records. Every number on this screen states where it came from."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {branchMetrics.map((m) => (
          <Metric
            key={m.key}
            label={m.label}
            value={m.value}
            tone={m.tone}
            derivation={m.derivation}
            onClick={m.link ? () => goToSection(m.link!.section) : undefined}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* ------------------------------------------------- priorities */}
        <Panel
          title="Today's priorities"
          subtitle="Ranked by operational impact"
          bodyClassName="p-0"
          actions={<Chip tone="neutral">{todaysPriorities.length} items</Chip>}
        >
          <ul>
            {todaysPriorities.map((p) => (
              <li key={p.rank} className="data-row">
                <div className="flex gap-3 px-4 py-3">
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] font-mono text-xs font-bold ${
                      p.severity === 'critical'
                        ? 'bg-alert-critical/10 text-alert-critical'
                        : p.severity === 'warning'
                          ? 'bg-alert-warn/10 text-alert-warn'
                          : 'bg-charcoal-100 text-charcoal-500'
                    }`}
                  >
                    {p.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug">{p.title}</h3>
                      <SeverityChip severity={p.severity} />
                    </div>
                    <p className="pres-body mt-1 text-[13px] leading-relaxed text-charcoal-600">{p.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.routeIds.map((rid) => (
                        <button key={rid} type="button" className="btn btn-secondary btn-sm" onClick={() => select('route', rid)}>
                          {routeLabel(rid)}
                        </button>
                      ))}
                      {p.exceptionId && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => select('exception', p.exceptionId!)}>
                          {p.exceptionId}
                        </button>
                      )}
                      {p.recommendationId && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => select('recommendation', p.recommendationId!)}>
                          {p.recommendationId}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          {/* ---------------------------------------------- transportation */}
          <Panel title="Transportation snapshot" subtitle="Modeled routes for the service day">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Small label="Private fleet routes" value={String(transportSnapshot.privateFleetRoutes)} />
              <Small label="Third-party loads" value={String(transportSnapshot.thirdPartyRoutes)} />
              <Small label="Planned miles" value={transportSnapshot.plannedMiles.toLocaleString()} />
              <Small label="Avg. utilization" value={`${transportSnapshot.averageUtilization}%`} />
            </div>
            <div className="mt-4 space-y-2">
              {routes.map((r) => {
                const u = utilization(r)
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => select('route', r.id)}
                    className="flex w-full items-center gap-3 rounded-[3px] border border-transparent px-2 py-1.5 text-left transition-colors hover:border-charcoal-200 hover:bg-charcoal-50"
                  >
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        r.health === 'ok' ? 'bg-forest-600' : r.health === 'attention' ? 'bg-alert-warn' : 'bg-alert-critical'
                      }`}
                    />
                    <span className="w-16 shrink-0 font-mono text-[12px] font-semibold">Route {r.number}</span>
                    <span className="hidden w-40 shrink-0 truncate text-[12px] text-charcoal-500 lg:block">{r.corridor}</span>
                    <span className="min-w-0 flex-1">
                      <ProgressBar pct={u} tone={u > 85 ? 'amber' : 'green'} label={`Route ${r.number} utilization ${u} percent`} />
                    </span>
                    <span className="w-20 shrink-0 text-right text-[11px] uppercase tracking-wide text-charcoal-400">{r.status}</span>
                  </button>
                )
              })}
            </div>
          </Panel>

          {/* ---------------------------------------------- order pressure */}
          <Panel title="Order pressure" subtitle="Where the queue is tight right now">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Small label="Awaiting routing" value={String(orderPressure.awaitingRouting)} />
              <Small label="Incomplete information" value={String(orderPressure.incompleteInformation)} tone="warning" />
              <Small label="Changed after routing" value={String(orderPressure.lateChanges)} tone="warning" />
              <Small label="Cutoff risk" value={String(orderPressure.cutoffRisk)} tone="warning" />
              <Small label="On hold" value={String(orderPressure.onHold)} />
            </div>
            <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-charcoal-500">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Branch cutoff is {branch.cutoffLocal}. Orders still carrying incomplete information at cutoff become tomorrow’s manual corrections.
            </p>
          </Panel>
        </div>
      </div>

      {/* --------------------------------------------------- management brief */}
      <Panel
        title="Management brief"
        subtitle="Plain language, with every statement traceable"
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setBriefOpen((v) => !v)} aria-expanded={briefOpen}>
            <Search className="h-3.5 w-3.5" aria-hidden /> {briefOpen ? 'Hide the evidence' : 'Show me why'}
          </button>
        }
      >
        <p className="pres-body max-w-5xl text-[15px] leading-relaxed text-charcoal-800">{managementBrief.summary}</p>

        {briefOpen && (
          <div className="mt-5 animate-fade-up space-y-3">
            {managementBrief.traces.map((t) => (
              <div key={t.claim} className="rounded-[3px] border border-charcoal-200 bg-charcoal-50/60 p-4">
                <h4 className="text-sm font-semibold text-charcoal-900">{t.claim}</h4>
                <p className="mt-1.5 font-mono text-[12px] leading-relaxed text-charcoal-600">{t.evidence}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {t.routeIds.map((rid) => (
                    <button
                      key={rid}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setHighlight(t.orderIds)
                        select('route', rid)
                      }}
                    >
                      {routeLabel(rid)} <ArrowRight className="h-3 w-3" aria-hidden />
                    </button>
                  ))}
                  {t.orderIds.map((oid) => (
                    <button key={oid} type="button" className="btn btn-secondary btn-sm font-mono" onClick={() => select('order', oid)}>
                      {oid}
                    </button>
                  ))}
                  {t.recommendationIds.map((rid) => (
                    <button key={rid} type="button" className="btn btn-secondary btn-sm" onClick={() => select('recommendation', rid)}>
                      {rid}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {highlight.length > 0 && (
              <p className="text-[12px] text-charcoal-500">
                Highlighted orders: <span className="font-mono">{highlight.join(', ')}</span>
              </p>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Routes at a glance" subtitle="Select any route to open its full detail" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-charcoal-200 text-left">
                {['Route', 'Corridor', 'Mode', 'Stops', 'Miles', 'Weight', 'Utilization', 'Status'].map((h) => (
                  <th key={h} scope="col" className="label-caps px-4 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const u = utilization(r)
                return (
                  <tr key={r.id} className="data-row cursor-pointer hover:bg-charcoal-50" onClick={() => select('route', r.id)}>
                    <td className="px-4 py-2.5 font-mono font-semibold">
                      <span className="flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-charcoal-400" aria-hidden /> Route {r.number}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-charcoal-600">{r.corridor}</td>
                    <td className="px-4 py-2.5">
                      <Chip tone={r.mode === 'Private fleet' ? 'green' : 'timber'}>{r.mode}</Chip>
                    </td>
                    <td className="px-4 py-2.5 text-charcoal-600">
                      {r.stops.length} — {r.stops.map((s) => locationCity(s.locationId)).join(', ')}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{r.plannedMiles}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{r.weightLbs.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">{u}%</td>
                    <td className="px-4 py-2.5">
                      <SeverityChip
                        severity={r.health === 'ok' ? 'resolved' : r.health === 'attention' ? 'warning' : 'critical'}
                        label={r.status}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function Small({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'warning' }) {
  return (
    <div className="rounded-[3px] border border-charcoal-200 px-3 py-2">
      <div className="label-caps leading-tight">{label}</div>
      <div className={`mt-1 font-mono text-lg font-semibold ${tone === 'warning' ? 'text-alert-warn' : 'text-charcoal-900'}`}>{value}</div>
    </div>
  )
}
