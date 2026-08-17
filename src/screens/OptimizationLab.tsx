import { AlertTriangle, Plus, RotateCcw, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Chip, Panel, ProgressBar, SectionHeading } from '../components/ui'
import { locationById, locationName, orders } from '../data'
import { plan, type LabOrder, type LabSettings } from '../lib/optimize'

const SEED_IDS = [
  'DEMO-10482',
  'DEMO-10491',
  'DEMO-10503',
  'DEMO-10484',
  'DEMO-10499',
  'DEMO-10486',
  'DEMO-10519',
  'DEMO-10521',
  'DEMO-10529',
]

function seedOrders(): LabOrder[] {
  return SEED_IDS.map((id) => {
    const o = orders.find((x) => x.id === id)!
    const loc = locationById.get(o.locationId)!
    return {
      id: o.id,
      label: `${o.id} · ${loc.city}`,
      locationId: o.locationId,
      weightLbs: o.totalWeightLbs,
      serviceMinutes: loc.avgServiceMinutes,
      windowStart: o.window[0],
      windowEnd: o.window[1],
      privateOnly: o.fleetEligibility === 'Private fleet only',
      thirdPartyEligible: o.fleetEligibility !== 'Private fleet only',
      requiresPiggyback: loc.unloadEquipment === 'Piggyback required',
      requiresBoom: loc.unloadEquipment === 'Boom truck required',
      maxTruckFt: loc.restrictions.some((r) => r.includes('48 ft')) ? 48 : 53,
      included: true,
      day: 'today',
    }
  })
}

const DEFAULT_SETTINGS: LabSettings = {
  capacityLbs: 46000,
  trucksAvailable: 4,
  costPerMile: 2.92,
  avgSpeedMph: 38,
  departHour: 6.5,
  maxStopsPerRoute: 3,
}

export function OptimizationLab() {
  const [labOrders, setLabOrders] = useState<LabOrder[]>(seedOrders)
  const [settings, setSettings] = useState<LabSettings>(DEFAULT_SETTINGS)
  const [changeApplied, setChangeApplied] = useState(false)

  const baseline = useMemo(() => plan(seedOrders(), DEFAULT_SETTINGS), [])
  const result = useMemo(() => plan(labOrders, settings), [labOrders, settings])

  const update = (id: string, patch: Partial<LabOrder>) => setLabOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  const reset = () => {
    setLabOrders(seedOrders())
    setSettings(DEFAULT_SETTINGS)
    setChangeApplied(false)
  }

  const triggerChange = () => {
    setLabOrders((prev) =>
      prev.map((o) => (o.id === 'DEMO-10503' ? { ...o, weightLbs: o.weightLbs + 6 * 70, serviceMinutes: o.serviceMinutes + 10 } : o)),
    )
    setChangeApplied(true)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 3 · A sandbox, not a routing engine"
        title="Route optimization lab"
        blurb="Change the inputs and watch the tradeoffs move. This is a simplified planning model built for the conversation — it is illustrative and is not an approved production optimization engine."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <Outcome label="Trucks required" value={String(result.trucksRequired)} base={baseline.trucksRequired} invert />
        <Outcome label="Total miles" value={String(result.totalMiles)} base={baseline.totalMiles} invert />
        <Outcome label="Avg. utilization" value={`${result.averageUtilization}%`} base={baseline.averageUtilization} />
        <Outcome label="Est. transport cost" value={`$${result.totalCost.toLocaleString()}`} base={baseline.totalCost} invert />
        <Outcome label="On-time confidence" value={`${result.onTimeConfidence}%`} base={baseline.onTimeConfidence} />
        <Outcome label="Driver hours" value={`${result.driverHours}`} base={baseline.driverHours} invert />
        <Outcome label="Service risks" value={String(result.serviceRisks.length)} base={baseline.serviceRisks.length} invert />
        <Outcome label="Overlapping routes" value={String(result.overlappingRoutes)} base={baseline.overlappingRoutes} invert />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* ---------------------------------------------------- controls */}
        <Panel
          title="Orders in the scenario"
          subtitle="Add or remove orders, change dates, windows, service time and restrictions"
          actions={
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={triggerChange} disabled={changeApplied}>
                <Zap className="h-3.5 w-3.5" aria-hidden /> Trigger a last-minute change
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demonstration
              </button>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-[13px]">
              <thead>
                <tr className="border-b border-charcoal-200 text-left">
                  {['In', 'Order', 'Day', 'Window', 'Service', 'Weight', 'Fleet rule', 'Equipment'].map((h) => (
                    <th key={h} scope="col" className="label-caps px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labOrders.map((o) => (
                  <tr key={o.id} className={`data-row ${o.included ? '' : 'opacity-45'}`}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={o.included}
                        onChange={(e) => update(o.id, { included: e.target.checked })}
                        aria-label={`Include ${o.id}`}
                        className="h-4 w-4 accent-[#215733]"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="block font-mono text-[12px] font-semibold">{o.id}</span>
                      <span className="block text-[11px] text-charcoal-500">{locationName(o.locationId)}</span>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={o.day}
                        onChange={(e) => update(o.id, { day: e.target.value as LabOrder['day'] })}
                        aria-label={`Requested day for ${o.id}`}
                        className="rounded-[3px] border border-charcoal-300 px-1.5 py-1 text-[12px]"
                      >
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1">
                        <input
                          type="time"
                          value={o.windowStart}
                          onChange={(e) => update(o.id, { windowStart: e.target.value })}
                          aria-label={`Window start for ${o.id}`}
                          className="w-[92px] rounded-[3px] border border-charcoal-300 px-1.5 py-1 font-mono text-[12px]"
                        />
                        <input
                          type="time"
                          value={o.windowEnd}
                          onChange={(e) => update(o.id, { windowEnd: e.target.value })}
                          aria-label={`Window end for ${o.id}`}
                          className="w-[92px] rounded-[3px] border border-charcoal-300 px-1.5 py-1 font-mono text-[12px]"
                        />
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={10}
                        max={180}
                        step={5}
                        value={o.serviceMinutes}
                        onChange={(e) => update(o.id, { serviceMinutes: Number(e.target.value) })}
                        aria-label={`Service minutes for ${o.id}`}
                        className="w-16 rounded-[3px] border border-charcoal-300 px-1.5 py-1 font-mono text-[12px]"
                      />
                    </td>
                    <td className="px-3 py-2 font-mono tabular-nums">{o.weightLbs.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <select
                        value={o.privateOnly ? 'private' : 'either'}
                        onChange={(e) => update(o.id, { privateOnly: e.target.value === 'private', thirdPartyEligible: e.target.value !== 'private' })}
                        aria-label={`Fleet rule for ${o.id}`}
                        className="rounded-[3px] border border-charcoal-300 px-1.5 py-1 text-[12px]"
                      >
                        <option value="either">Third party eligible</option>
                        <option value="private">Private fleet only</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <span className="flex flex-wrap gap-1">
                        <label className="flex items-center gap-1 text-[11px]">
                          <input
                            type="checkbox"
                            checked={o.requiresPiggyback}
                            onChange={(e) => update(o.id, { requiresPiggyback: e.target.checked })}
                            className="h-3.5 w-3.5 accent-[#215733]"
                          />
                          Piggyback
                        </label>
                        <label className="flex items-center gap-1 text-[11px]">
                          <input
                            type="checkbox"
                            checked={o.requiresBoom}
                            onChange={(e) => update(o.id, { requiresBoom: e.target.checked })}
                            className="h-3.5 w-3.5 accent-[#215733]"
                          />
                          Boom
                        </label>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 border-t border-charcoal-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Slider
              label="Truck capacity"
              value={settings.capacityLbs}
              min={18000}
              max={48000}
              step={2000}
              suffix=" lbs"
              onChange={(v) => setSettings((s) => ({ ...s, capacityLbs: v }))}
            />
            <Slider
              label="Trucks available"
              value={settings.trucksAvailable}
              min={1}
              max={8}
              step={1}
              onChange={(v) => setSettings((s) => ({ ...s, trucksAvailable: v }))}
            />
            <Slider
              label="Max stops per route"
              value={settings.maxStopsPerRoute}
              min={1}
              max={6}
              step={1}
              onChange={(v) => setSettings((s) => ({ ...s, maxStopsPerRoute: v }))}
            />
            <Slider
              label="Cost per mile"
              value={settings.costPerMile}
              min={2}
              max={5}
              step={0.05}
              prefix="$"
              decimals={2}
              onChange={(v) => setSettings((s) => ({ ...s, costPerMile: v }))}
            />
          </div>
        </Panel>

        {/* ---------------------------------------------------- result */}
        <div className="space-y-4">
          <Panel title="Resulting plan" subtitle={`${result.trucksRequired} route(s) from ${labOrders.filter((o) => o.included && o.day === 'today').length} orders`}>
            {result.routes.length === 0 ? (
              <p className="text-sm text-charcoal-500">No orders are scheduled for today in this scenario.</p>
            ) : (
              <ol className="space-y-3">
                {result.routes.map((r) => (
                  <li key={r.index} className="rounded-[3px] border border-charcoal-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Proposed route {r.index}</span>
                      <span className="font-mono text-[12px] text-charcoal-500">
                        {r.miles} mi · {Math.floor(r.durationMin / 60)}h {r.durationMin % 60}m
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar pct={r.utilizationPct} tone={r.utilizationPct > 92 ? 'amber' : 'green'} />
                    </div>
                    <ul className="mt-2 space-y-1">
                      {r.orderIds.map((id, i) => {
                        const o = labOrders.find((x) => x.id === id)
                        return (
                          <li key={id} className="flex items-center gap-2 text-[12px] text-charcoal-600">
                            <span className="font-mono text-charcoal-400">{i + 1}</span>
                            <span className="font-mono">{id}</span>
                            <span className="truncate">{o ? locationName(o.locationId) : ''}</span>
                          </li>
                        )
                      })}
                    </ul>
                    {r.lateStops > 0 && (
                      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-alert-critical">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {r.lateStops} stop(s) projected outside the delivery window
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {result.unplanned.length > 0 && (
              <p className="mt-3 rounded-[3px] border border-alert-warn/40 bg-alert-warn/5 px-3 py-2 text-[12px] text-alert-warn">
                {result.unplanned.length} order(s) could not be placed with the trucks available: {result.unplanned.join(', ')}. In a real branch this
                is the moment a carrier decision gets made.
              </p>
            )}
          </Panel>

          <Panel title="Service risk" subtitle="What this scenario would not solve on its own">
            {result.serviceRisks.length === 0 ? (
              <p className="text-sm text-charcoal-600">No window or equipment conflicts detected in this scenario.</p>
            ) : (
              <ul className="space-y-1.5">
                {result.serviceRisks.map((r) => (
                  <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-charcoal-700">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-alert-warn" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="How this model works" subtitle="Stated plainly, because the numbers only mean something with the method">
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-charcoal-600">
              <li className="flex gap-2">
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal-400" aria-hidden />
                Orders are grouped by bearing from the branch, then packed to the capacity and stop limits set above.
              </li>
              <li className="flex gap-2">
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal-400" aria-hidden />
                Stop order is nearest-neighbour from the yard. Distance is straight-line × 1.24 road factor at {settings.avgSpeedMph} mph average.
              </li>
              <li className="flex gap-2">
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal-400" aria-hidden />
                On-time confidence is the share of stops whose projected arrival lands inside the delivery window.
              </li>
              <li className="flex gap-2">
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-charcoal-400" aria-hidden />
                Equipment constraints are reported, never silently resolved.
              </li>
            </ul>
            <p className="mt-3 border-t border-charcoal-200 pt-3">
              <Chip tone="timber">Illustrative model — not an approved production optimization engine</Chip>
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Outcome({ label, value, base, invert = false }: { label: string; value: string; base: number; invert?: boolean }) {
  const numeric = Number(String(value).replace(/[^0-9.-]/g, ''))
  const delta = Number.isFinite(numeric) ? numeric - base : 0
  const better = invert ? delta < 0 : delta > 0
  const worse = invert ? delta > 0 : delta < 0
  return (
    <div className="panel p-3">
      <div className="label-caps leading-tight">{label}</div>
      <div className="mt-1.5 font-mono text-xl font-semibold tabular-nums text-charcoal-900">{value}</div>
      <div
        className={`mt-1 font-mono text-[11px] ${delta === 0 ? 'text-charcoal-400' : better ? 'text-forest-700' : worse ? 'text-alert-critical' : 'text-charcoal-400'}`}
      >
        {delta === 0 ? 'same as baseline' : `${delta > 0 ? '+' : ''}${Math.round(delta * 100) / 100} vs baseline`}
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  return (
    <label className="block">
      <span className="label-caps mb-1 flex items-center justify-between">
        {label}
        <span className="font-mono text-[12px] normal-case tracking-normal text-charcoal-700">
          {prefix}
          {value.toFixed(decimals)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#215733]"
      />
    </label>
  )
}
