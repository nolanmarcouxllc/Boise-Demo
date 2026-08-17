import { Check, Info, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Confidence, PermissionLevel, Severity } from '../data/types'

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = 'p-4',
}: {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={`panel flex min-w-0 flex-col ${className}`}>
      {(title || actions) && (
        <header className="panel-header">
          <div className="min-w-0">
            {title && <h3 className="panel-title truncate">{title}</h3>}
            {subtitle && <p className="mt-0.5 truncate text-xs text-charcoal-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`min-w-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

const severityStyles: Record<Severity | 'info', string> = {
  critical: 'border-alert-critical/30 bg-alert-critical/10 text-alert-critical',
  warning: 'border-alert-warn/30 bg-alert-warn/10 text-alert-warn',
  watch: 'border-alert-info/30 bg-alert-info/10 text-alert-info',
  resolved: 'border-forest-600/30 bg-forest-600/10 text-forest-700',
  info: 'border-charcoal-300 bg-charcoal-50 text-charcoal-600',
}

export function SeverityChip({ severity, label }: { severity: Severity | 'info'; label?: string }) {
  const text = label ?? (severity === 'resolved' ? 'Resolved' : severity === 'watch' ? 'Watch' : severity)
  return (
    <span className={`chip ${severityStyles[severity]}`}>
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${
          severity === 'critical'
            ? 'bg-alert-critical'
            : severity === 'warning'
              ? 'bg-alert-warn'
              : severity === 'watch'
                ? 'bg-alert-info'
                : severity === 'resolved'
                  ? 'bg-forest-600'
                  : 'bg-charcoal-400'
        }`}
      />
      {text}
    </span>
  )
}

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'timber' }) {
  const tones = {
    neutral: 'border-charcoal-200 bg-charcoal-50 text-charcoal-600',
    green: 'border-forest-600/30 bg-forest-50 text-forest-700',
    amber: 'border-alert-warn/30 bg-alert-warn/10 text-alert-warn',
    red: 'border-alert-critical/30 bg-alert-critical/10 text-alert-critical',
    blue: 'border-alert-info/30 bg-alert-info/10 text-alert-info',
    timber: 'border-timber-300 bg-timber-50 text-timber-600',
  }
  return <span className={`chip ${tones[tone]}`}>{children}</span>
}

export function PermissionBadge({ level }: { level: PermissionLevel }) {
  const map = {
    observe: { label: 'Observe', tone: 'border-alert-info/30 bg-alert-info/10 text-alert-info', hint: 'Monitors and explains. Takes no action.' },
    recommend: { label: 'Recommend', tone: 'border-timber-300 bg-timber-50 text-timber-600', hint: 'Proposes an action for a person to review.' },
    'approve-execute': {
      label: 'Approve & Execute',
      tone: 'border-forest-600/30 bg-forest-50 text-forest-700',
      hint: 'An authorized person must approve before any simulated execution.',
    },
  }[level]
  return (
    <Tooltip label={map.hint}>
      <span className={`chip ${map.tone}`}>{map.label}</span>
    </Tooltip>
  )
}

export function ConfidenceMeter({ confidence, pct }: { confidence: Confidence; pct: number }) {
  const color = confidence === 'high' ? 'bg-forest-600' : confidence === 'medium' ? 'bg-alert-warn' : 'bg-charcoal-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-charcoal-200" role="img" aria-label={`Confidence ${pct} percent, ${confidence}`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs text-charcoal-500">
        {pct}% <span className="uppercase tracking-wide">{confidence}</span>
      </span>
    </div>
  )
}

export function Metric({
  label,
  value,
  unit,
  tone = 'neutral',
  derivation,
  onClick,
}: {
  label: string
  value: string | number
  unit?: string
  tone?: 'neutral' | 'positive' | 'warning' | 'critical'
  derivation?: string
  onClick?: () => void
}) {
  const bar = {
    neutral: 'bg-charcoal-300',
    positive: 'bg-forest-600',
    warning: 'bg-alert-warn',
    critical: 'bg-alert-critical',
  }[tone]
  const inner = (
    <>
      <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${bar}`} />
      <span className="label-caps block leading-tight">{label}</span>
      <span className="stat-value mt-2 block">
        {value}
        {unit && <span className="ml-1 font-sans text-sm font-medium text-charcoal-400">{unit}</span>}
      </span>
      {derivation && (
        <span className="mt-2 flex items-start gap-1 text-[11px] leading-snug text-charcoal-400 pres-hide">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span className="line-clamp-2">{derivation}</span>
        </span>
      )}
    </>
  )
  const cls = 'panel relative overflow-hidden p-4 text-left'
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} transition-colors hover:border-forest-600/60 hover:bg-forest-50/40`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-[3px] border border-charcoal-700 bg-charcoal-800 px-2.5 py-1.5 text-xs font-normal normal-case leading-snug tracking-normal text-white shadow-lg"
        >
          {label}
        </span>
      )}
    </span>
  )
}

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  width = 'w-full max-w-2xl',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  eyebrow?: ReactNode
  children: ReactNode
  width?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : 'Detail'}>
      <button type="button" aria-label="Close detail panel" onClick={onClose} className="absolute inset-0 bg-charcoal-900/35" />
      <div
        ref={ref}
        tabIndex={-1}
        className={`relative flex h-full ${width} flex-col border-l border-charcoal-200 bg-white shadow-drawer animate-fade-up`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-charcoal-200 bg-charcoal-50/70 px-5 py-4">
          <div className="min-w-0">
            {eyebrow && <div className="label-caps mb-1">{eyebrow}</div>}
            <h2 className="text-lg font-semibold leading-snug">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm shrink-0" aria-label="Close detail panel (Escape)">
            <X className="h-4 w-4" aria-hidden /> Close
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-charcoal-900/45" />
      <div className="panel relative w-full max-w-lg p-6 animate-fade-up">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-3 text-sm leading-relaxed text-charcoal-600">{body}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            <Check className="h-4 w-4" aria-hidden /> {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="data-row py-2">
      <dt className="label-caps">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-charcoal-700">{children}</dd>
    </div>
  )
}

export function BulletList({ items, tone = 'neutral' }: { items: string[]; tone?: 'neutral' | 'risk' }) {
  if (!items.length) return <p className="text-sm text-charcoal-400">None recorded.</p>
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-charcoal-700">
          <span aria-hidden className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'risk' ? 'bg-alert-warn' : 'bg-forest-500'}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function ProgressBar({ pct, tone = 'green', label }: { pct: number; tone?: 'green' | 'amber' | 'red'; label?: string }) {
  const color = tone === 'green' ? 'bg-forest-600' : tone === 'amber' ? 'bg-alert-warn' : 'bg-alert-critical'
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal-200" role="img" aria-label={label ?? `${pct} percent`}>
        <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-charcoal-500">{pct}%</span>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-[3px] border border-dashed border-charcoal-300 bg-charcoal-50/60 px-6 py-8 text-center text-sm text-charcoal-500">
      {message}
    </div>
  )
}

export function SectionHeading({ eyebrow, title, blurb }: { eyebrow?: string; title: string; blurb?: string }) {
  return (
    <header className="mb-5">
      {eyebrow && <div className="label-caps mb-1.5 text-forest-700">{eyebrow}</div>}
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">{title}</h1>
      {blurb && <p className="pres-body mt-2 max-w-4xl text-sm leading-relaxed text-charcoal-600">{blurb}</p>}
    </header>
  )
}
