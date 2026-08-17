import { useState } from 'react'
import type { Detail } from '../Drawer'
import { briefRows, toneHex } from '../data'
import { BriefIcon } from '../icons'
import { ViewPanel } from './shared'

const TRACE: Array<{ claim: string; calc: string; links: Array<{ label: string; detail: Detail }> }> = [
  {
    claim: 'Route 12 is projected to miss the Hadley job-site appointment by seven minutes.',
    calc: 'Planned departure 08:15 · actual 08:52 · 37 minutes late. Planned arrival 10:45 + 37 = 11:22 against a window closing at 11:15.',
    links: [{ label: 'Route 12', detail: { kind: 'route', id: 'RT-12' } }, { label: 'EXC-003', detail: { kind: 'exception', id: 'EXC-003' } }],
  },
  {
    claim: 'Route 5 is running a load plan that does not match the current order.',
    calc: 'Route generated 05:12. Order revised 05:41. Difference: 14 pieces, 714 lbs.',
    links: [{ label: 'Route 5', detail: { kind: 'route', id: 'RT-05' } }, { label: 'DEMO-10511', detail: { kind: 'order', id: 'DEMO-10511' } }],
  },
  {
    claim: '186 planned miles are under review for elimination across four proposals.',
    calc: '74 (Route 12 consolidation) + 42 (Worcester) + 28 (Windsor Locks) + 42 (Torrington) = 186 miles. Estimates, not committed savings.',
    links: [{ label: 'Avoidable miles', detail: { kind: 'metric', id: 'avoidable-miles' } }],
  },
]

export function ManagementBriefView({ onOpen }: { onOpen: (d: Detail) => void }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-2.5">
      <ViewPanel title="Morning brief" right={<span className="meta">Prepared 07:00</span>} bodyClass="p-0">
        <ul>
          {briefRows.map((b) => (
            <li key={b.title} className="border-b border-lineSoft px-3.5 py-3 last:border-0">
              <div className="flex gap-3">
                <span className="mt-0.5 shrink-0"><BriefIcon name={b.icon} color={toneHex[b.tone]} /></span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight text-ink">{b.title}</p>
                  <p className="mt-1 text-[12px] leading-snug text-inkSoft">{b.detail}</p>
                  <p className="mt-1.5 border-l-2 border-accent pl-2 text-[11.5px] leading-snug text-inkSoft">{b.why}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ViewPanel>

      <ViewPanel title="Trace every statement" right={<span className="meta">{TRACE.length} claims</span>} bodyClass="p-0">
        <ul>
          {TRACE.map((t, i) => (
            <li key={t.claim} className="border-b border-lineSoft last:border-0">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-start gap-2.5 px-3.5 py-2.5 text-left hover:bg-shell">
                <span aria-hidden className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-forest" />
                <span className="min-w-0 flex-1 text-[12.5px] font-medium leading-snug text-ink">{t.claim}</span>
                <span className="cond shrink-0 text-[10px] font-bold uppercase tracking-[0.08em] text-info">{open === i ? 'Hide' : 'Show'}</span>
              </button>
              {open === i && (
                <div className="mx-3.5 mb-3 rounded-sm2 border border-line bg-shell px-3 py-2.5">
                  <div className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Calculation</div>
                  <p className="num mt-0.5 text-[11.5px] leading-snug text-inkSoft">{t.calc}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.links.map((l) => (
                      <button key={l.label} type="button" onClick={() => onOpen(l.detail)} className="cond rounded-sm2 border border-line bg-white px-2 py-1 text-[11px] font-semibold text-ink hover:border-accent hover:text-accent">
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </ViewPanel>
    </div>
  )
}
