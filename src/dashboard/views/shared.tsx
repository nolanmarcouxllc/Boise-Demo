import type { ReactNode } from 'react'

export function ViewPanel({
  title,
  right,
  children,
  className = '',
  bodyClass = 'p-3.5',
}: {
  title: string
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClass?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <h2 className="panel-title">{title}</h2>
        {right}
      </div>
      <div className={`scroll-thin min-h-0 flex-1 overflow-y-auto ${bodyClass}`}>{children}</div>
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-sm2 border border-line px-3 py-2">
      <div className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">{label}</div>
      <div className="num cond text-[22px] font-bold leading-tight text-ink">{value}</div>
      {sub && <div className="text-[10.5px] text-inkSoft">{sub}</div>}
    </div>
  )
}

export function Bar({ pct, tone = '#0B4C29' }: { pct: number; tone?: string }) {
  return (
    <span className="block h-[7px] w-full overflow-hidden rounded-full bg-lineSoft">
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: tone }} />
    </span>
  )
}

export function ClickRow({ onClick, children, active }: { onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-lineSoft px-3 py-2 text-left last:border-0 ${
        active ? 'bg-[#F1F6F2]' : 'hover:bg-shell'
      }`}
    >
      {children}
    </button>
  )
}
