import { useEffect, useRef, useState } from 'react'

const MODES = ['Explore Mode', 'Guided Mode', 'Review Mode']

export function Header({
  presenting,
  onPresentingChange,
  mode,
  onModeChange,
}: {
  presenting: boolean
  onPresentingChange: (v: boolean) => void
  mode: string
  onModeChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <header className="flex shrink-0 items-start justify-between gap-6 pl-[18px] pr-[18px]" style={{ height: 82, paddingTop: 12 }}>
      <div className="min-w-0">
        <h1 className="cond truncate text-[31px] font-bold uppercase leading-[1.05] tracking-[0.005em] text-ink">
          Westfield Branch Intelligence Command Center
        </h1>
        <p className="mt-1 text-[13px] leading-tight text-inkSoft">Demonstration Environment — Sanitized Sample Data</p>
      </div>

      <div className="flex shrink-0 items-center gap-4" style={{ paddingTop: 6 }}>
        <span className="cond text-[12.5px] font-semibold uppercase tracking-[0.08em] text-inkSoft">Presentation Mode</span>

        <button
          type="button"
          role="switch"
          aria-checked={presenting}
          aria-label="Presentation mode"
          onClick={() => onPresentingChange(!presenting)}
          className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${presenting ? 'bg-accent' : 'bg-[#C3C8C4]'}`}
          style={{ width: 46, height: 25 }}
        >
          <span
            className="absolute rounded-full bg-white shadow-sm transition-all"
            style={{ width: 19, height: 19, top: 3, left: presenting ? 24 : 3 }}
          />
        </button>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="flex items-center gap-2 text-[16px] font-medium text-ink"
          >
            {mode}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && (
            <ul
              role="listbox"
              className="absolute right-0 z-40 mt-1.5 w-44 overflow-hidden rounded-sm2 border border-line bg-white py-1 shadow-lg"
            >
              {MODES.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={m === mode}
                    onClick={() => {
                      onModeChange(m)
                      setOpen(false)
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-[13px] hover:bg-shell ${m === mode ? 'font-semibold text-forest' : 'text-ink'}`}
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  )
}
