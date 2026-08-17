import { useEffect, useRef, useState } from 'react'
import { capacityViews } from './data'

const VIEWS = Object.keys(capacityViews)

export function CapacityChart() {
  const [view, setView] = useState('Volume')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const bars = capacityViews[view]

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Capacity Utilization</h2>
        <div className="relative" ref={ref}>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="listbox" className="flex items-center gap-1.5 text-[11.5px] text-inkSoft">
            View by: <span className="font-semibold text-ink">{view}</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && (
            <ul role="listbox" className="absolute right-0 z-40 mt-1.5 w-32 overflow-hidden rounded-sm2 border border-line bg-white py-1 shadow-lg">
              {VIEWS.map((v) => (
                <li key={v}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={v === view}
                    onClick={() => { setView(v); setOpen(false) }}
                    className={`block w-full px-3 py-1.5 text-left text-[12.5px] hover:bg-shell ${v === view ? 'font-semibold text-forest' : 'text-ink'}`}
                  >
                    {v}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-2 pt-3">
        <div className="flex min-h-0 flex-1 gap-2">
          {/* y axis */}
          <div className="relative w-[34px] shrink-0" style={{ paddingBottom: 38 }}>
            <div className="relative h-full">
              {[100, 75, 50, 25, 0].map((t) => (
                <span key={t} className="num absolute right-0 -translate-y-1/2 text-[10.5px] text-inkSoft" style={{ top: `${100 - t}%` }}>
                  {t}%
                </span>
              ))}
            </div>
          </div>

          {/* plot */}
          <div className="relative min-w-0 flex-1" style={{ paddingBottom: 38 }}>
            <div className="relative h-full">
              {[100, 75, 50, 25, 0].map((t) => (
                <span key={t} aria-hidden className="absolute left-0 right-0 border-t border-lineSoft" style={{ top: `${100 - t}%` }} />
              ))}

              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {bars.map((b) => (
                  <div key={b.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                    <div className="num mb-1 text-center text-[11px] font-bold text-ink">{b.pct}%</div>
                    <div
                      className="mx-auto w-full max-w-[38px] rounded-t-[2px]"
                      style={{ height: `${b.pct}%`, backgroundColor: b.overall ? '#A9AEA9' : '#0B4C29' }}
                      role="img"
                      aria-label={`${b.label} ${b.pct} percent, ${b.detail}`}
                    />
                    <div className="absolute bottom-[-36px] left-0 right-0" style={{ display: 'none' }} />
                  </div>
                ))}
              </div>

              {/* x labels sit below the plot area */}
              <div className="absolute left-0 right-0 top-full flex justify-between gap-2 pt-1.5">
                {bars.map((b) => (
                  <div key={b.label} className="min-w-0 flex-1 text-center">
                    <div className="text-[10.5px] font-medium leading-tight text-ink">{b.label}</div>
                    <div className="num text-[10px] leading-tight text-inkSoft">{b.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 pt-1 text-[10.5px] text-inkFaint">BF = Board Feet</div>
      </div>
    </section>
  )
}
