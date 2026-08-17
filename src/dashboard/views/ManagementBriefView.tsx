import { useState } from 'react'
import { briefClaimCount, briefSections, sectionTone, type BriefSection } from '../brief'
import type { Detail } from '../Drawer'
import { StatusChip } from './StatusChip'

/**
 * Six sections, one question each. Every claim opens to show the arithmetic
 * behind it, so the brief can be challenged line by line in the meeting.
 */
function Section({ s, onOpen, expanded }: { s: BriefSection; onOpen: (d: Detail) => void; expanded: boolean }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(expanded ? s.items.map((_, i) => i) : []))
  const color = sectionTone[s.tone]
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (!next.delete(i)) next.add(i)
      return next
    })

  return (
    <section className="panel min-h-0">
      <div className="panel-head" style={{ borderTopColor: color, borderTopWidth: 3 }}>
        <div className="min-w-0">
          <h2 className="panel-title truncate">{s.title}</h2>
          <p className="mt-0.5 truncate text-[10.5px] italic leading-tight text-inkFaint">{s.question}</p>
        </div>
        <span className="num shrink-0 text-[11px] text-inkFaint">{s.items.length}</span>
      </div>

      <ul className="scroll-thin min-h-0 flex-1 overflow-y-auto">
        {s.items.map((it, i) => (
          <li key={it.text} className="border-b border-lineSoft last:border-0">
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={open.has(i)}
              className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-shell"
            >
              <span aria-hidden className="mt-[6px] h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-medium leading-snug text-ink">{it.text}</span>
                <span className="mt-1 flex items-center gap-1.5">
                  <StatusChip status={it.status} />
                  <span className="cond text-[9.5px] font-bold uppercase tracking-[0.08em] text-info">
                    {open.has(i) ? 'Hide working' : 'Show working'}
                  </span>
                </span>
              </span>
            </button>

            {open.has(i) && (
              <div className="mx-3 mb-2.5 rounded-sm2 border border-line bg-shell px-2.5 py-2">
                <div className="cond text-[9px] font-bold uppercase tracking-[0.09em] text-inkFaint">How this was worked out</div>
                <p className="num mt-0.5 text-[11px] leading-snug text-inkSoft">{it.calc}</p>
                {it.links && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {it.links.map((l) => (
                      <button
                        key={l.label}
                        type="button"
                        onClick={() => onOpen(l.detail)}
                        className="cond rounded-sm2 border border-line bg-white px-2 py-[3px] text-[10.5px] font-semibold text-ink hover:border-accent hover:text-accent"
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ManagementBriefView({ onOpen }: { onOpen: (d: Detail) => void }) {
  // Open by default: the working behind each claim is the point of the brief,
  // and a collapsed grid leaves the screen looking half-finished.
  const [allOpen, setAllOpen] = useState(true)

  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="flex shrink-0 items-center justify-between rounded-card border border-line bg-shell px-3.5 py-2">
        <p className="text-[12px] leading-snug text-inkSoft">
          Prepared 07:00 for the Westfield branch manager.{' '}
          <span className="text-ink">Every statement below can be opened to show the working behind it.</span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <span className="meta">{briefClaimCount} traceable statements</span>
          <button
            type="button"
            onClick={() => setAllOpen((v) => !v)}
            className="cond rounded-sm2 border border-line bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em] text-ink hover:border-accent hover:text-accent"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-3 grid-rows-2 gap-2.5">
        {briefSections.map((s) => (
          // Remounting on toggle lets one button drive every section's rows.
          <Section key={`${s.key}-${allOpen}`} s={s} onOpen={onOpen} expanded={allOpen} />
        ))}
      </div>
    </div>
  )
}
