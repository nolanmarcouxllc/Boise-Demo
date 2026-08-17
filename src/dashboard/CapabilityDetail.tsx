import { useState } from 'react'
import { CLASSIFICATIONS, glossary, type Capability } from './capabilities'
import { append } from '../lib/localStore'
import { StatusChip } from './views/StatusChip'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-lineSoft py-2 last:border-0">
      <div className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">{label}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-ink">{children}</div>
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-0.5 space-y-0.5">
      {items.map((i) => (
        <li key={i} className="text-[12px] leading-snug text-ink">• {i}</li>
      ))}
    </ul>
  )
}

export function CapabilityDetail({ c }: { c: Capability }) {
  const [teach, setTeach] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [classification, setClassification] = useState<string>(CLASSIFICATIONS[0].key)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const save = () => {
    append('capability_reviews', {
      capability_key: c.key,
      rating: classification === 'confirmed' ? 'accurate' : classification,
      comments: note.trim() || null,
      validation_status: classification === 'needs_it_validation' ? 'needs_it_validation' : 'not_reviewed',
    })
    append('discovery_notes', {
      section: 'Capability review',
      subject_type: 'capability',
      subject_id: c.key,
      note: note.trim() || `${c.short} marked ${classification.replace(/_/g, ' ')}`,
      classification,
      priority: 'medium',
    })
    setSaved(true)
    setNote('')
    window.setTimeout(() => setSaved(false), 2600)
    setCorrecting(false)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <StatusChip status={c.infoStatus} />
        <span className="cond rounded-sm2 border border-line bg-shell px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-inkSoft">
          {c.department}
        </span>
        <button
          type="button"
          onClick={() => setTeach((v) => !v)}
          aria-pressed={teach}
          className={`cond ml-auto rounded-sm2 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em] ${
            teach ? 'border-forest bg-forest text-white' : 'border-line bg-white text-inkSoft hover:border-inkSoft'
          }`}
        >
          Teach me
        </button>
      </div>

      <div className="mb-3 rounded-sm2 border-l-[3px] border-forest bg-shell px-3 py-2">
        <div className="cond text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Business question</div>
        <p className="text-[13px] font-semibold leading-snug text-ink">{c.question}</p>
      </div>

      <Field label="Problem detected">{c.problemDetected}</Field>
      <Field label="Why it matters">{c.whyItMatters}</Field>
      <Field label="Evidence used"><Bullets items={c.evidence} /></Field>
      <Field label="Systems involved"><Bullets items={c.systemsInvolved} /></Field>
      <Field label="What this capability adds">{c.whatItAdds}</Field>
      <Field label="What it does not replace">{c.whatItDoesNotReplace}</Field>
      <Field label="Recommendation">{c.recommendation}</Field>
      <Field label="Alternative">{c.alternative}</Field>
      <Field label="Assumptions"><Bullets items={c.assumptions} /></Field>
      <Field label="Risks"><Bullets items={c.risks} /></Field>
      <Field label="Required human owner">{c.owner}</Field>
      <Field label="Measurable outcome">{c.measurableOutcome}</Field>
      <Field label="Technical validation needed">{c.technicalValidation}</Field>
      <Field label="Why this is different from Agility or Trimble">{c.vsExisting}</Field>

      {teach && (
        <div className="mt-3 rounded-sm2 border border-line bg-shell p-3">
          <div className="cond mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Teach me — plain English</div>
          <dl className="space-y-1.5">
            {glossary.map((g) => (
              <div key={g.term}>
                <dt className="text-[11.5px] font-semibold text-ink">{g.term}</dt>
                <dd className="text-[11px] leading-snug text-inkSoft">{g.plain}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-4 rounded-sm2 border border-line p-3">
        {!correcting ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11.5px] leading-snug text-inkSoft">
              This is a model of how the work might run, not a description of Westfield. Tell us where it is wrong.
            </p>
            <button
              type="button"
              onClick={() => setCorrecting(true)}
              className="cond shrink-0 rounded-sm2 bg-forest px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-white hover:bg-forestDeep"
            >
              Correct our assumptions
            </button>
          </div>
        ) : (
          <div>
            <div className="cond mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">How accurate is this for Westfield?</div>
            <div className="flex flex-wrap gap-1.5">
              {CLASSIFICATIONS.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setClassification(k.key)}
                  aria-pressed={classification === k.key}
                  className={`cond rounded-sm2 border px-2 py-1 text-[10.5px] font-semibold ${
                    classification === k.key ? 'border-forest bg-forest text-white' : 'border-line bg-white text-inkSoft hover:border-inkSoft'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional: what actually happens at Westfield?"
              className="mt-2 w-full rounded-sm2 border border-line px-2 py-1.5 text-[12px]"
            />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={save} className="cond rounded-sm2 bg-forest px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-white">
                Save to Discovery Board
              </button>
              <button type="button" onClick={() => setCorrecting(false)} className="cond rounded-sm2 border border-line px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-inkSoft">
                Cancel
              </button>
            </div>
          </div>
        )}
        {saved && <p className="mt-2 text-[11.5px] font-semibold text-accent">Saved locally. It will sync when the presenter is signed in.</p>}
      </div>
    </div>
  )
}
