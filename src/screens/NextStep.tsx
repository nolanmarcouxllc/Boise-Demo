import { Check, ClipboardCopy, Download, FileText, Users } from 'lucide-react'
import { useState } from 'react'
import { Chip, EmptyState, Panel, SectionHeading } from '../components/ui'
import { copyToClipboard, DISCOVERY_SECTIONS, download } from '../lib/exportNotes'
import { useApp } from '../state/AppContext'
import { workflowSteps } from '../data'

const PARTICIPANTS = [
  { role: 'Westfield branch sponsor', why: 'Owns the outcome and confirms the pilot is worth the branch’s time.' },
  { role: 'Operations manager', why: 'Confirms how the day actually runs and which constraints are real.' },
  { role: 'Dispatcher or routing owner', why: 'The person whose decisions the system supports. Nothing gets built without their input.' },
  { role: 'Boise IT or integration owner', why: 'Owns security boundaries, environments and what data can move where.' },
  { role: 'DMSi Agility application owner', why: 'Confirms available APIs, events, licensing and supported integration patterns.' },
  { role: 'Trimble / PC*MILER application owner', why: 'Confirms routing API scope, licensing and which parameters can be set.' },
  { role: 'Nolan', why: 'Carries the branch workflow into the technical session without losing the operational detail.' },
  { role: 'Implementation lead', why: 'Turns a validated workflow into an architecture, a timeline and a cost.' },
]

const AGENDA = [
  { step: 1, title: 'Confirm the current workflow', detail: 'Walk the twelve steps with operations and correct every one that is wrong.' },
  { step: 2, title: 'Identify the exact system handoffs', detail: 'Where information leaves one system and enters another, and what it carries.' },
  { step: 3, title: 'Confirm available APIs and licensing', detail: 'What DMSi and Trimble expose today, under what license, in which environments.' },
  { step: 4, title: 'Define security and deployment boundaries', detail: 'Where the layer can run, what data can leave, and who approves access.' },
  { step: 5, title: 'Select one measurable pilot', detail: 'Narrow enough to prove in weeks. One workflow, one metric, one branch.' },
  { step: 6, title: 'Establish the data baseline', detail: 'The numbers we would measure against, taken before anything changes.' },
  { step: 7, title: 'Return with architecture, timeline and commercial options', detail: 'A proposal built on validated facts rather than assumptions.' },
]

export function NextStep() {
  const { notes, workflowOverrides, goToSection } = useApp()
  const [summary, setSummary] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const build = () => setSummary(buildScopingSummary(notes, workflowOverrides))

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Act 7 · The right next step" title="Next step" />

      <div className="rounded-[3px] border border-forest-700/25 bg-forest-800 px-6 py-8 text-white">
        <h2 className="text-2xl font-semibold leading-tight text-white lg:text-3xl">The next step is not a software proposal.</h2>
        <p className="pres-body mt-3 max-w-4xl text-base leading-relaxed text-forest-50">
          The responsible next step is a technical discovery session to validate the workflow, integration options, security requirements, available
          data, and measurable business outcome.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone="timber">This is a working concept, not a claim that Boise’s production systems are connected.</Chip>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recommended participants"
          subtitle="Operations, IT and the application owners in the same room"
          actions={
            <span className="flex items-center gap-1.5 text-[12px] text-charcoal-500">
              <Users className="h-3.5 w-3.5" aria-hidden /> {PARTICIPANTS.length} roles
            </span>
          }
          bodyClassName="p-0"
        >
          <ul>
            {PARTICIPANTS.map((p) => (
              <li key={p.role} className="data-row px-4 py-2.5">
                <div className="text-sm font-semibold text-charcoal-900">{p.role}</div>
                <div className="pres-body mt-0.5 text-[13px] leading-relaxed text-charcoal-600">{p.why}</div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Proposed agenda" subtitle="Half a day, in this order" bodyClassName="p-0">
          <ol>
            {AGENDA.map((a) => (
              <li key={a.step} className="data-row flex gap-3 px-4 py-2.5">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] bg-forest-700 font-mono text-[11px] font-bold text-white"
                >
                  {a.step}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-charcoal-900">{a.title}</div>
                  <div className="pres-body mt-0.5 text-[13px] leading-relaxed text-charcoal-600">{a.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel
        title="Scoping summary"
        subtitle="Built from what was captured on the Discovery Board during this meeting"
        actions={
          <div className="flex flex-wrap gap-2">
            {summary && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await copyToClipboard(summary)
                    setCopied(ok)
                    window.setTimeout(() => setCopied(false), 2400)
                  }}
                >
                  {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => download('westfield-scoping-summary.md', summary, 'text/markdown')}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden /> Download
                </button>
              </>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={build}>
              <FileText className="h-3.5 w-3.5" aria-hidden /> Build the scoping summary
            </button>
          </div>
        }
      >
        {!summary ? (
          notes.length === 0 && workflowOverrides.length === 0 ? (
            <div className="space-y-3">
              <EmptyState message="No discovery notes captured yet. The summary is built from what the branch tells us, not from what we assumed." />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => goToSection('discovery')}>
                Open the Discovery Board
              </button>
            </div>
          ) : (
            <p className="text-sm text-charcoal-600">
              {notes.length} note(s) and {workflowOverrides.length} workflow correction(s) are ready. Select{' '}
              <span className="font-semibold">Build the scoping summary</span> to assemble them.
            </p>
          )
        ) : (
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[3px] border border-charcoal-200 bg-charcoal-50 p-4 font-mono text-[12px] leading-relaxed text-charcoal-700">
            {summary}
          </pre>
        )}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel title="What we are asking Boise">
          <p className="pres-body text-[13px] leading-relaxed text-charcoal-600">
            Is this an accurate picture of where information, decisions, and exceptions move through the Westfield branch — and where would you correct
            it?
          </p>
        </Panel>
        <Panel title="What we are not asking">
          <p className="pres-body text-[13px] leading-relaxed text-charcoal-600">
            No commitment to a platform, no change to Agility or Trimble, and no decision today beyond whether the next conversation is worth having.
          </p>
        </Panel>
        <Panel title="What happens after discovery">
          <p className="pres-body text-[13px] leading-relaxed text-charcoal-600">
            One narrow pilot with a measurable outcome, a data baseline taken before it starts, and a written architecture the branch and IT both agree
            with.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function buildScopingSummary(notes: ReturnType<typeof useApp>['notes'], overrides: ReturnType<typeof useApp>['workflowOverrides']): string {
  const lines: string[] = []
  const confirmed = notes.filter((n) => n.kind === 'confirmed')
  const corrections = notes.filter((n) => n.kind === 'correction')
  const assumptions = notes.filter((n) => n.kind === 'assumption')
  const questions = notes.filter((n) => n.kind === 'question')
  const highPriority = notes.filter((n) => n.priority === 'High')

  lines.push('WESTFIELD BRANCH — TECHNICAL DISCOVERY SCOPING SUMMARY')
  lines.push('='.repeat(56))
  lines.push('')
  lines.push('Source: interactive concept walkthrough. All product data in that session was simulated.')
  lines.push('No Boise Cascade production systems or customer data were connected.')
  lines.push('')
  lines.push(`Notes captured: ${notes.length}  ·  Confirmed: ${confirmed.length}  ·  Corrections: ${corrections.length}  ·  Open questions: ${questions.length}`)
  lines.push('')

  const block = (title: string, items: typeof notes) => {
    if (!items.length) return
    lines.push(title)
    lines.push('-'.repeat(title.length))
    items.forEach((n) => {
      lines.push(`• ${n.text}`)
      lines.push(`    section: ${n.section} | owner: ${n.owner || 'Unassigned'} | priority: ${n.priority}`)
    })
    lines.push('')
  }

  block('1. WHAT THE BRANCH CONFIRMED', confirmed)
  block('2. WHAT WE GOT WRONG AND MUST CORRECT', corrections)
  block('3. ASSUMPTIONS STILL TO BE VALIDATED', assumptions)
  block('4. OPEN QUESTIONS', questions)

  if (overrides.length) {
    lines.push('5. WORKFLOW CORRECTIONS RECORDED')
    lines.push('-'.repeat(32))
    overrides.forEach((o) => {
      const step = workflowSteps.find((s) => s.id === o.stepId)
      lines.push(`• Step ${step?.index ?? '?'} (${step?.name ?? o.stepId}) — ${o.field}: ${o.value}`)
    })
    lines.push('')
  }

  const sectionQuestions = (section: string) => notes.filter((n) => n.section === section)
  const itQ = sectionQuestions('Questions for IT')
  const dmsiQ = sectionQuestions('Questions for DMSi')
  const trimbleQ = sectionQuestions('Questions for Trimble')

  lines.push('6. TECHNICAL VALIDATION REQUIRED')
  lines.push('-'.repeat(31))
  lines.push(`• Boise IT / integration: ${itQ.length ? itQ.map((n) => n.text).join(' | ') : 'security boundaries, environments, data access — to be defined.'}`)
  lines.push(`• DMSi Agility: ${dmsiQ.length ? dmsiQ.map((n) => n.text).join(' | ') : 'API availability, event access, licensing — to be confirmed.'}`)
  lines.push(`• Trimble / PC*MILER: ${trimbleQ.length ? trimbleQ.map((n) => n.text).join(' | ') : 'routing API scope and licensing — to be confirmed.'}`)
  lines.push('')

  const pilot = sectionQuestions('Potential pilot')
  lines.push('7. CANDIDATE PILOT')
  lines.push('-'.repeat(18))
  if (pilot.length) pilot.forEach((n) => lines.push(`• ${n.text}`))
  else lines.push('• Not yet selected. Recommend one workflow, one metric, one branch.')
  lines.push('')

  lines.push('8. PRIORITY ITEMS FOR THE NEXT SESSION')
  lines.push('-'.repeat(38))
  if (highPriority.length) highPriority.forEach((n) => lines.push(`• [${n.section}] ${n.text} — owner: ${n.owner || 'Unassigned'}`))
  else lines.push('• None marked high priority during the walkthrough.')
  lines.push('')

  lines.push('9. AGENDA FOR THE TECHNICAL DISCOVERY SESSION')
  lines.push('-'.repeat(44))
  AGENDA.forEach((a) => lines.push(`${a.step}. ${a.title} — ${a.detail}`))
  lines.push('')
  lines.push('10. REQUIRED PARTICIPANTS')
  lines.push('-'.repeat(25))
  PARTICIPANTS.forEach((p) => lines.push(`• ${p.role}`))
  lines.push('')
  lines.push(`Sections available on the Discovery Board: ${DISCOVERY_SECTIONS.length}.`)
  return lines.join('\n')
}
