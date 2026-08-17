import { AlertTriangle, ArrowRight, CheckCircle2, History, ShieldCheck, XCircle } from 'lucide-react'
import { useState } from 'react'
import { agentName, orderById, routeLabel } from '../data'
import type { Recommendation } from '../data/types'
import { useApp } from '../state/AppContext'
import { BulletList, Chip, ConfidenceMeter, ConfirmDialog, PermissionBadge } from './ui'

export function RecommendationCard({ rec, compact = false }: { rec: Recommendation; compact?: boolean }) {
  const { select, decisions, recordDecision, decisionReasons } = useApp()
  const [confirm, setConfirm] = useState<null | 'approved' | 'dismissed'>(null)
  const [reason, setReason] = useState('')
  const [showAudit, setShowAudit] = useState(false)

  const decision = decisions[rec.id]
  const statusLabel =
    decision === 'approved'
      ? 'Approved in this session'
      : decision === 'dismissed'
        ? 'Dismissed in this session'
        : decision === 'discussion'
          ? 'In discussion'
          : rec.status

  return (
    <article className="panel p-0">
      <header className="border-b border-charcoal-200/70 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="label-caps mb-1">
              {rec.id} · {agentName(rec.agentId)}
            </div>
            <h3 className="text-[15px] font-semibold leading-snug">{rec.title}</h3>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <PermissionBadge level={rec.permission} />
            <Chip tone={decision === 'approved' ? 'green' : decision === 'dismissed' ? 'neutral' : 'amber'}>{statusLabel}</Chip>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4">
        <Field label="What was detected">{rec.detected}</Field>
        <Field label="Why it matters">{rec.whyItMatters}</Field>

        <div>
          <div className="label-caps mb-2">Evidence</div>
          <ul className="space-y-1.5 rounded-[3px] border border-charcoal-200 bg-charcoal-50/60 p-3">
            {rec.evidence.map((e) => (
              <li key={e} className="flex gap-2 font-mono text-[12px] leading-relaxed text-charcoal-600">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-charcoal-400" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <div className="label-caps mb-1">Confidence</div>
            <ConfidenceMeter confidence={rec.confidence} pct={rec.confidencePct} />
          </div>
          <div>
            <div className="label-caps mb-1">Required approver</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-charcoal-700">
              <ShieldCheck className="h-4 w-4 text-forest-600" aria-hidden />
              {rec.requiredApprover}
            </div>
          </div>
        </div>

        <div>
          <div className="label-caps mb-2">Expected impact</div>
          <p className="mb-2 text-sm leading-relaxed text-charcoal-700">{rec.expectedImpact}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {rec.impactMetrics.map((m) => (
              <div key={m.label} className="rounded-[3px] border border-charcoal-200 bg-white px-3 py-2">
                <div className="label-caps leading-tight">{m.label}</div>
                <div className="mt-1 font-mono text-sm font-semibold text-charcoal-900">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {!compact && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="label-caps mb-2">Assumptions</div>
              <BulletList items={rec.assumptions} />
            </div>
            <div>
              <div className="label-caps mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-alert-warn" aria-hidden /> Risks
              </div>
              <BulletList items={rec.risks} tone="risk" />
            </div>
          </div>
        )}

        <div className="rounded-[3px] border-l-[3px] border-forest-600 bg-forest-50/70 px-3 py-2.5">
          <div className="label-caps mb-1 text-forest-700">Recommended action</div>
          <p className="text-sm leading-relaxed text-charcoal-800">{rec.recommendedAction}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-charcoal-600">
            <span className="font-semibold">Alternative:</span> {rec.alternativeAction}
          </p>
        </div>

        {(rec.relatedOrderIds.length > 0 || rec.relatedRouteIds.length > 0) && (
          <div>
            <div className="label-caps mb-2">Related records</div>
            <div className="flex flex-wrap gap-2">
              {rec.relatedRouteIds.map((id) => (
                <button key={id} type="button" onClick={() => select('route', id)} className="btn btn-secondary btn-sm">
                  {routeLabel(id)} <ArrowRight className="h-3 w-3" aria-hidden />
                </button>
              ))}
              {rec.relatedOrderIds.map((id) => (
                <button key={id} type="button" onClick={() => select('order', id)} className="btn btn-secondary btn-sm font-mono">
                  {id}
                  {orderById.get(id) ? '' : ' (not modeled)'} <ArrowRight className="h-3 w-3" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}

        {decisionReasons[rec.id] && (
          <div className="rounded-[3px] border border-charcoal-200 bg-charcoal-50 px-3 py-2 text-sm text-charcoal-700">
            <span className="label-caps mr-2">Reason recorded</span>
            {decisionReasons[rec.id]}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowAudit((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-charcoal-500 hover:text-forest-700"
            aria-expanded={showAudit}
          >
            <History className="h-3.5 w-3.5" aria-hidden /> Audit history ({rec.audit.length})
          </button>
          {showAudit && (
            <ol className="mt-2 space-y-1.5 border-l-2 border-charcoal-200 pl-3">
              {rec.audit.map((a, i) => (
                <li key={`${a.at}-${i}`} className="text-[12px] leading-relaxed text-charcoal-600">
                  <span className="font-mono text-charcoal-400">{a.at.replace('T', ' ')}</span> · <span className="font-semibold">{a.actor}</span> —{' '}
                  {a.action}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal-200/70 bg-charcoal-50/60 px-4 py-3">
        <p className="text-[12px] text-charcoal-500">Nothing executes automatically. This records a decision inside the demonstration only.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => recordDecision(rec.id, 'discussion')}>
            Mark for discussion
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirm('dismissed')}>
            <XCircle className="h-3.5 w-3.5" aria-hidden /> Dismiss
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setConfirm('approved')}>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Send for approval
          </button>
        </div>
      </footer>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'approved' ? 'Record a simulated approval?' : 'Record a dismissal?'}
        body={
          <div className="space-y-3">
            <p>
              {confirm === 'approved'
                ? `In a production system this step would require ${rec.requiredApprover}. Here it records the decision in the demonstration and nothing else.`
                : 'Recording why a recommendation does not work operationally is the most useful thing to capture in this meeting.'}
            </p>
            <label className="block">
              <span className="label-caps mb-1 block">{confirm === 'approved' ? 'Note (optional)' : 'Reason it is not operationally possible'}</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-[3px] border border-charcoal-300 px-3 py-2 text-sm"
                placeholder={confirm === 'approved' ? 'Anything the branch said while approving' : 'e.g. these two purchase orders can never share a truck because…'}
              />
            </label>
          </div>
        }
        confirmLabel={confirm === 'approved' ? 'Record approval' : 'Record dismissal'}
        onConfirm={() => {
          if (confirm) recordDecision(rec.id, confirm, reason)
          setReason('')
          setConfirm(null)
        }}
        onCancel={() => {
          setReason('')
          setConfirm(null)
        }}
      />
    </article>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label-caps mb-1">{label}</div>
      <p className="text-sm leading-relaxed text-charcoal-700">{children}</p>
    </div>
  )
}
