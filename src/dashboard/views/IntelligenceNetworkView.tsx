import { capabilities, POSITIONING, systemRoles } from '../capabilities'
import type { Detail } from '../Drawer'
import { AgentGlyphIcon } from '../icons'
import { toneHex } from '../data'
import { StatusChip } from './StatusChip'
import { ViewPanel } from './shared'

export function IntelligenceNetworkView({ onOpen }: { onOpen: (d: Detail) => void }) {
  return (
    <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
      <div className="panel shrink-0 p-3">
        <div className="grid grid-cols-3 gap-2.5">
          {systemRoles.map((s) => (
            <div key={s.name} className="rounded-sm2 border-l-[3px] bg-shell px-3 py-2" style={{ borderLeftColor: s.tone }}>
              <div className="cond text-[9.5px] font-bold uppercase tracking-[0.09em]" style={{ color: s.tone }}>{s.role}</div>
              <div className="cond text-[13px] font-bold text-ink">{s.name}</div>
              <p className="mt-0.5 text-[10.5px] leading-snug text-inkSoft">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-2.5 border-t border-lineSoft pt-2 text-[12px] font-semibold leading-snug text-ink">{POSITIONING}</p>
      </div>

      <ViewPanel title="Ten independent capabilities" right={<span className="meta">Each answers a different management question</span>} bodyClass="p-2.5">
        <ul className="grid grid-cols-5 gap-2.5">
          {capabilities.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => onOpen({ kind: 'capability', id: c.key })}
                className="flex h-full w-full flex-col rounded-sm2 border border-line bg-white p-2.5 text-left hover:border-accent"
              >
                <span className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-forest">
                    <AgentGlyphIcon name={c.glyph as 'brief'} />
                  </span>
                  <span className="min-w-0">
                    <span className="num cond block text-[9.5px] text-inkFaint">{String(c.n).padStart(2, '0')}</span>
                    <span className="cond block text-[12px] font-bold leading-tight text-ink">{c.short}</span>
                  </span>
                </span>
                <span className="mt-1.5 block text-[10.5px] leading-snug text-inkSoft">{c.question}</span>
                <span className="mt-auto flex items-center justify-between pt-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-inkSoft">
                    <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: toneHex[c.statusTone] }} />
                    {c.status}
                  </span>
                  <StatusChip status={c.infoStatus} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </ViewPanel>
    </div>
  )
}
