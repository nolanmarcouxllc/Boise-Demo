import { statusColor, statusMeaning, type InfoStatus } from '../capabilities'

export function StatusChip({ status, title }: { status: InfoStatus; title?: boolean }) {
  return (
    <span
      title={title === false ? undefined : statusMeaning[status]}
      className="cond inline-flex shrink-0 items-center rounded-sm2 px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.07em]"
      style={{ color: statusColor[status], backgroundColor: `${statusColor[status]}14`, border: `1px solid ${statusColor[status]}40` }}
    >
      {status}
    </span>
  )
}

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {(Object.keys(statusMeaning) as InfoStatus[]).map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <StatusChip status={s} />
          <span className="text-[10.5px] text-inkSoft">{statusMeaning[s]}</span>
        </span>
      ))}
    </div>
  )
}
