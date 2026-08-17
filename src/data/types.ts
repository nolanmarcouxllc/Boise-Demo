/**
 * Data model for the demonstration environment.
 *
 * Every record in this application is fictional and generated for the purpose of
 * illustrating a workflow. Nothing here originates from a production system.
 */

export type Severity = 'critical' | 'warning' | 'watch' | 'resolved'
export type Confidence = 'high' | 'medium' | 'low'
export type PermissionLevel = 'observe' | 'recommend' | 'approve-execute'
export type Health = 'ok' | 'attention' | 'risk'

export interface Branch {
  id: string
  name: string
  city: string
  state: string
  lat: number
  lon: number
  serviceRadiusMiles: number
  shifts: string[]
  cutoffLocal: string
}

export interface Contact {
  id: string
  name: string
  role: string
  phone: string
  email: string
}

export interface Customer {
  id: string
  name: string
  segment: 'Pro Dealer' | 'Component Manufacturer' | 'Retail Lumberyard' | 'Specialty Distributor'
  tier: 'Key' | 'Core' | 'Developing'
  since: number
  contacts: Contact[]
  /** Operating rules the branch has agreed to. Shown in agent evidence. */
  rules: string[]
  annualVolumeUsd: number
}

export interface DeliveryLocation {
  id: string
  customerId: string
  name: string
  kind: 'Yard' | 'Job Site' | 'Plant' | 'Distribution Center'
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lon: number
  milesFromBranch: number
  /** Local receiving window, 24h clock. */
  window: [string, string]
  appointmentRequired: boolean
  unloadEquipment: 'Forklift on site' | 'Piggyback required' | 'Boom truck required' | 'Roll-off / hand unload'
  accessNotes: string
  avgServiceMinutes: number
  restrictions: string[]
}

export interface Product {
  sku: string
  description: string
  category: 'Engineered Wood' | 'Panel' | 'Dimensional Lumber' | 'Siding & Trim' | 'Treated' | 'Composite Decking' | 'Roofing'
  unit: 'MBF' | 'PCS' | 'SQ' | 'LF' | 'UNIT'
  lbsPerUnit: number
  lengthFt: number
  bunkable: boolean
}

export interface OrderLine {
  sku: string
  qty: number
  unit: Product['unit']
  weightLbs: number
  lengthFt: number
}

export type OrderStatus =
  | 'Entered'
  | 'Under Review'
  | 'Released for Routing'
  | 'Routed'
  | 'Loaded'
  | 'In Transit'
  | 'Delivered'
  | 'On Hold'

export interface Order {
  id: string
  customerId: string
  locationId: string
  status: OrderStatus
  createdAt: string
  requestedDate: string
  window: [string, string]
  lines: OrderLine[]
  totalWeightLbs: number
  maxLengthFt: number
  valueUsd: number
  routeId: string | null
  fleetEligibility: 'Private fleet only' | 'Third party eligible' | 'Either'
  writtenBy: string
  /** Flags the watchdog agent looks at. */
  dataFlags: string[]
  notes: string
  lastChangeAt?: string
  lastChangeNote?: string
}

export interface Truck {
  id: string
  unit: string
  type: 'Flatbed w/ piggyback' | 'Flatbed' | 'Curtainside' | 'Boom truck' | 'Straight truck'
  capacityLbs: number
  deckLengthFt: number
  homeBranch: string
  status: 'Available' | 'Assigned' | 'In Service' | 'Maintenance'
  notes: string
}

export interface Driver {
  id: string
  name: string
  shiftStart: string
  hoursAvailable: number
  endorsements: string[]
  status: 'Available' | 'On route' | 'Off duty'
  territoryFamiliarity: string[]
}

export interface Carrier {
  id: string
  name: string
  equipment: string[]
  serviceArea: string
  onTimePct: number
  avgCostPerMile: number
  approvedThrough: string
  notes: string
}

export interface RouteStop {
  seq: number
  locationId: string
  orderIds: string[]
  plannedArrival: string
  plannedDepart: string
  actualArrival?: string
  actualDepart?: string
  weightLbs: number
  serviceMinutes: number
  status: 'Planned' | 'Complete' | 'At risk' | 'In progress'
  podId?: string
}

export interface Route {
  id: string
  number: number
  name: string
  date: string
  truckId: string | null
  driverId: string | null
  carrierId?: string | null
  mode: 'Private fleet' | 'Third party'
  status: 'Planning' | 'Loading' | 'Dispatched' | 'In transit' | 'Complete' | 'At risk'
  corridor: string
  stops: RouteStop[]
  plannedMiles: number
  actualMiles?: number
  plannedDurationMin: number
  actualDurationMin?: number
  plannedDepart: string
  actualDepart?: string
  weightLbs: number
  capacityLbs: number
  progressPct: number
  /** Simplified road-following path used for map rendering. */
  path: Array<[number, number]>
  exceptionIds: string[]
  costEstimateUsd: number
  health: Health
}

export interface ExceptionRecord {
  id: string
  title: string
  category:
    | 'Order data'
    | 'Inventory'
    | 'Loading'
    | 'Routing'
    | 'Driver'
    | 'Equipment'
    | 'Carrier'
    | 'Customer appointment'
    | 'Delivery'
    | 'POD'
    | 'Billing'
    | 'System integration'
  severity: Severity
  businessImpact: string
  owner: string
  detectedAt: string
  status: 'Open' | 'Acknowledged' | 'In progress' | 'Resolved'
  recommendedAction: string
  deadline: string
  escalationPath: string
  relatedOrderIds: string[]
  relatedRouteIds: string[]
  relatedCustomerIds: string[]
  relatedTruckIds: string[]
  detectedByAgentId: string
  financialRisk: boolean
  customerRisk: boolean
  transportation: boolean
  unassigned: boolean
  overdue: boolean
  resolutionNotes: string
}

export interface Recommendation {
  id: string
  agentId: string
  title: string
  detected: string
  whyItMatters: string
  evidence: string[]
  confidence: Confidence
  confidencePct: number
  expectedImpact: string
  impactMetrics: Array<{ label: string; value: string }>
  assumptions: string[]
  risks: string[]
  recommendedAction: string
  requiredApprover: string
  alternativeAction: string
  permission: PermissionLevel
  status: 'Awaiting review' | 'Approved' | 'Dismissed' | 'In discussion'
  createdAt: string
  relatedOrderIds: string[]
  relatedRouteIds: string[]
  relatedCustomerIds: string[]
  audit: Array<{ at: string; actor: string; action: string }>
}

export interface AgentFinding {
  id: string
  summary: string
  at: string
  relatedOrderIds?: string[]
  relatedRouteIds?: string[]
}

export interface Agent {
  id: string
  number: number
  name: string
  shortName: string
  group: 'Input Control' | 'Planning' | 'Execution & Learning' | 'Management'
  role: string
  purpose: string
  status: 'Monitoring' | 'Analyzing' | 'Awaiting review' | 'Idle'
  monitors: string[]
  itemsMonitored: number
  findingsToday: number
  recommendationsWaiting: number
  measurableImpact: string
  lastActivity: string
  dataSources: string[]
  confidence: Confidence
  confidencePct: number
  permission: PermissionLevel
  humanApproval: string
  notAllowedTo: string[]
  inputs: string[]
  outputs: string[]
  decisionOwner: string
  findings: AgentFinding[]
  accent: string
}

export interface IntegrationEvent {
  id: string
  at: string
  source: string
  target: string
  type: string
  status: 'Completed' | 'Delayed' | 'Failed' | 'Retried'
  orderId?: string
  detail: string
}

export interface PerformanceDay {
  date: string
  label: string
  plannedMiles: number
  actualMiles: number
  plannedStops: number
  completedStops: number
  plannedDurationMin: number
  actualDurationMin: number
  onTimePct: number
  utilizationPct: number
  routesRun: number
  exceptions: number
}

export interface MeetingNote {
  id: string
  section: string
  text: string
  kind: 'confirmed' | 'assumption' | 'correction' | 'question'
  owner: string
  priority: 'High' | 'Medium' | 'Low'
  createdAt: string
}

export interface WorkflowStep {
  id: string
  index: number
  name: string
  responsiblePerson: string
  responsibleSystem: string
  requiredInputs: string[]
  outputProduced: string
  typicalDelay: string
  manualWork: string
  failureRisk: string
  agentSupport: string
  agentIds: string[]
  humanApproval: string
}
