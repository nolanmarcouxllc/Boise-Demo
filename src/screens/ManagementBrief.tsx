import { ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { Chip, Panel, SectionHeading } from '../components/ui'
import { branch, routeLabel } from '../data'
import { useApp } from '../state/AppContext'

interface Statement {
  id: string
  text: string
  tone: 'critical' | 'warning' | 'neutral' | 'positive'
  calculation: string
  evidence: string[]
  routeIds: string[]
  orderIds: string[]
  exceptionIds: string[]
  recommendationIds: string[]
}

interface BriefSection {
  key: string
  title: string
  intro: string
  statements: Statement[]
}

const BRIEF: BriefSection[] = [
  {
    key: 'attention',
    title: 'What needs attention',
    intro: 'The most important current risks, in the order they will cost something.',
    statements: [
      {
        id: 'S1',
        text: 'Route 12 is projected to miss the Hadley job-site appointment by seven minutes.',
        tone: 'critical',
        calculation: 'Planned departure 08:15 · actual departure 08:52 · 37 minutes late. Planned arrival 10:45 + 37 = 11:22 against a window closing at 11:15.',
        evidence: [
          'Truck 108 released from maintenance at 06:40 instead of 06:00.',
          'The site requires a superintendent present; unattended drops are not permitted.',
          'A failed delivery means a second trip to the job site at roughly $215.',
        ],
        routeIds: ['RT-12'],
        orderIds: ['DEMO-10503'],
        exceptionIds: ['EXC-003'],
        recommendationIds: ['REC-018'],
      },
      {
        id: 'S2',
        text: 'Route 5 is running a load plan that does not match the current order.',
        tone: 'critical',
        calculation: 'Route generated 05:12. Order revised 05:41. Difference: 14 pieces, 714 lbs on EW-IJST-160.',
        evidence: [
          'The plant feeds its production line from the first delivery of the day against a 07:00 hard window.',
          'The order update feed ran up to 22 minutes behind between 05:10 and 05:32.',
        ],
        routeIds: ['RT-05'],
        orderIds: ['DEMO-10511'],
        exceptionIds: ['EXC-001', 'EXC-015'],
        recommendationIds: ['REC-009'],
      },
      {
        id: 'S3',
        text: 'Two routes cannot be released because the assigned equipment cannot unload the site.',
        tone: 'critical',
        calculation: 'Route 11 assigned Truck 107 (no boom, no piggyback) to a site requiring one. Route 6 has no unit assigned and one stop requires a piggyback.',
        evidence: [
          'Torrington requires boom or piggyback unload.',
          'The Ware job site requires a piggyback and limits equipment to 48 ft.',
          'The only unassigned private unit today is a curtainside.',
        ],
        routeIds: ['RT-06', 'RT-11'],
        orderIds: ['DEMO-10521', 'DEMO-10529'],
        exceptionIds: ['EXC-004', 'EXC-005'],
        recommendationIds: ['REC-016', 'REC-020', 'REC-021'],
      },
    ],
  },
  {
    key: 'improve',
    title: 'What can be improved',
    intro: 'Consolidation, capacity and workflow opportunities that are open right now.',
    statements: [
      {
        id: 'S4',
        text: 'Four deliveries scheduled for separate routes appear compatible for consolidation.',
        tone: 'warning',
        calculation: 'DEMO-10482 (Route 1) + DEMO-10491, DEMO-10503 (Route 12) + DEMO-10484 (unrouted). All within 18 miles on the same service day. Combined weight 44,100 lbs against a 46,000 lb deck.',
        evidence: [
          'Route 1 and Route 12 share 31 corridor miles in each direction.',
          'The Northampton yard is scheduled twice, 95 minutes apart.',
          'Eliminating Route 12 removes one truck and 74 planned miles.',
        ],
        routeIds: ['RT-01', 'RT-12'],
        orderIds: ['DEMO-10482', 'DEMO-10484', 'DEMO-10491', 'DEMO-10503'],
        exceptionIds: [],
        recommendationIds: ['REC-001', 'REC-004', 'REC-005', 'REC-013'],
      },
      {
        id: 'S5',
        text: '186 planned miles are under review for elimination across four proposals.',
        tone: 'warning',
        calculation: '74 (Route 12 consolidation) + 42 (Worcester duplicate) + 28 (Windsor Locks duplicate) + 42 (Torrington duplicate) = 186 miles. These are estimates for review, not committed savings.',
        evidence: [
          'Each proposal carries its own assumptions and risks in the recommendation detail.',
          'Two of the four require a customer conversation before they can be actioned.',
        ],
        routeIds: ['RT-01', 'RT-04', 'RT-05', 'RT-11', 'RT-12'],
        orderIds: ['DEMO-10486', 'DEMO-10497', 'DEMO-10531'],
        exceptionIds: [],
        recommendationIds: ['REC-002', 'REC-006', 'REC-007'],
      },
    ],
  },
  {
    key: 'changed',
    title: 'What changed',
    intro: 'Meaningful movement since the previous briefing.',
    statements: [
      {
        id: 'S6',
        text: 'Three orders were revised after their routes had already been generated.',
        tone: 'warning',
        calculation: 'DEMO-10477 at 06:12, DEMO-10511 at 05:41, plus one release event delivered 22 minutes late.',
        evidence: [
          'Two of the three changes affected a route that was already loading.',
          'One integration feed delay recovered on its own at 05:58.',
        ],
        routeIds: ['RT-05', 'RT-08'],
        orderIds: ['DEMO-10477', 'DEMO-10511'],
        exceptionIds: ['EXC-002', 'EXC-015'],
        recommendationIds: ['REC-017', 'REC-012'],
      },
      {
        id: 'S7',
        text: 'Route 3 completed 71 minutes behind plan, 48 of them at one stop.',
        tone: 'neutral',
        calculation: 'Planned duration 330 min · actual 401 min. Flagged stop planned at 55 min, actual 103 min.',
        evidence: ['That location has exceeded plan on four of its last six simulated deliveries.', 'Average actual service time there is 81 minutes.'],
        routeIds: ['RT-03'],
        orderIds: ['DEMO-10505'],
        exceptionIds: ['EXC-006'],
        recommendationIds: ['REC-022'],
      },
    ],
  },
  {
    key: 'waiting',
    title: 'What is waiting on a decision',
    intro: 'Recommendations that need a person before the dispatch commit.',
    statements: [
      {
        id: 'S8',
        text: 'Three decisions are waiting on management before the 09:00 dispatch commit.',
        tone: 'warning',
        calculation: 'Route 6 equipment (carrier premium $77 vs. next-day private) · Route 11 carrier tender ($442 carrier vs. an unexecutable private assignment) · Route 12 consolidation (1 truck, 74 miles).',
        evidence: [
          'Each decision has its own approver: branch manager, transportation supervisor, dispatcher.',
          'None of them will execute without that approval.',
        ],
        routeIds: ['RT-06', 'RT-11', 'RT-12'],
        orderIds: ['DEMO-10519', 'DEMO-10521', 'DEMO-10529'],
        exceptionIds: ['EXC-004', 'EXC-005'],
        recommendationIds: ['REC-020', 'REC-021', 'REC-025'],
      },
    ],
  },
  {
    key: 'watch',
    title: 'What should be watched',
    intro: 'Emerging patterns that do not require action today.',
    statements: [
      {
        id: 'S9',
        text: 'Berkshire corridor actual miles are running 4.6% above plan across 14 days.',
        tone: 'neutral',
        calculation: '14-day planned 1,642 miles · actual 1,718 miles · difference 76 miles (4.6%).',
        evidence: ['The deviation is consistent rather than driven by one day.', 'Most common recorded cause: a truck-legal detour around a posted bridge weight limit.'],
        routeIds: ['RT-03', 'RT-07'],
        orderIds: [],
        exceptionIds: [],
        recommendationIds: ['REC-023'],
      },
      {
        id: 'S10',
        text: 'Detention exposure at the Hartford distribution center is close to the threshold.',
        tone: 'neutral',
        calculation: 'Last three simulated deliveries averaged 54 minutes on site against a 60-minute detention threshold.',
        evidence: ['A load re-sequence on Route 8 today could add time on site.', 'The appointment window is 90 minutes with detention billed after 60.'],
        routeIds: ['RT-08'],
        orderIds: ['DEMO-10477'],
        exceptionIds: ['EXC-014'],
        recommendationIds: [],
      },
    ],
  },
]

export function ManagementBrief() {
  const { select } = useApp()
  const [traceAll, setTraceAll] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const isOpen = (id: string) => traceAll || open[id]

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 5 · Management learns before the next day"
        title="Management morning brief"
        blurb="Branch activity converted into a short briefing. Every statement below can be opened to show the records and the calculation that produced it. If a statement cannot be traced, it does not belong in the brief."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-charcoal-200 bg-white px-4 py-3">
        <div className="text-[13px] text-charcoal-600">
          <span className="font-semibold text-charcoal-800">{branch.name}</span> · Monday 17 August 2026 · prepared 08:00 · 10 statements
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setTraceAll((v) => !v)} aria-pressed={traceAll}>
          <Search className="h-3.5 w-3.5" aria-hidden /> {traceAll ? 'Collapse all evidence' : 'Trace every statement'}
        </button>
      </div>

      <div className="space-y-4">
        {BRIEF.map((section) => (
          <Panel key={section.key} title={section.title} subtitle={section.intro} bodyClassName="p-0">
            <ul>
              {section.statements.map((s) => (
                <li key={s.id} className="data-row">
                  <div className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                      aria-expanded={isOpen(s.id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <span
                        aria-hidden
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          s.tone === 'critical'
                            ? 'bg-alert-critical'
                            : s.tone === 'warning'
                              ? 'bg-alert-warn'
                              : s.tone === 'positive'
                                ? 'bg-forest-600'
                                : 'bg-charcoal-400'
                        }`}
                      />
                      <span className="pres-body min-w-0 flex-1 text-[15px] font-medium leading-relaxed text-charcoal-800">{s.text}</span>
                      <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 text-charcoal-400 transition-transform ${isOpen(s.id) ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>

                    {isOpen(s.id) && (
                      <div className="mt-3 animate-fade-up space-y-3 rounded-[3px] border border-charcoal-200 bg-charcoal-50/70 p-3">
                        <div>
                          <div className="label-caps mb-1">Calculation</div>
                          <p className="font-mono text-[12px] leading-relaxed text-charcoal-700">{s.calculation}</p>
                        </div>
                        <div>
                          <div className="label-caps mb-1">Supporting evidence</div>
                          <ul className="space-y-1">
                            {s.evidence.map((e) => (
                              <li key={e} className="flex gap-2 text-[13px] leading-relaxed text-charcoal-600">
                                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-charcoal-400" />
                                {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {s.routeIds.map((id) => (
                            <button key={id} type="button" className="btn btn-secondary btn-sm" onClick={() => select('route', id)}>
                              {routeLabel(id)}
                            </button>
                          ))}
                          {s.orderIds.map((id) => (
                            <button key={id} type="button" className="btn btn-secondary btn-sm font-mono" onClick={() => select('order', id)}>
                              {id}
                            </button>
                          ))}
                          {s.exceptionIds.map((id) => (
                            <button key={id} type="button" className="btn btn-secondary btn-sm" onClick={() => select('exception', id)}>
                              {id}
                            </button>
                          ))}
                          {s.recommendationIds.map((id) => (
                            <button key={id} type="button" className="btn btn-secondary btn-sm" onClick={() => select('recommendation', id)}>
                              {id}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <div className="rounded-[3px] border-l-[3px] border-forest-600 bg-forest-50 px-5 py-4">
        <p className="pres-body text-[15px] font-medium leading-relaxed text-forest-800">
          Every recommendation should be traceable to the information that created it.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip tone="green">No statement without a linked record</Chip>
          <Chip tone="green">No financial figure without its calculation</Chip>
          <Chip tone="green">No approval inside the brief itself</Chip>
        </div>
      </div>
    </div>
  )
}
