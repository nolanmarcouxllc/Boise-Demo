import { performanceHistory } from '../../data'
import { Stat, ViewPanel } from './shared'

export function PlannedActualView() {
  const max = Math.max(...performanceHistory.map((d) => Math.max(d.plannedMiles, d.actualMiles)))
  const plannedTot = performanceHistory.reduce((s, d) => s + d.plannedMiles, 0)
  const actualTot = performanceHistory.reduce((s, d) => s + d.actualMiles, 0)
  const variance = (((actualTot - plannedTot) / plannedTot) * 100).toFixed(1)
  const onTime = Math.round(performanceHistory.reduce((s, d) => s + d.onTimePct, 0) / performanceHistory.length)

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="grid grid-cols-4 gap-2.5">
        <Stat label="Planned miles (14 days)" value={plannedTot.toLocaleString()} />
        <Stat label="Actual miles (14 days)" value={actualTot.toLocaleString()} sub={`${variance}% over plan`} />
        <Stat label="Average on-time" value={`${onTime}%`} />
        <Stat label="Days measured" value={String(performanceHistory.length)} />
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-2.5">
        <ViewPanel title="Planned versus actual miles">
          <div className="flex h-full min-h-0 items-end gap-2 pb-6 pt-2">
            {performanceHistory.map((d) => (
              <div key={d.date} className="relative flex h-full min-w-0 flex-1 items-end justify-center gap-[3px]">
                <div className="w-1/2 rounded-t-[2px] bg-[#9FC0A9]" style={{ height: `${(d.plannedMiles / max) * 100}%` }} title={`Planned ${d.plannedMiles}`} />
                <div className="w-1/2 rounded-t-[2px] bg-[#0B4C29]" style={{ height: `${(d.actualMiles / max) * 100}%` }} title={`Actual ${d.actualMiles}`} />
                <span className="absolute -bottom-5 whitespace-nowrap text-[9.5px] text-inkSoft">{d.label.split(' ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-4 text-[11px] text-inkSoft">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#9FC0A9]" /> Planned</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0B4C29]" /> Actual</span>
          </div>
        </ViewPanel>

        <ViewPanel title="Repeated causes" bodyClass="p-0">
          <ul>
            {[
              ['Service time exceeded plan', 21, 'Concentrated at four locations with no forklift on site.'],
              ['Late departure from the yard', 14, 'Most often equipment released late from maintenance.'],
              ['Order changed after routing', 9, 'Load plan reissued or absorbed at the dock.'],
              ['Truck-legal detour', 7, 'Posted weight limit on the Berkshire corridor.'],
            ].map(([cause, count, note]) => (
              <li key={cause as string} className="border-b border-lineSoft px-3.5 py-2.5 last:border-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-ink">{cause}</span>
                  <span className="num cond text-[17px] font-bold text-ink">{count}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-inkSoft">{note}</p>
              </li>
            ))}
          </ul>
        </ViewPanel>
      </div>
    </div>
  )
}
