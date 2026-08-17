import { useMemo, useState } from 'react'
import { Bar, Stat, ViewPanel } from './shared'

const BASE = [
  { id: 'RT-101', label: 'Route 101', stops: 9, miles: 96, weight: 24000 },
  { id: 'RT-102', label: 'Route 102', stops: 8, miles: 74, weight: 18000 },
  { id: 'RT-103', label: 'Route 103', stops: 11, miles: 128, weight: 26000 },
  { id: 'RT-104', label: 'Route 104', stops: 7, miles: 82, weight: 20000 },
  { id: 'RT-105', label: 'Route 105', stops: 6, miles: 112, weight: 15000 },
]

export function RouteLabView() {
  const [included, setIncluded] = useState<string[]>(BASE.map((b) => b.id))
  const [capacity, setCapacity] = useState(31000)
  const [consolidate, setConsolidate] = useState(false)

  const result = useMemo(() => {
    const active = BASE.filter((b) => included.includes(b.id))
    const miles = active.reduce((s, b) => s + b.miles, 0)
    const stops = active.reduce((s, b) => s + b.stops, 0)
    const weight = active.reduce((s, b) => s + b.weight, 0)
    const trucks = Math.max(1, Math.ceil(weight / capacity))
    const saved = consolidate ? Math.round(miles * 0.14) : 0
    return { miles: miles - saved, stops, weight, trucks: consolidate ? Math.max(1, trucks - 1) : trucks, saved, util: Math.round((weight / (trucks * capacity)) * 100) }
  }, [included, capacity, consolidate])

  return (
    <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2.5">
      <ViewPanel title="Scenario inputs">
        <div className="space-y-1">
          {BASE.map((b) => {
            const on = included.includes(b.id)
            return (
              <label key={b.id} className="flex cursor-pointer items-center gap-3 border-b border-lineSoft py-2 last:border-0">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setIncluded((p) => (on ? p.filter((x) => x !== b.id) : [...p, b.id]))}
                  className="h-4 w-4 accent-[#0B4C29]"
                />
                <span className="cond min-w-0 flex-1 text-[12.5px] font-bold text-ink">{b.label}</span>
                <span className="num text-[11.5px] text-inkSoft">{b.stops} stops · {b.miles} mi · {(b.weight / 1000).toFixed(0)}K lbs</span>
              </label>
            )
          })}
        </div>

        <label className="mt-4 block">
          <span className="cond flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">
            Truck capacity <span className="num text-[12px] normal-case tracking-normal text-ink">{(capacity / 1000).toFixed(0)}K lbs</span>
          </span>
          <input type="range" min={18000} max={48000} step={1000} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="mt-1.5 w-full accent-[#0B4C29]" />
        </label>

        <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-sm2 border border-line bg-shell px-3 py-2">
          <input type="checkbox" checked={consolidate} onChange={(e) => setConsolidate(e.target.checked)} className="h-4 w-4 accent-[#0B4C29]" />
          <span className="text-[12px] text-ink">Apply the consolidation proposals awaiting review</span>
        </label>
      </ViewPanel>

      <ViewPanel title="Resulting plan" right={<span className="meta">Illustrative model</span>}>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Trucks required" value={String(result.trucks)} />
          <Stat label="Total miles" value={String(result.miles)} sub={result.saved ? `${result.saved} removed` : undefined} />
          <Stat label="Stops" value={String(result.stops)} />
          <Stat label="Utilization" value={`${Math.min(100, result.util)}%`} />
        </div>
        <div className="mt-4">
          <div className="cond mb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-inkFaint">Load against capacity</div>
          <Bar pct={Math.min(100, result.util)} />
        </div>
        <p className="mt-4 rounded-sm2 border border-line bg-shell px-3 py-2 text-[11.5px] leading-snug text-inkSoft">
          A simplified planning model built for the conversation. It is not an approved production optimization engine, and it does not replace the
          branch routing system.
        </p>
      </ViewPanel>
    </div>
  )
}
