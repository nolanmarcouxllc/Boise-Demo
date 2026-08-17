import { useMemo, useState } from 'react'
import type { Detail } from '../Drawer'
import { Bar, ViewPanel } from './shared'
import { StatusChip } from './StatusChip'

const BASE = [
  { id: 'RT-101', label: 'Route 101', stops: 9, miles: 96, weight: 24000, area: 'Southwick / Agawam' },
  { id: 'RT-102', label: 'Route 102', stops: 8, miles: 74, weight: 18000, area: 'Westfield / West Springfield' },
  { id: 'RT-103', label: 'Route 103', stops: 11, miles: 128, weight: 26000, area: 'Holyoke / Chicopee' },
  { id: 'RT-104', label: 'Route 104', stops: 7, miles: 82, weight: 20000, area: 'Westfield / Holyoke' },
  { id: 'RT-105', label: 'Route 105', stops: 6, miles: 112, weight: 15000, area: 'Northern corridor' },
]

/** Share of planned miles the consolidation proposals put under review. */
const CONSOLIDATION_RATE = 0.14

function plan(ids: string[], capacity: number, consolidate: boolean) {
  const active = BASE.filter((b) => ids.includes(b.id))
  const miles = active.reduce((s, b) => s + b.miles, 0)
  const stops = active.reduce((s, b) => s + b.stops, 0)
  const weight = active.reduce((s, b) => s + b.weight, 0)
  const trucks = Math.max(1, Math.ceil(weight / capacity))
  const saved = consolidate ? Math.round(miles * CONSOLIDATION_RATE) : 0
  const finalTrucks = consolidate ? Math.max(1, trucks - 1) : trucks
  return {
    miles: miles - saved,
    stops,
    weight,
    trucks: finalTrucks,
    saved,
    util: finalTrucks ? Math.round((weight / (finalTrucks * capacity)) * 100) : 0,
  }
}

function Delta({ from, to, lowerIsBetter = true }: { from: number; to: number; lowerIsBetter?: boolean }) {
  const d = to - from
  if (d === 0) return <span className="num text-[10.5px] text-inkFaint">no change</span>
  const good = lowerIsBetter ? d < 0 : d > 0
  return (
    <span className="num text-[10.5px] font-semibold" style={{ color: good ? '#148345' : '#D71920' }}>
      {d > 0 ? '+' : ''}
      {d}
    </span>
  )
}

export function RouteLabView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const [included, setIncluded] = useState<string[]>(BASE.map((b) => b.id))
  const [capacity, setCapacity] = useState(31000)
  const [consolidate, setConsolidate] = useState(false)

  const current = useMemo(() => plan(BASE.map((b) => b.id), 31000, false), [])
  const result = useMemo(() => plan(included, capacity, consolidate), [included, capacity, consolidate])
  const changed = included.length !== BASE.length || capacity !== 31000 || consolidate

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2.5" style={{ height: 470 }}>
      <ViewPanel title="Scenario inputs" right={<span className="meta">{included.length} of {BASE.length} routes</span>}>
        <div className="space-y-0.5">
          {BASE.map((b) => {
            const on = included.includes(b.id)
            return (
              <label key={b.id} className="flex cursor-pointer items-start gap-2.5 border-b border-lineSoft py-2 last:border-0">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setIncluded((p) => (on ? p.filter((x) => x !== b.id) : [...p, b.id]))}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#0B4C29]"
                />
                <span className="min-w-0 flex-1">
                  <span className="cond block text-[12.5px] font-bold text-ink">{b.label}</span>
                  <span className="block truncate text-[10.5px] text-inkFaint">{b.area}</span>
                </span>
                <span className="num shrink-0 text-right text-[11px] leading-tight text-inkSoft">
                  {b.stops} stops
                  <br />
                  {b.miles} mi · {(b.weight / 1000).toFixed(0)}K lbs
                </span>
              </label>
            )
          })}
        </div>

        <label className="mt-4 block">
          <span className="cond flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">
            Truck capacity
            <span className="num text-[12px] normal-case tracking-normal text-ink">{(capacity / 1000).toFixed(0)}K lbs</span>
          </span>
          <input
            type="range"
            min={18000}
            max={48000}
            step={1000}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="mt-1.5 w-full accent-[#0B4C29]"
          />
          <span className="mt-1 block text-[10.5px] leading-snug text-inkFaint">
            A branch-approved figure, not a legal limit. Boise sets the real number.
          </span>
        </label>

        <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-sm2 border border-line bg-shell px-3 py-2">
          <input
            type="checkbox"
            checked={consolidate}
            onChange={(e) => setConsolidate(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#0B4C29]"
          />
          <span className="min-w-0">
            <span className="block text-[12px] leading-snug text-ink">Apply the consolidation proposals awaiting review</span>
            <span className="mt-0.5 block text-[10.5px] leading-snug text-inkFaint">
              Removes {Math.round(CONSOLIDATION_RATE * 100)}% of planned miles and one vehicle, subject to dispatcher approval.
            </span>
          </span>
        </label>

        {changed && (
          <button
            type="button"
            onClick={() => {
              setIncluded(BASE.map((b) => b.id))
              setCapacity(31000)
              setConsolidate(false)
            }}
            className="cond mt-3 w-full rounded-sm2 border border-line px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-inkSoft hover:border-accent hover:text-accent"
          >
            Reset to today’s plan
          </button>
        )}
      </ViewPanel>

      <ViewPanel
        title="Modeled scenario"
        right={<span className="meta">{changed ? 'Modified' : "Today's plan"}</span>}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              <th className="cond pb-1 text-left text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Measure</th>
              <th className="cond pb-1 text-right text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Today</th>
              <th className="cond pb-1 text-right text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Modeled</th>
              <th className="cond pb-1 text-right text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Change</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Trucks required', current.trucks, result.trucks, true],
              ['Total miles', current.miles, result.miles, true],
              ['Stops served', current.stops, result.stops, false],
              ['Utilization %', current.util, Math.min(100, result.util), false],
            ].map(([label, from, to, lower]) => (
              <tr key={String(label)} className="border-b border-lineSoft last:border-0">
                <td className="py-2 text-[12px] text-ink">{label as string}</td>
                <td className="num py-2 text-right text-[13px] text-inkSoft">{from as number}</td>
                <td className="num py-2 text-right text-[17px] font-bold text-ink">{to as number}</td>
                <td className="py-2 text-right">
                  <Delta from={from as number} to={to as number} lowerIsBetter={lower as boolean} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4">
          <div className="cond mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">
            Load against capacity
            <span className="num normal-case tracking-normal text-ink">
              {(result.weight / 1000).toFixed(0)}K of {((result.trucks * capacity) / 1000).toFixed(0)}K lbs
            </span>
          </div>
          <Bar pct={Math.min(100, result.util)} />
        </div>

        <p className="mt-4 text-[11px] leading-snug text-inkFaint">
          Today’s column is the branch plan as loaded: all five routes at 31K lbs deck capacity. The modeled column reflects the inputs on the
          left.
        </p>
      </ViewPanel>
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2.5">
      <ViewPanel title="What this model does not tell you" right={<StatusChip status="DEMONSTRATION" />}>
        <p className="text-[12px] leading-snug text-ink">
          This is a simplified planning model built for the conversation. It compares a plan against a scenario so the trade-off is visible in the
          room. It is not an approved production optimization engine.
        </p>

        <div className="mt-3">
          <div className="cond mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">What it holds constant</div>
          <ul className="space-y-1.5">
            {[
              'Every stop stays inside its delivery window.',
              'Product on a combined load is compatible on one deck.',
              'Driver hours and yard capacity are unchanged.',
              'Mileage scales with the corridor, not with real road geometry.',
            ].map((t) => (
              <li key={t} className="flex gap-2 text-[11.5px] leading-snug text-inkSoft">
                <span aria-hidden className="mt-[6px] h-[4px] w-[4px] shrink-0 rounded-full bg-inkFaint" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3">
          <div className="cond mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Who decides</div>
          <ul className="space-y-1.5">
            {[
              ['Trimble / PC*MILER', 'remains the routing engine. Approved scenarios go to it, not around it.'],
              ['The dispatcher', 'accepts or rejects. Nothing here applies itself to a live plan.'],
              ['Boise', 'sets the capacity, window and compatibility rules this model borrows.'],
            ].map(([who, what]) => (
              <li key={who} className="text-[11.5px] leading-snug text-inkSoft">
                <span className="font-semibold text-ink">{who}</span> {what}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 rounded-sm2 border-l-[3px] border-accent bg-shell px-3 py-2 text-[11.5px] leading-snug text-inkSoft">
          Mileage and truck counts here are candidates for review, not committed savings. A committed number needs a Boise baseline that does not
          exist yet.
        </p>
      </ViewPanel>

      <ViewPanel
        title="Route by route"
        right={<span className="meta">Deck capacity {(capacity / 1000).toFixed(0)}K lbs</span>}
        bodyClass="p-0"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {['Route', 'Service area', 'Stops', 'Miles', 'Weight', 'Load against deck', 'In scenario'].map((h) => (
                <th key={h} className="cond px-3 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BASE.map((b) => {
              const on = included.includes(b.id)
              const deck = Math.round((b.weight / capacity) * 100)
              return (
                <tr key={b.id} className={`border-b border-lineSoft last:border-0 ${on ? '' : 'opacity-45'}`}>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onOpen({ kind: 'route', id: b.id })}
                      className="cond text-[12.5px] font-bold text-ink hover:text-accent"
                    >
                      {b.label}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-[11.5px] text-inkSoft">{b.area}</td>
                  <td className="num px-3 py-3 text-[12px] text-ink">{b.stops}</td>
                  <td className="num px-3 py-3 text-[12px] text-ink">{b.miles}</td>
                  <td className="num px-3 py-3 text-[12px] text-ink">{(b.weight / 1000).toFixed(0)}K lbs</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-[150px] shrink-0">
                        <Bar pct={deck} tone={deck > 100 ? '#D71920' : '#0B4C29'} />
                      </span>
                      <span className="num text-[11.5px]" style={{ color: deck > 100 ? '#D71920' : '#667069' }}>
                        {deck}%{deck > 100 ? ' — over deck' : ''}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`cond text-[10.5px] font-bold uppercase tracking-[0.07em] ${on ? 'text-accent' : 'text-inkFaint'}`}>
                      {on ? 'Included' : 'Excluded'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="px-3 py-2 text-[11px] leading-snug text-inkFaint">
          Load against deck compares each route’s weight to the capacity set on the left. A route over 100% would need a second vehicle or a
          different mode — the decision a dispatcher makes, not one this model makes for them.
        </p>
      </ViewPanel>
      </div>
    </div>
  )
}
