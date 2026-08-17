import { carrierById, driverById, routes, truckById, utilization } from '../../data'
import type { Detail } from '../Drawer'
import { Bar, Stat, ViewPanel } from './shared'

export function TransportationView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const privateFleet = routes.filter((r) => r.mode === 'Private fleet').length
  const miles = routes.reduce((s, r) => s + r.plannedMiles, 0)
  const avg = Math.round(routes.reduce((s, r) => s + utilization(r), 0) / routes.length)

  return (
    <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-2.5">
      <ViewPanel title="Routes on the board" right={<span className="meta">{routes.length} modeled</span>} bodyClass="p-0">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-line">
              {['Route', 'Corridor', 'Mode', 'Equipment', 'Stops', 'Miles', 'Utilization', 'Status'].map((h) => (
                <th key={h} className="cond px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-inkFaint">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} onClick={() => onOpen({ kind: 'route', id: r.id })} className="cursor-pointer border-b border-lineSoft hover:bg-shell">
                <td className="cond px-3 py-[7px] text-[12px] font-bold text-ink">Route {r.number}</td>
                <td className="px-3 py-[7px] text-[11.5px] text-inkSoft">{r.corridor}</td>
                <td className="px-3 py-[7px] text-[11.5px] text-inkSoft">{r.mode}</td>
                <td className="px-3 py-[7px] text-[11.5px] text-inkSoft">
                  {r.truckId ? `Unit ${truckById.get(r.truckId)?.unit}` : r.carrierId ? carrierById.get(r.carrierId)?.name : '—'}
                  {r.driverId ? ` · ${driverById.get(r.driverId)?.name}` : ''}
                </td>
                <td className="num px-3 py-[7px] text-[11.5px] text-ink">{r.stops.length}</td>
                <td className="num px-3 py-[7px] text-[11.5px] text-ink">{r.plannedMiles}</td>
                <td className="px-3 py-[7px]"><span className="flex items-center gap-2"><Bar pct={utilization(r)} /><span className="num w-8 text-[11px] text-inkSoft">{utilization(r)}%</span></span></td>
                <td className="px-3 py-[7px] text-[11.5px]">
                  <span style={{ color: r.health === 'ok' ? '#148345' : r.health === 'attention' ? '#D98A00' : '#D71920' }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ViewPanel>

      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
        <ViewPanel title="Fleet summary">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Private routes" value={String(privateFleet)} />
            <Stat label="Carrier routes" value={String(routes.length - privateFleet)} />
            <Stat label="Planned miles" value={miles.toLocaleString()} />
            <Stat label="Avg utilization" value={`${avg}%`} />
          </div>
        </ViewPanel>
        <ViewPanel title="Equipment" bodyClass="p-0">
          <ul>
            {[...truckById.values()].map((t) => (
              <li key={t.id} className="border-b border-lineSoft px-3 py-2 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="cond text-[12px] font-bold text-ink">Unit {t.unit}</span>
                  <span className="text-[10.5px] text-inkSoft">{t.status}</span>
                </div>
                <div className="text-[11px] text-inkSoft">{t.type} · {t.capacityLbs.toLocaleString()} lbs · {t.deckLengthFt} ft</div>
              </li>
            ))}
          </ul>
        </ViewPanel>
      </div>
    </div>
  )
}
