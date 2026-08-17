import { agents } from '../../data'
import type { Detail } from '../Drawer'
import { agentRows, toneHex } from '../data'
import { AgentGlyphIcon } from '../icons'
import { ViewPanel } from './shared'

const GROUPS = ['Input Control', 'Planning', 'Execution & Learning', 'Management'] as const

export function AgentNetworkView({ onOpen }: { onOpen: (d: Detail) => void }) {
  return (
    <div className="grid min-h-0 grid-cols-4 gap-2.5">
      {GROUPS.map((g) => {
        const inGroup = agents.filter((a) => a.group === g)
        return (
          <ViewPanel key={g} title={g} right={<span className="meta">{inGroup.length}</span>} bodyClass="p-2.5">
            <ul className="space-y-2">
              {inGroup.map((a) => {
                const row = agentRows[agents.indexOf(a)]
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onOpen({ kind: 'agent', id: row.id })}
                      className="w-full rounded-sm2 border border-line bg-white p-2.5 text-left hover:border-accent"
                    >
                      <span className="flex items-start gap-2">
                        <span aria-hidden className="mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-forest">
                          <AgentGlyphIcon name={row.glyph} />
                        </span>
                        <span className="min-w-0">
                          <span className="cond block text-[12px] font-bold leading-tight text-ink">{row.name}</span>
                          <span className="mt-0.5 block text-[10.5px] leading-snug text-inkSoft">{a.role}</span>
                        </span>
                      </span>
                      <span className="mt-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10.5px] text-inkSoft">
                          <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: toneHex[row.statusTone] }} />
                          {row.status}
                        </span>
                        <span className="cond text-[10px] font-bold uppercase tracking-[0.06em] text-accent">{a.recommendationsWaiting} open</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ViewPanel>
        )
      })}
    </div>
  )
}
