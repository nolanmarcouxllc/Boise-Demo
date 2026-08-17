import { Fragment, useState } from 'react'
import { capabilities } from '../capabilities'
import type { Detail } from '../Drawer'
import { StatusLegend } from './StatusChip'
import { ViewPanel } from './shared'

const COLS = ['Capability', 'Unique question answered', 'Department', 'System supported', 'New value added', 'Decision owner', 'Measurement', 'Validation']

export function CapabilityValueMapView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="panel shrink-0 px-3.5 py-2.5">
        <StatusLegend />
      </div>

      <ViewPanel
        title="Capability value map"
        right={<span className="meta">No two capabilities answer the same question</span>}
        bodyClass="p-0"
      >
        <table className="w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-line">
              <th className="cond w-[13%] px-3 py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[0]}</th>
              <th className="cond w-[19%] py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[1]}</th>
              <th className="cond w-[11%] py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[2]}</th>
              <th className="cond w-[11%] py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[3]}</th>
              <th className="cond w-[16%] py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[4]}</th>
              <th className="cond w-[11%] py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[5]}</th>
              <th className="cond w-[11%] py-1.5 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[6]}</th>
              <th className="cond py-1.5 pr-3 text-left text-[9.5px] font-bold uppercase tracking-[0.08em] text-inkFaint">{COLS[7]}</th>
            </tr>
          </thead>
          <tbody>
            {capabilities.map((c) => (
              <Fragment key={c.key}>
                <tr className="border-b border-lineSoft align-top hover:bg-shell">
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => onOpen({ kind: 'capability', id: c.key })} className="text-left">
                      <span className="num cond mr-1 text-[10px] text-inkFaint">{String(c.n).padStart(2, '0')}</span>
                      <span className="cond text-[11.5px] font-bold text-ink hover:text-accent">{c.short}</span>
                    </button>
                  </td>
                  <td className="py-2 pr-2 text-[11px] leading-snug text-ink">{c.question}</td>
                  <td className="py-2 pr-2 text-[10.5px] leading-snug text-inkSoft">{c.department}</td>
                  <td className="py-2 pr-2 text-[10.5px] leading-snug text-inkSoft">{c.supportsSystem}</td>
                  <td className="py-2 pr-2 text-[10.5px] leading-snug text-inkSoft">{c.newValue}</td>
                  <td className="py-2 pr-2 text-[10.5px] leading-snug text-inkSoft">{c.owner}</td>
                  <td className="py-2 pr-2 text-[10.5px] leading-snug text-inkSoft">{c.measurement}</td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === c.key ? null : c.key)}
                      aria-expanded={expanded === c.key}
                      className="cond text-[10px] font-bold uppercase tracking-[0.06em] text-info hover:underline"
                    >
                      {expanded === c.key ? 'Hide' : 'Why different'}
                    </button>
                  </td>
                </tr>
                {expanded === c.key && (
                  <tr className="border-b border-lineSoft bg-shell">
                    <td colSpan={8} className="px-3 py-2.5">
                      <div className="cond mb-1 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">
                        Why this is different from what Agility or Trimble may already provide
                      </div>
                      <p className="max-w-[150ch] text-[11.5px] leading-snug text-ink">{c.vsExisting}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </ViewPanel>
    </div>
  )
}
