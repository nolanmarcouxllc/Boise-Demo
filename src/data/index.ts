import { agentById, agents } from './agents'
import { branch, carriers, drivers, trucks } from './branch'
import { customers, deliveryLocations } from './customers'
import { exceptions } from './exceptions'
import { berkshireServiceHistory, integrationEvents, performanceHistory } from './history'
import { orderById, orders, TODAY, TOMORROW } from './orders'
import { productBySku, products } from './products'
import { recommendations } from './recommendations'
import { routeById, routes, utilization } from './routes'
import { workflowSteps } from './workflow'

export * from './types'
export {
  agents,
  agentById,
  branch,
  berkshireServiceHistory,
  carriers,
  customers,
  deliveryLocations,
  drivers,
  exceptions,
  integrationEvents,
  orderById,
  orders,
  performanceHistory,
  productBySku,
  products,
  recommendations,
  routeById,
  routes,
  trucks,
  utilization,
  workflowSteps,
  TODAY,
  TOMORROW,
}
export { agentGroups } from './agents'
export { exceptionById } from './exceptions'
export { recommendationById } from './recommendations'
export { routeHealthLabel } from './routes'

export const customerById = new Map(customers.map((c) => [c.id, c]))
export const locationById = new Map(deliveryLocations.map((l) => [l.id, l]))
export const truckById = new Map(trucks.map((t) => [t.id, t]))
export const driverById = new Map(drivers.map((d) => [d.id, d]))
export const carrierById = new Map(carriers.map((c) => [c.id, c]))

export function customerName(id: string): string {
  return customerById.get(id)?.name ?? id
}
export function locationName(id: string): string {
  return locationById.get(id)?.name ?? id
}
export function locationCity(id: string): string {
  const l = locationById.get(id)
  return l ? `${l.city}, ${l.state}` : id
}
export function routeLabel(id: string): string {
  const r = routeById.get(id)
  return r ? `Route ${r.number}` : id
}

/**
 * Branch metrics. Each one carries the derivation that produced it so the
 * presenter can answer "where did that number come from" without leaving the screen.
 */
export interface BranchMetric {
  key: string
  label: string
  value: string
  derivation: string
  tone: 'neutral' | 'positive' | 'warning' | 'critical'
  link?: { section: string; note: string }
}

const ordersRequiringReview = orders.filter((o) => o.dataFlags.length > 0)
const atRiskStops = routes.flatMap((r) => r.stops.filter((s) => s.status === 'At risk').map((s) => ({ route: r, stop: s })))
const openCritical = exceptions.filter((e) => e.severity === 'critical' && e.status !== 'Resolved')
const duplicateStopRecs = recommendations.filter((r) => r.agentId === 'AGT-02')
const duplicateStopChanges = duplicateStopRecs.filter((r) => r.permission !== 'observe')

export const branchMetrics: BranchMetric[] = [
  {
    key: 'open-orders',
    label: 'Open Orders',
    value: '148',
    derivation:
      'Simulated branch backlog of orders not yet delivered. 30 of these are modeled in full detail in this environment; the remainder exist only as a count.',
    tone: 'neutral',
    link: { section: 'order-flow', note: 'See the order lifecycle' },
  },
  {
    key: 'orders-review',
    label: 'Orders Requiring Review',
    value: String(ordersRequiringReview.length),
    derivation: `Orders carrying at least one data flag the watchdog raised: ${ordersRequiringReview.map((o) => o.id).join(', ')}.`,
    tone: 'warning',
    link: { section: 'exceptions', note: 'Open the exception queue' },
  },
  {
    key: 'routes-planned',
    label: 'Routes Planned Today',
    value: '17',
    derivation: 'Simulated branch total for the service day. 10 routes are modeled in full detail here, covering every scenario in the presentation.',
    tone: 'neutral',
    link: { section: 'control-tower', note: 'Open the control tower' },
  },
  {
    key: 'trucks-available',
    label: 'Trucks Available',
    value: '14',
    derivation: '8 private-fleet units at the branch plus 6 approved carrier units offered on today’s lanes.',
    tone: 'neutral',
  },
  {
    key: 'third-party',
    label: 'Third-Party Loads',
    value: '6',
    derivation:
      '4 orders on the two carrier routes modeled here (Route 2 and Route 4) plus 2 direct carrier tenders counted in the branch total but not modeled as routes.',
    tone: 'neutral',
  },
  {
    key: 'duplicate-stops',
    label: 'Duplicate-Stop Opportunities',
    value: String(duplicateStopRecs.length),
    derivation: `Open duplicate-stop findings: ${duplicateStopRecs.map((r) => r.id).join(', ')}. ${duplicateStopChanges.length} propose a change; ${
      duplicateStopRecs.length - duplicateStopChanges.length
    } is confirmed as already consolidated and needs none.`,
    tone: 'warning',
    link: { section: 'agents', note: 'Open the Duplicate-Stop Agent' },
  },
  {
    key: 'at-risk',
    label: 'At-Risk Deliveries',
    value: String(atRiskStops.length),
    derivation: `Route stops currently flagged at risk: ${atRiskStops
      .map((s) => `Route ${s.route.number} → ${locationCity(s.stop.locationId)}`)
      .join('; ')}.`,
    tone: 'critical',
    link: { section: 'control-tower', note: 'See the at-risk routes' },
  },
  {
    key: 'avoidable-miles',
    label: 'Estimated Avoidable Miles',
    value: '186',
    derivation:
      'Sum of miles in four open proposals: 74 (Route 12 consolidation) + 42 (Worcester duplicate) + 28 (Windsor Locks duplicate) + 42 (Torrington duplicate). Estimates for review, not committed savings.',
    tone: 'positive',
    link: { section: 'opportunity', note: 'Open the value simulator' },
  },
  {
    key: 'capacity-recovered',
    label: 'Estimated Capacity Recovered',
    value: '1.7 trucks',
    derivation:
      '1.0 truck released if Route 12 is consolidated, plus 0.4 and 0.3 of a truck-day across the remaining three duplicate-stop proposals. Illustrative.',
    tone: 'positive',
  },
  {
    key: 'critical-exceptions',
    label: 'Open Critical Exceptions',
    value: String(openCritical.length),
    derivation: `Critical exceptions not yet resolved: ${openCritical.map((e) => e.id).join(', ')}.`,
    tone: 'critical',
    link: { section: 'exceptions', note: 'Open the exception queue' },
  },
]

export interface Priority {
  rank: number
  title: string
  detail: string
  severity: 'critical' | 'warning' | 'watch'
  exceptionId?: string
  recommendationId?: string
  routeIds: string[]
  orderIds: string[]
}

export const todaysPriorities: Priority[] = [
  {
    rank: 1,
    title: 'Route 12 will miss the Hadley job-site appointment by 7 minutes',
    detail: 'Truck 108 came out of maintenance 40 minutes late. The route departed 37 minutes behind plan and the site requires a superintendent present.',
    severity: 'critical',
    exceptionId: 'EXC-003',
    recommendationId: 'REC-018',
    routeIds: ['RT-12'],
    orderIds: ['DEMO-10503'],
  },
  {
    rank: 2,
    title: 'Route 5 is running a load plan that is 14 pieces out of date',
    detail: 'DEMO-10511 was revised at 05:41, after the route was generated at 05:12. The plant feeds its production line from this delivery.',
    severity: 'critical',
    exceptionId: 'EXC-001',
    recommendationId: 'REC-009',
    routeIds: ['RT-05'],
    orderIds: ['DEMO-10511'],
  },
  {
    rank: 3,
    title: 'Route 11 is assigned a truck that cannot unload the site',
    detail: 'Torrington requires a boom or piggyback. Truck 107 has neither. The delivery would arrive and be turned away.',
    severity: 'critical',
    exceptionId: 'EXC-005',
    recommendationId: 'REC-020',
    routeIds: ['RT-11'],
    orderIds: ['DEMO-10529'],
  },
  {
    rank: 4,
    title: 'Four Pioneer Valley deliveries look compatible for consolidation',
    detail: 'Two trucks are scheduled into the same corridor 95 minutes apart. Combining them removes one truck and about 74 planned miles.',
    severity: 'warning',
    recommendationId: 'REC-001',
    routeIds: ['RT-01', 'RT-12'],
    orderIds: ['DEMO-10482', 'DEMO-10491', 'DEMO-10503', 'DEMO-10484'],
  },
  {
    rank: 5,
    title: 'Route 6 has no equipment assignment and one stop needs a piggyback',
    detail: 'No unassigned private unit meets the site constraints before the window closes. The choice is a carrier premium today or a date change.',
    severity: 'critical',
    exceptionId: 'EXC-004',
    recommendationId: 'REC-021',
    routeIds: ['RT-06'],
    orderIds: ['DEMO-10519', 'DEMO-10521'],
  },
]

export const managementBrief = {
  summary:
    'Four deliveries scheduled for separate routes appear compatible for consolidation. Three orders contain delivery-window or access details that should be confirmed before final routing. Route 12 is at risk of missing its second appointment based on the current loading delay.',
  traces: [
    {
      claim: 'Four deliveries scheduled for separate routes appear compatible for consolidation.',
      evidence: 'DEMO-10482 on Route 1; DEMO-10491 and DEMO-10503 on Route 12; DEMO-10484 unrouted. All within 18 miles on the same service day.',
      recommendationIds: ['REC-001', 'REC-004', 'REC-005'],
      routeIds: ['RT-01', 'RT-12'],
      orderIds: ['DEMO-10482', 'DEMO-10484', 'DEMO-10491', 'DEMO-10503'],
    },
    {
      claim: 'Three orders contain delivery-window or access details that should be confirmed before final routing.',
      evidence: 'DEMO-10495 has no window and no unload equipment. DEMO-10503 has an unconfirmed job-site access note. DEMO-10531 has no length restriction.',
      recommendationIds: ['REC-010'],
      routeIds: ['RT-12'],
      orderIds: ['DEMO-10495', 'DEMO-10503', 'DEMO-10531'],
    },
    {
      claim: 'Route 12 is at risk of missing its second appointment based on the current loading delay.',
      evidence: 'Planned departure 08:15, actual 08:52. Projected job-site arrival 11:22 against an appointment window closing at 11:15.',
      recommendationIds: ['REC-018'],
      routeIds: ['RT-12'],
      orderIds: ['DEMO-10503'],
    },
  ],
}

export const transportSnapshot = {
  privateFleetRoutes: routes.filter((r) => r.mode === 'Private fleet').length,
  thirdPartyRoutes: routes.filter((r) => r.mode === 'Third party').length,
  plannedMiles: routes.reduce((s, r) => s + r.plannedMiles, 0),
  averageUtilization: Math.round(routes.reduce((s, r) => s + utilization(r), 0) / routes.length),
  dispatched: routes.filter((r) => ['Dispatched', 'In transit', 'Complete'].includes(r.status)).length,
  planning: routes.filter((r) => ['Planning', 'Loading'].includes(r.status)).length,
  trucksAssigned: routes.filter((r) => r.truckId).length,
  carrierLoads: routes.filter((r) => r.mode === 'Third party').length,
}

export const orderPressure = {
  awaitingRouting: orders.filter((o) => o.status === 'Released for Routing' && !o.routeId).length,
  incompleteInformation: ordersRequiringReview.length,
  lateChanges: orders.filter((o) => o.lastChangeAt).length,
  cutoffRisk: orders.filter((o) => o.status === 'Entered' || o.status === 'Under Review').length,
  onHold: orders.filter((o) => o.status === 'On Hold').length,
}

export { agentById as agentLookup }
export function agentName(id: string): string {
  return agentById.get(id)?.name ?? id
}

export const DISCLAIMER_SHORT = 'Demonstration Environment — Sanitized Sample Data'
export const DISCLAIMER_LONG =
  'This interactive concept uses simulated information to demonstrate how branch operations, routing, dispatch, and management intelligence could work together. No Boise Cascade production systems or customer data are connected.'
