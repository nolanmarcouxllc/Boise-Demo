/**
 * The branch management brief, in the six sections a branch manager actually
 * asks about. Every line is traceable: `calc` shows the arithmetic behind the
 * claim and `links` open the underlying record, so nothing in the brief has to
 * be taken on trust.
 */
import type { Detail } from './Drawer'
import type { InfoStatus } from './capabilities'

export interface BriefItem {
  text: string
  /** The arithmetic or source behind the claim. Shown when the row is opened. */
  calc: string
  links?: Array<{ label: string; detail: Detail }>
  status: InfoStatus
}

export interface BriefSection {
  key: string
  title: string
  /** The question this section answers, in the manager's own words. */
  question: string
  tone: 'red' | 'amber' | 'blue' | 'green' | 'neutral' | 'violet'
  items: BriefItem[]
}

export const sectionTone: Record<BriefSection['tone'], string> = {
  red: '#D71920',
  amber: '#D98A00',
  blue: '#1F5F99',
  green: '#148345',
  neutral: '#667069',
  violet: '#7A4FA3',
}

export const briefSections: BriefSection[] = [
  {
    key: 'attention',
    title: 'What needs attention now',
    question: 'What could go wrong today if nobody acts?',
    tone: 'red',
    items: [
      {
        text: 'Route 12 is projected to leave the yard 40 minutes late.',
        calc: 'Loading started 06:20 against an 05:55 plan. Remaining pick time 55 min at the observed rate, against a 07:00 departure.',
        links: [
          { label: 'Route 12', detail: { kind: 'route', id: 'RT-12' } },
          { label: 'Yard & Departure', detail: { kind: 'capability', id: 'yard' } },
        ],
        status: 'DEMONSTRATION',
      },
      {
        text: 'Route 5 is running a load plan that no longer matches the order.',
        calc: 'Route generated 05:12. Order revised 05:41. Difference: 14 pieces, 714 lbs never transferred to the load plan.',
        links: [
          { label: 'EXC-001', detail: { kind: 'exception', id: 'EXC-001' } },
          { label: 'DEMO-10511', detail: { kind: 'order', id: 'DEMO-10511' } },
        ],
        status: 'DEMONSTRATION',
      },
      {
        text: 'Three deliveries are projected outside their appointment window.',
        calc: 'Routes 101, 102 and 104 each carry one stop whose projected arrival falls past its window close.',
        links: [
          { label: 'At-risk deliveries', detail: { kind: 'metric', id: 'at-risk' } },
          { label: 'Delivery Risk', detail: { kind: 'capability', id: 'risk' } },
        ],
        status: 'DEMONSTRATION',
      },
    ],
  },
  {
    key: 'value',
    title: 'What could create value',
    question: 'Where are we spending more than the work requires?',
    tone: 'amber',
    items: [
      {
        text: 'Three compatible orders sit inside one 18-mile service area.',
        calc: 'Three orders, same requested service day, across two routes sharing 31 corridor miles each way. Combined weight stays inside deck capacity.',
        links: [
          { label: 'Delivery Consolidation', detail: { kind: 'capability', id: 'consolidation' } },
          { label: 'Priority 1', detail: { kind: 'priority', id: 1 } },
        ],
        status: 'DEMONSTRATION',
      },
      {
        text: 'One customer yard is scheduled twice, 95 minutes apart.',
        calc: 'Stops 15 and 16 on Route 102 serve the same ship-to. Two gate cycles, two unload setups, one location.',
        links: [{ label: 'Duplicate-stop opportunities', detail: { kind: 'metric', id: 'duplicate-stops' } }],
        status: 'DEMONSTRATION',
      },
      {
        text: '186 planned miles are under review across four proposals.',
        calc: '74 (Route 12 consolidation) + 42 (Worcester) + 28 (Windsor Locks) + 42 (Torrington) = 186. Candidates for review, not committed savings.',
        links: [{ label: 'Avoidable miles', detail: { kind: 'metric', id: 'avoidable-miles' } }],
        status: 'MEASUREMENT REQUIRED',
      },
    ],
  },
  {
    key: 'changed',
    title: 'What changed',
    question: 'What moved since yesterday, and in which direction?',
    tone: 'blue',
    items: [
      {
        text: 'Duplicate-stop opportunities rose from 2 to 4.',
        calc: 'Two new same-location pairs appeared after last night’s order entry. Direction is unfavourable — more duplication, not less.',
        links: [{ label: 'Duplicate-stop opportunities', detail: { kind: 'metric', id: 'duplicate-stops' } }],
        status: 'DEMONSTRATION',
      },
      {
        text: 'Avoidable miles fell from 228 to 186.',
        calc: '42 miles left the review queue when the Torrington pair was routed together yesterday afternoon.',
        links: [{ label: 'Avoidable miles', detail: { kind: 'metric', id: 'avoidable-miles' } }],
        status: 'DEMONSTRATION',
      },
      {
        text: 'Three orders were changed after their route was generated.',
        calc: 'Changes landed 29, 41 and 63 minutes after routing. Each one invalidated a load plan that had already been issued to the yard.',
        links: [{ label: 'Change Impact', detail: { kind: 'capability', id: 'change' } }],
        status: 'DEMONSTRATION',
      },
    ],
  },
  {
    key: 'decisions',
    title: 'What is waiting on a decision',
    question: 'What is queued to a person, and how long has it been sitting?',
    tone: 'violet',
    items: [
      {
        text: 'Route 12 departure — hold the last pick or send the truck short.',
        calc: 'Owner: Warehouse / Yard. Raised 06:20, open 40 minutes. Escalates to the Transportation Supervisor at 07:00.',
        links: [{ label: 'Route 12', detail: { kind: 'route', id: 'RT-12' } }],
        status: 'DEMONSTRATION',
      },
      {
        text: 'Route 8 added units — re-sequence, move to another route, or hold.',
        calc: 'Owner: Dispatch. Six units of subfloor added after planning. Hartford appointment is a 90-minute window with detention exposure.',
        links: [{ label: 'EXC-002', detail: { kind: 'exception', id: 'EXC-002' } }],
        status: 'DEMONSTRATION',
      },
      {
        text: 'The combined scenario for the 18-mile cluster needs a dispatcher’s call.',
        calc: 'Owner: Dispatch. The scenario and the current plan are presented side by side. Nothing is applied without the dispatcher accepting it.',
        links: [{ label: 'Delivery Consolidation', detail: { kind: 'capability', id: 'consolidation' } }],
        status: 'DEMONSTRATION',
      },
    ],
  },
  {
    key: 'learned',
    title: 'What we learned',
    question: 'What did today teach us that should change tomorrow’s plan?',
    tone: 'green',
    items: [
      {
        text: 'One location consistently exceeds its expected service time.',
        calc: 'Planned 48 minutes on Route 3, actual 71 minutes. The same overrun has appeared on every visit in the sample window.',
        links: [{ label: 'Delivery Memory', detail: { kind: 'capability', id: 'memory' } }],
        status: 'ASSUMPTION',
      },
      {
        text: 'Four orders reached routing missing detail that routing depends on.',
        calc: 'Missing delivery window, access constraint or equipment requirement. Each was corrected at the dock rather than at entry.',
        links: [{ label: 'Order Readiness', detail: { kind: 'capability', id: 'readiness' } }],
        status: 'ASSUMPTION',
      },
      {
        text: 'One planning assumption is ready to be corrected.',
        calc: 'The service-time estimate for that location is the assumption. Correcting it changes tomorrow’s plan, not just today’s explanation.',
        links: [{ label: 'Planned vs. Actual', detail: { kind: 'capability', id: 'learning' } }],
        status: 'MEASUREMENT REQUIRED',
      },
    ],
  },
  {
    key: 'validation',
    title: 'What requires validation',
    question: 'What are we not entitled to claim until Boise tells us?',
    tone: 'neutral',
    items: [
      {
        text: 'No savings figure in this brief is a committed number.',
        calc: 'Every mile and route figure is a candidate for review. Committed savings require a Boise-provided baseline that does not exist yet.',
        links: [{ label: 'Cost to Serve', detail: { kind: 'capability', id: 'cost' } }],
        status: 'MEASUREMENT REQUIRED',
      },
      {
        text: 'Whether an order change reaches routing automatically is unconfirmed.',
        calc: 'The demonstration assumes it does not. That assumption drives three items above and needs an application owner to confirm or correct it.',
        links: [{ label: 'Change Impact', detail: { kind: 'capability', id: 'change' } }],
        status: 'TECHNICAL VALIDATION REQUIRED',
      },
      {
        text: 'Delivery location knowledge has no confirmed system of record.',
        calc: 'The demonstration treats it as living with the drivers who know the site. If Boise already stores it somewhere, this capability changes shape.',
        links: [{ label: 'Delivery Memory', detail: { kind: 'capability', id: 'memory' } }],
        status: 'ASSUMPTION',
      },
    ],
  },
]

export const briefClaimCount = briefSections.reduce((n, s) => n + s.items.length, 0)
