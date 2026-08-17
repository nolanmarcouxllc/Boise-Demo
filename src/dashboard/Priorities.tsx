import { priorities, toneHex } from './data'

export function Priorities({ selected, onSelect, onViewAll }: { selected: number | null; onSelect: (n: number) => void; onViewAll: () => void }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Today’s Priorities</h2>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col">
        {priorities.map((p) => (
          <li key={p.n} className="flex min-h-0 flex-1 border-b border-lineSoft last:border-0">
            <button
              type="button"
              onClick={() => onSelect(p.n)}
              aria-pressed={selected === p.n}
              className={`flex w-full items-center gap-3 px-3.5 text-left transition-colors ${
                selected === p.n ? 'bg-[#F1F6F2]' : 'hover:bg-shell'
              }`}
            >
              <span
                aria-hidden
                className="num flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ backgroundColor: toneHex[p.tone] }}
              >
                {p.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold leading-tight text-ink">{p.title}</span>
                <span className="mt-[3px] block truncate text-[12px] leading-tight text-inkSoft">{p.detail}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[12px] font-semibold leading-tight" style={{ color: toneHex[p.tone] }}>
                  {p.impact}
                </span>
                <span className="mt-[3px] block text-[12px] leading-tight text-inkSoft">{p.result}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="shrink-0 border-t border-lineSoft px-3.5 py-2.5">
        <button type="button" onClick={onViewAll} className="cond flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-info hover:underline">
          View all priorities (12)
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  )
}
