import { branchMetrics } from '../data'

/** Reuse the existing simulated branch figures where they match the reference. */
function metricValue(key: string, fallback: string): string {
  return branchMetrics.find((m) => m.key === key)?.value ?? fallback
}

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'neutral'

export const toneHex: Record<Tone, string> = {
  green: '#148345',
  amber: '#D98A00',
  red: '#D71920',
  blue: '#1F5F99',
  neutral: '#667069',
}

export type MetricIcon = 'lumber' | 'clipboard' | 'routes' | 'venn' | 'warning' | 'road'

export interface MetricCard {
  id: string
  label: string
  value: string
  delta: string
  direction: 'up' | 'down' | 'flat'
  /** Colour of the delta arrow — up is not automatically bad. */
  deltaTone: Tone
  iconTone: Tone
  icon: MetricIcon
}

export const metrics: MetricCard[] = [
  { id: 'open-orders', label: 'Open Orders', value: metricValue('open-orders', '148'), delta: '12', direction: 'down', deltaTone: 'green', iconTone: 'green', icon: 'lumber' },
  { id: 'orders-review', label: 'Orders Requiring Review', value: metricValue('orders-review', '12'), delta: '3', direction: 'up', deltaTone: 'red', iconTone: 'amber', icon: 'clipboard' },
  { id: 'routes-planned', label: 'Routes Planned', value: metricValue('routes-planned', '17'), delta: '0', direction: 'flat', deltaTone: 'neutral', iconTone: 'green', icon: 'routes' },
  { id: 'duplicate-stops', label: 'Duplicate-Stop Opportunities', value: metricValue('duplicate-stops', '4'), delta: '2', direction: 'up', deltaTone: 'red', iconTone: 'amber', icon: 'venn' },
  { id: 'at-risk', label: 'At-Risk Deliveries', value: metricValue('at-risk', '3'), delta: '2', direction: 'up', deltaTone: 'red', iconTone: 'red', icon: 'warning' },
  { id: 'avoidable-miles', label: 'Avoidable Miles', value: metricValue('avoidable-miles', '186'), delta: '42', direction: 'down', deltaTone: 'green', iconTone: 'amber', icon: 'road' },
]

export interface Priority {
  n: number
  title: string
  detail: string
  impact: string
  result: string
  tone: Tone
}

export const priorities: Priority[] = [
  { n: 1, title: 'Duplicate delivery opportunity', detail: 'Stops 15 & 16 on Route 102', impact: 'High Impact', result: 'Save 24 miles', tone: 'red' },
  { n: 2, title: 'Route overlap detected', detail: 'Routes 103 & 104 between 9:30–11:00 AM', impact: 'Medium Impact', result: 'Save 18 miles', tone: 'amber' },
  { n: 3, title: 'Missing delivery window', detail: 'Order 789456 – ABC Lumber', impact: 'Medium Impact', result: 'At risk', tone: 'amber' },
  { n: 4, title: 'Loading delay', detail: 'Route 101 – Will Call backlog', impact: 'Low Impact', result: 'Delay risk', tone: 'blue' },
  { n: 5, title: 'Stale order update', detail: 'Order 788322 – No activity in 48+ hours', impact: 'Low Impact', result: 'Data hygiene', tone: 'blue' },
]

export type AgentGlyph = 'consolidate' | 'duplicate' | 'watchdog' | 'overlap' | 'multi' | 'change' | 'fleet' | 'variance' | 'exception' | 'brief'

export interface AgentRow {
  id: string
  name: string
  specialty: string
  status: string
  statusTone: Tone
  activity: string
  glyph: AgentGlyph
}

export const agentRows: AgentRow[] = [
  { id: 'a1', name: 'Order Consolidation', specialty: 'Order Optimization', status: 'Detecting', statusTone: 'green', activity: 'Found 3 consolidation candidates', glyph: 'consolidate' },
  { id: 'a2', name: 'Duplicate-Stop', specialty: 'Duplicate Detection', status: 'Comparing', statusTone: 'green', activity: 'Detected 2 overlapping stops', glyph: 'duplicate' },
  { id: 'a3', name: 'Agility Watchdog', specialty: 'Data Validation', status: 'Monitoring', statusTone: 'green', activity: 'Validated 148 order records', glyph: 'watchdog' },
  { id: 'a4', name: 'Route Overlap', specialty: 'Routing & Sequencing', status: 'Detecting', statusTone: 'green', activity: 'Compared 5 route plans', glyph: 'overlap' },
  { id: 'a5', name: 'Multi-Vehicle Opt.', specialty: 'Capacity & Routing', status: 'Evaluating', statusTone: 'amber', activity: 'Evaluating 2 multi-vehicle plans', glyph: 'multi' },
  { id: 'a6', name: 'Last-Minute Change', specialty: 'Change Management', status: 'Reviewing', statusTone: 'amber', activity: 'Reviewing 3 late order changes', glyph: 'change' },
  { id: 'a7', name: 'Fleet vs. 3PL', specialty: 'Transportation Sourcing', status: 'Monitoring', statusTone: 'green', activity: 'Checked 4 loads vs. 3PL rates', glyph: 'fleet' },
  { id: 'a8', name: 'Planned vs. Actual', specialty: 'Performance Monitoring', status: 'Monitoring', statusTone: 'green', activity: 'Compared plan vs. actual to date', glyph: 'variance' },
  { id: 'a9', name: 'Branch Exception Cmd', specialty: 'Exception Management', status: 'Action Required', statusTone: 'red', activity: '3 exceptions need approval', glyph: 'exception' },
  { id: 'a10', name: 'Management AM Brief', specialty: 'Executive Reporting', status: 'Waiting', statusTone: 'green', activity: 'Prepared morning brief', glyph: 'brief' },
]

export interface BriefRow {
  title: string
  detail: string
  tone: Tone
  icon: 'chart' | 'route' | 'warning' | 'team'
  why: string
}

export const briefRows: BriefRow[] = [
  {
    title: 'Service performance on track',
    detail: 'On-time delivery forecast is 94% for today, up 3 pts vs yesterday.',
    tone: 'green',
    icon: 'chart',
    why: '16 of 17 routes are currently inside their delivery window.',
  },
  {
    title: 'Route efficiency opportunity',
    detail: 'Addressing today’s priorities could save up to 42 miles and 1.2 driver hours.',
    tone: 'amber',
    icon: 'route',
    why: '4 duplicate-stop findings and 1 corridor overlap, all awaiting dispatcher review.',
  },
  {
    title: 'Watch at-risk deliveries',
    detail: '3 deliveries are at risk due to time windows and traffic constraints.',
    tone: 'red',
    icon: 'warning',
    why: 'Routes 101, 102 and 104 each carry one stop projected past its appointment.',
  },
  {
    title: 'Team ready to act',
    detail: 'All critical agents are active and monitoring.',
    tone: 'blue',
    icon: 'team',
    why: 'Every recommendation is queued to a named approver. Nothing executes on its own.',
  },
]

export interface CapacityBar {
  label: string
  pct: number
  detail: string
  overall?: boolean
}

export const capacityViews: Record<string, CapacityBar[]> = {
  Volume: [
    { label: 'Route 101', pct: 78, detail: '24 / 31K BF' },
    { label: 'Route 102', pct: 65, detail: '18 / 27K BF' },
    { label: 'Route 103', pct: 88, detail: '26 / 29K BF' },
    { label: 'Route 104', pct: 72, detail: '20 / 28K BF' },
    { label: 'Route 105', pct: 59, detail: '15 / 25K BF' },
    { label: 'Branch Overall', pct: 72, detail: '103 / 140K BF', overall: true },
  ],
  Weight: [
    { label: 'Route 101', pct: 71, detail: '34 / 48K lbs' },
    { label: 'Route 102', pct: 69, detail: '31 / 45K lbs' },
    { label: 'Route 103', pct: 84, detail: '39 / 46K lbs' },
    { label: 'Route 104', pct: 66, detail: '30 / 46K lbs' },
    { label: 'Route 105', pct: 54, detail: '24 / 44K lbs' },
    { label: 'Branch Overall', pct: 69, detail: '158 / 229K lbs', overall: true },
  ],
  Stops: [
    { label: 'Route 101', pct: 82, detail: '9 / 11 stops' },
    { label: 'Route 102', pct: 74, detail: '8 / 11 stops' },
    { label: 'Route 103', pct: 91, detail: '10 / 11 stops' },
    { label: 'Route 104', pct: 68, detail: '7 / 10 stops' },
    { label: 'Route 105', pct: 55, detail: '6 / 11 stops' },
    { label: 'Branch Overall', pct: 74, detail: '40 / 54 stops', overall: true },
  ],
}

export const navItems = [
  'Branch Overview',
  'Agent Network',
  'Order Flow',
  'Transportation',
  'Exceptions',
  'Route Lab',
  'Planned vs. Actual',
  'Management Brief',
  'Discovery Board',
] as const

export type NavItem = (typeof navItems)[number]
