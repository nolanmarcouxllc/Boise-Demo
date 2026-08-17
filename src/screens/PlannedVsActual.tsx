import { Check, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { RecommendationCard } from '../components/RecommendationCard'
import { Chip, ConfirmDialog, Panel, SectionHeading } from '../components/ui'
import { berkshireServiceHistory, locationName, performanceHistory, recommendationById, routeById } from '../data'
import { useApp } from '../state/AppContext'

const AXIS = { fontSize: 11, fill: '#6d7474' }

export function PlannedVsActual() {
  const { addNote, recordDecision, decisions } = useApp()
  const [confirm, setConfirm] = useState(false)
  const [applied, setApplied] = useState(false)
  const route = routeById.get('RT-03')!
  const rec = recommendationById.get('REC-022')!

  // Keeps the button in step when the same decision was recorded on another screen.
  useEffect(() => {
    if (decisions[rec.id] === 'approved') setApplied(true)
  }, [decisions, rec.id])

  const mileageData = performanceHistory.map((d) => ({
    label: d.label,
    Planned: d.plannedMiles,
    Actual: d.actualMiles,
  }))
  const timeData = performanceHistory.map((d) => ({
    label: d.label,
    'On-time %': d.onTimePct,
    'Utilization %': d.utilizationPct,
  }))

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 4 · Execution creates new information"
        title="Planned versus actual"
        blurb="What was expected against what actually happened — at the route level and the stop level. The value is not the variance. It is the repeated cause behind it."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel title={`Route ${route.number} — ${route.name}`} subtitle={`${route.date} · completed`} bodyClassName="p-0">
          <div className="grid grid-cols-2 gap-px bg-charcoal-200 sm:grid-cols-4">
            <Compare label="Miles" planned={String(route.plannedMiles)} actual={String(route.actualMiles)} delta="+6" />
            <Compare
              label="Duration"
              planned={`${Math.floor(route.plannedDurationMin / 60)}h ${route.plannedDurationMin % 60}m`}
              actual={`${Math.floor((route.actualDurationMin ?? 0) / 60)}h ${(route.actualDurationMin ?? 0) % 60}m`}
              delta="+71 min"
              bad
            />
            <Compare label="Departure" planned={route.plannedDepart} actual={route.actualDepart ?? '—'} delta="+5 min" />
            <Compare label="Stops completed" planned={String(route.stops.length)} actual={String(route.stops.length)} delta="0" good />
          </div>

          <div className="p-4">
            <div className="label-caps mb-2">Stop-level comparison</div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-charcoal-200 text-left">
                  {['Seq', 'Location', 'Planned', 'Actual', 'Service planned', 'Service actual', 'Variance'].map((h) => (
                    <th key={h} scope="col" className="label-caps py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {route.stops.map((s) => {
                  const plannedSvc = s.serviceMinutes
                  const actualSvc =
                    s.actualArrival && s.actualDepart
                      ? toMin(s.actualDepart) - toMin(s.actualArrival)
                      : plannedSvc
                  const variance = actualSvc - plannedSvc
                  return (
                    <tr key={s.seq} className="data-row">
                      <td className="py-2 font-mono">{s.seq}</td>
                      <td className="py-2">{locationName(s.locationId)}</td>
                      <td className="py-2 font-mono text-charcoal-500">
                        {s.plannedArrival}–{s.plannedDepart}
                      </td>
                      <td className="py-2 font-mono">
                        {s.actualArrival}–{s.actualDepart}
                      </td>
                      <td className="py-2 text-right font-mono tabular-nums">{plannedSvc}</td>
                      <td className="py-2 text-right font-mono tabular-nums">{actualSvc}</td>
                      <td className={`py-2 text-right font-mono tabular-nums font-semibold ${variance > 15 ? 'text-alert-critical' : 'text-charcoal-600'}`}>
                        {variance > 0 ? '+' : ''}
                        {variance}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="mt-4 rounded-[3px] border-l-[3px] border-alert-warn bg-alert-warn/5 px-4 py-3">
              <div className="label-caps mb-1 text-alert-warn">Insight</div>
              <p className="pres-body text-sm leading-relaxed text-charcoal-800">
                Route 3 exceeded planned duration by 71 minutes. Forty-eight minutes occurred at one delivery location that has exceeded expected
                service time on four of its last six simulated deliveries.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setConfirm(true)} disabled={applied}>
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden /> {applied ? 'Sent for approval' : 'Use this in the next plan'}
                </button>
                {applied && (
                  <span className="flex items-center gap-1 text-[13px] text-forest-700">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Recorded — the change still needs a supervisor’s approval.
                  </span>
                )}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-charcoal-500">
                Historical outcomes can improve future planning rules — after a person approves the change. Actual outcomes should improve the next plan.
              </p>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Service time at the flagged location" subtitle="Last six simulated deliveries against a 55-minute plan">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={berkshireServiceHistory} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e5e5" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#c4c8c8' }} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} unit="m" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 3, border: '1px solid #c4c8c8' }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="planned" name="Planned" fill="#9aa0a0" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#b46a06" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-charcoal-500">
              Four of six deliveries exceeded plan. Average actual service time is 81 minutes against a 55-minute planning value.
            </p>
          </Panel>

          <Panel title="Recommendation raised from this pattern">
            <RecommendationCard rec={rec} compact />
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Planned versus actual miles" subtitle="14 simulated service days">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mileageData} margin={{ top: 8, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e5e5" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#c4c8c8' }} interval={0} angle={-35} textAnchor="end" height={54} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 3, border: '1px solid #c4c8c8' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Planned" fill="#7fa889" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Actual" fill="#215733" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[12px] text-charcoal-500">
            Actual miles exceeded plan on every day in the window. The consistency is the finding — a one-off gap would not be worth a planning change.
          </p>
        </Panel>

        <Panel title="On-time performance and utilization" subtitle="14 simulated service days">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 8, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e5e5" vertical={false} />
                <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={{ stroke: '#c4c8c8' }} interval={0} angle={-35} textAnchor="end" height={54} />
                <YAxis tick={AXIS} tickLine={false} axisLine={false} domain={[60, 100]} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 3, border: '1px solid #c4c8c8' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="On-time %" stroke="#215733" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Utilization %" stroke="#8f6a3a" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="6 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[12px] text-charcoal-500">
            On-time performance falls on the heaviest days. That is the pattern the consolidation and capacity work is meant to address.
          </p>
        </Panel>
      </div>

      <Panel title="Repeated causes across the window" subtitle="Grouped from simulated exception records">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { cause: 'Service time exceeded plan', count: 21, note: 'Concentrated at four locations without a forklift on site.' },
            { cause: 'Late departure from the yard', count: 14, note: 'Most often equipment released late from maintenance.' },
            { cause: 'Order changed after routing', count: 9, note: 'Load plan reissued or the change absorbed at the dock.' },
            { cause: 'Truck-legal detour', count: 7, note: 'Posted weight limit on the Berkshire corridor.' },
          ].map((c) => (
            <div key={c.cause} className="rounded-[3px] border border-charcoal-200 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold">{c.cause}</span>
                <span className="font-mono text-lg font-semibold text-charcoal-900">{c.count}</span>
              </div>
              <p className="mt-1 text-[12px] leading-snug text-charcoal-500">{c.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-charcoal-600">
          <Chip tone="green">Better inputs create better routes.</Chip>
        </p>
      </Panel>

      <ConfirmDialog
        open={confirm}
        title="Send this planning change for approval?"
        body={
          <p>
            This records a request to raise the planned service time at the flagged location from 55 to 95 minutes. In a production system the change
            would take effect only after {rec.requiredApprover} approves it. Here it records the decision in the demonstration and nothing else.
          </p>
        }
        confirmLabel="Send for approval"
        onConfirm={() => {
          recordDecision(rec.id, 'approved', 'Sent from the planned-versus-actual view during the walkthrough.')
          addNote({
            section: 'What we understood correctly',
            text: 'Planning rule proposed: raise service time at the flagged Berkshire location from 55 to 95 minutes, pending supervisor approval.',
            kind: 'assumption',
            owner: 'Transportation Supervisor',
            priority: 'Medium',
          })
          setApplied(true)
          setConfirm(false)
        }}
        onCancel={() => setConfirm(false)}
      />
    </div>
  )
}

function toMin(t: string): number {
  return Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
}

function Compare({
  label,
  planned,
  actual,
  delta,
  bad = false,
  good = false,
}: {
  label: string
  planned: string
  actual: string
  delta: string
  bad?: boolean
  good?: boolean
}) {
  return (
    <div className="bg-white px-4 py-3">
      <div className="label-caps leading-tight">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-sm text-charcoal-400 line-through decoration-charcoal-300">{planned}</span>
        <span className="font-mono text-lg font-semibold text-charcoal-900">{actual}</span>
      </div>
      <div className={`mt-0.5 font-mono text-[12px] ${bad ? 'text-alert-critical' : good ? 'text-forest-700' : 'text-charcoal-500'}`}>{delta}</div>
    </div>
  )
}
