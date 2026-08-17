import { useEffect, useRef, useState } from 'react'
import { agentRows, toneHex } from './data'
import { AgentGlyphIcon } from './icons'

const LEGEND = [
  { label: 'Observe', tone: 'green' as const },
  { label: 'Recommend', tone: 'amber' as const },
  { label: 'Human Approval', tone: 'red' as const },
]

export function AgentActivity({
  selected,
  onSelect,
  onOpen,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onOpen: (id: string) => void
}) {
  const [menu, setMenu] = useState<string | null>(null)
  const wrap = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!menu) return
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setMenu(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menu])

  return (
    <section className="panel" ref={wrap}>
      <div className="panel-head">
        <div className="flex items-baseline gap-2.5">
          <h2 className="panel-title">Agent Activity</h2>
          <span className="cond text-[10.5px] font-bold uppercase tracking-[0.07em] text-accent">10 Agents Online</span>
        </div>
        <div className="flex items-center gap-3.5">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-inkSoft">
              <span aria-hidden className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: toneHex[l.tone] }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-lineSoft">
              <th scope="col" className="cond w-[30%] px-3.5 py-[5px] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-inkFaint">Agent</th>
              <th scope="col" className="cond w-[21%] py-[5px] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-inkFaint">Specialty</th>
              <th scope="col" className="cond w-[17%] py-[5px] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-inkFaint">Status</th>
              <th scope="col" className="cond py-[5px] text-left whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.08em] text-inkFaint">Latest Activity (7:45 AM)</th>
              <th scope="col" className="w-[26px]"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {agentRows.map((a) => (
              <tr
                key={a.id}
                onClick={() => { onSelect(a.id); onOpen(a.id) }}
                className={`cursor-pointer border-b border-lineSoft last:border-0 ${selected === a.id ? 'bg-[#F1F6F2]' : 'hover:bg-shell'}`}
              >
                <td className="px-3.5 py-[6px]">
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-forest">
                      <AgentGlyphIcon name={a.glyph} />
                    </span>
                    <span className="truncate cond text-[11px] font-semibold text-ink">{a.name}</span>
                  </span>
                </td>
                <td className="cond py-[6px] pr-2 text-[11px] text-inkSoft"><span className="block truncate">{a.specialty}</span></td>
                <td className="py-[6px] pr-2">
                  <span className="cond flex items-center gap-1.5 text-[11px] text-ink">
                    <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: toneHex[a.statusTone] }} />
                    <span className="truncate">{a.status}</span>
                  </span>
                </td>
                <td className="cond py-[6px] pr-2 text-[10.5px] text-inkSoft"><span className="block truncate">{a.activity}</span></td>
                <td className="relative pr-3 text-right">
                  <button
                    type="button"
                    aria-label={`Actions for ${a.name}`}
                    aria-expanded={menu === a.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenu(menu === a.id ? null : a.id)
                    }}
                    className="text-[15px] leading-none text-inkFaint hover:text-ink"
                  >
                    ⋯
                  </button>
                  {menu === a.id && (
                    <div className="absolute right-2 top-full z-40 w-40 overflow-hidden rounded-sm2 border border-line bg-white py-1 text-left shadow-lg">
                      {['Open agent detail', 'View findings', 'Mute for today'].map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenu(null)
                            if (label !== 'Mute for today') onOpen(a.id)
                          }}
                          className="block w-full px-3 py-1.5 text-[11.5px] text-ink hover:bg-shell"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
