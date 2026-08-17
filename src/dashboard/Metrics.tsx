import { metrics, toneHex, type MetricCard } from './data'
import { MetricGlyph } from './icons'

function Delta({ card }: { card: MetricCard }) {
  const color = toneHex[card.deltaTone]
  return (
    <div className="mt-0.5 flex items-center gap-1 text-[11px] leading-none text-inkSoft">
      {card.direction === 'flat' ? (
        <span aria-hidden style={{ color }} className="text-[13px] font-bold leading-none">
          —
        </span>
      ) : (
        <svg width="9" height="11" viewBox="0 0 10 12" fill={color} aria-hidden>
          {card.direction === 'up' ? <path d="M5 0 10 7H0z" /> : <path d="M5 12 0 5h10z" />}
        </svg>
      )}
      <span className="num font-semibold" style={{ color }}>
        {card.delta}
      </span>
      <span>vs yesterday</span>
    </div>
  )
}

export function Metrics() {
  return (
    <div className="grid min-h-0 grid-cols-6 gap-2.5">
      {metrics.map((m) => (
        <article key={m.id} className="flex min-w-0 items-center gap-3 rounded-card border border-line bg-white px-3.5">
          <span className="shrink-0">
            <MetricGlyph name={m.icon} color={toneHex[m.iconTone]} size={40} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="cond text-[10.5px] font-semibold uppercase leading-[1.15] tracking-[0.05em] text-inkSoft">{m.label}</div>
            <div className="num cond -mt-0.5 text-[34px] font-bold leading-[1.1] text-ink">{m.value}</div>
            <Delta card={m} />
          </div>
        </article>
      ))}
    </div>
  )
}
