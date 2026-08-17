import { briefRows, toneHex } from './data'
import { BriefIcon } from './icons'

export function ManagementBrief({ showWhy, onToggle }: { showWhy: boolean; onToggle: () => void }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#148345" strokeWidth="1.8" aria-hidden>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          </svg>
          <h2 className="panel-title">Management Brief</h2>
        </div>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col">
        {briefRows.map((b) => (
          <li key={b.title} className="flex min-h-0 flex-1 items-center border-b border-lineSoft last:border-0 px-3.5 py-[7px]">
            <div className="flex w-full gap-2.5">
              <span className="mt-[1px] shrink-0">
                <BriefIcon name={b.icon} color={toneHex[b.tone]} />
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold leading-tight text-ink">{b.title}</p>
                <p className="mt-[3px] text-[11.5px] leading-[1.35] text-inkSoft">{b.detail}</p>
                {showWhy && <p className="mt-1.5 border-l-2 border-accent pl-2 text-[11px] leading-[1.35] text-inkSoft">{b.why}</p>}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="shrink-0 px-3 pb-3 pt-2">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={showWhy}
          className="cond w-full rounded-sm2 bg-forest py-[9px] text-[13px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-forestDeep"
        >
          {showWhy ? 'Hide the evidence' : 'Show me why'}
        </button>
      </div>
    </section>
  )
}
