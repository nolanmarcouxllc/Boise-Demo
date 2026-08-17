/**
 * The ten branch intelligence capabilities.
 *
 * Each one answers a management question no other capability answers. The four
 * previously overlapping routing agents (Order Consolidation, Duplicate-Stop,
 * Route Overlap, Multi-Vehicle Optimization) are merged into Capability 1.
 */

export type InfoStatus = 'KNOWN' | 'DEMONSTRATION' | 'ASSUMPTION' | 'TECHNICAL VALIDATION REQUIRED' | 'MEASUREMENT REQUIRED'

export const statusMeaning: Record<InfoStatus, string> = {
  KNOWN: 'Supported by confirmed conversation notes.',
  DEMONSTRATION: 'Created to make the concept interactive.',
  ASSUMPTION: 'Requires correction from Boise operations.',
  'TECHNICAL VALIDATION REQUIRED': 'Requires Boise IT, DMSi, Trimble, or another application owner.',
  'MEASUREMENT REQUIRED': 'Business value cannot be calculated until Boise provides a baseline.',
}

export const statusColor: Record<InfoStatus, string> = {
  KNOWN: '#148345',
  DEMONSTRATION: '#1F5F99',
  ASSUMPTION: '#D98A00',
  'TECHNICAL VALIDATION REQUIRED': '#7A4FA3',
  'MEASUREMENT REQUIRED': '#667069',
}

export type Department =
  | 'Dispatch / Operations'
  | 'Customer Service / Order Entry'
  | 'Warehouse / Yard'
  | 'Transportation'
  | 'Branch Management'
  | 'Branch Management / Finance'

export interface Capability {
  key: string
  n: number
  name: string
  short: string
  /** The management question only this capability answers. */
  question: string
  department: Department
  owner: string
  supportsSystem: string
  newValue: string
  measurement: string
  validation: InfoStatus
  /** Live state shown in the activity table. */
  status: string
  statusTone: 'green' | 'amber' | 'red' | 'blue'
  activity: string
  glyph: string

  // ---- drawer content
  problemDetected: string
  whyItMatters: string
  evidence: string[]
  systemsInvolved: string[]
  whatItAdds: string
  whatItDoesNotReplace: string
  recommendation: string
  alternative: string
  assumptions: string[]
  risks: string[]
  measurableOutcome: string
  technicalValidation: string
  /** Respectful differentiation from tools Boise may already run. */
  vsExisting: string
  infoStatus: InfoStatus
}

export const capabilities: Capability[] = [
  {
    key: 'consolidation',
    n: 1,
    name: 'Delivery Consolidation Intelligence',
    short: 'Delivery Consolidation',
    question: 'Are we sending more trucks or miles than the orders actually require?',
    department: 'Dispatch / Operations',
    owner: 'Dispatcher or operations manager',
    supportsSystem: 'Trimble / PC*MILER routing',
    newValue: 'Finds candidate orders and prepares clean constraints before routing runs',
    measurement: 'Avoidable routes and miles',
    validation: 'MEASUREMENT REQUIRED',
    status: 'Detecting',
    statusTone: 'green',
    activity: '3 compatible orders in one service area',
    glyph: 'consolidate',
    problemDetected:
      'Three orders are scheduled within an 18-mile service area on the same day, across two separate routes.',
    whyItMatters:
      'Separate deliveries to the same area consume a truck, a driver and a departure slot that another customer could have used. The pattern is hard to see because the orders were written by different people on different days.',
    evidence: [
      'Three orders inside an 18-mile radius, same requested service day.',
      'Two routes covering 31 shared corridor miles in each direction.',
      'Combined weight stays inside the assigned deck capacity.',
      'One customer yard scheduled twice, 95 minutes apart.',
    ],
    systemsInvolved: ['Order records (Agility in the branch environment)', 'Route plans (Trimble in the branch environment)', 'Delivery location profiles'],
    whatItAdds:
      'Identifies candidate orders, assembles the constraints, compares the current plan against a combined scenario, and explains why consolidation may or may not work.',
    whatItDoesNotReplace:
      'It does not calculate the route. Trimble remains the routing engine; approved scenarios are sent to it rather than around it.',
    recommendation: 'Send the combined scenario to the dispatcher alongside the current plan for review.',
    alternative: 'Keep both routes and stagger the arrivals so the customer yard is not scheduled twice in one window.',
    assumptions: [
      'Product on the candidate orders is compatible on one deck.',
      'The customer accepts both purchase orders arriving on one vehicle.',
      'Delivery windows overlap enough to serve both stops.',
    ],
    risks: [
      'Some customers prohibit merging purchase orders on one bill of lading.',
      'A single combined route becomes a single point of failure for a key account.',
    ],
    measurableOutcome: 'Routes and miles removed after dispatcher review, measured against a Boise-provided baseline.',
    technicalValidation: 'Confirm how order and route data can be read, and whether scenarios can be submitted to the routing engine.',
    vsExisting:
      'Trimble optimizes the orders it is given. This looks at the orders before that point and asks whether the right set was handed over — across dates, customers and readiness, which is information the routing engine does not receive.',
    infoStatus: 'DEMONSTRATION',
  },
  {
    key: 'readiness',
    n: 2,
    name: 'Order Readiness Gate',
    short: 'Order Readiness',
    question: 'Is every order actually ready to be routed and delivered correctly?',
    department: 'Customer Service / Order Entry',
    owner: 'Customer service, order entry, or operations',
    supportsSystem: 'DMSi Agility order records',
    newValue: 'An operational checkpoint before an order reaches routing',
    measurement: 'Orders corrected before routing',
    validation: 'ASSUMPTION',
    status: 'Monitoring',
    statusTone: 'green',
    activity: '4 orders missing routing-critical detail',
    glyph: 'watchdog',
    problemDetected:
      'Four orders are marked for routing but are missing delivery-window, unloading or access information that could affect the route plan.',
    whyItMatters:
      'A route built on incomplete information looks valid until the truck arrives. The correction then costs a phone call, a re-plan, or a second trip.',
    evidence: [
      'One order with no delivery window recorded.',
      'Two orders with no unloading equipment requirement.',
      'One order with a product length that exceeds the assigned deck.',
      'One order revised after its route had already been generated.',
    ],
    systemsInvolved: ['Order records', 'Customer and location profiles', 'Inventory availability'],
    whatItAdds:
      'Checks the fields routing depends on at the moment of release, and presents each gap to the order owner with the stored value ready to confirm.',
    whatItDoesNotReplace:
      'It does not edit orders and is not a replacement for order entry. Agility remains the system of record; this is a checkpoint in front of routing.',
    recommendation: 'Hold the four orders from routing until the missing fields are confirmed by the order owner.',
    alternative: 'Release them and correct at the dock, accepting the re-handle cost.',
    assumptions: [
      'The missing values exist on a customer or location record and only need confirmation.',
      'Order entry has authority to complete these fields.',
    ],
    risks: ['A stored default can be wrong for a job site that moves week to week.', 'Too many gates slow order release.'],
    measurableOutcome: 'Count of orders corrected before routing versus corrected at the dock.',
    technicalValidation: 'Confirm which order fields are available, and at what point an order is considered released.',
    vsExisting:
      'Agility holds this information well. What is missing is a check that the specific fields routing needs are present at the moment of release, rather than discovered later by a dispatcher or a driver.',
    infoStatus: 'ASSUMPTION',
  },
  {
    key: 'memory',
    n: 3,
    name: 'Customer Delivery Memory',
    short: 'Delivery Memory',
    question: 'What does the branch know about this location that is not captured consistently in the order?',
    department: 'Customer Service / Order Entry',
    owner: 'Customer service, dispatch, or branch operations',
    supportsSystem: 'Customer and location records',
    newValue: 'Turns individual employee knowledge into shared operational memory',
    measurement: 'Repeat delivery exceptions avoided',
    validation: 'ASSUMPTION',
    status: 'Learning',
    statusTone: 'blue',
    activity: '1 location exceeding expected service time',
    glyph: 'brief',
    problemDetected:
      'One delivery location has exceeded its expected service time on four of its last six modeled deliveries and requires a piggyback forklift.',
    whyItMatters:
      'This kind of knowledge usually lives in one dispatcher’s head, an inbox, or a note taped to a monitor. When that person is out, the branch relearns it the expensive way.',
    evidence: [
      'Six modeled deliveries at this location: 103, 88, 61, 92, 57 and 86 minutes.',
      'Planning value in use: 55 minutes.',
      'Recorded access condition: no forklift on site, street-side unload.',
    ],
    systemsInvolved: ['Delivery location profiles', 'Proof-of-delivery timestamps', 'Dispatcher and driver notes'],
    whatItAdds:
      'Keeps approved operational knowledge about a location — access, equipment, receiving behaviour, typical stop duration — attached to the location rather than to a person.',
    whatItDoesNotReplace:
      'It is not a CRM and does not hold customer commercial information. It records how a delivery physically works.',
    recommendation: 'Attach the confirmed access and equipment conditions to the location record and use them in planning.',
    alternative: 'Continue relying on the dispatcher who knows the site.',
    assumptions: [
      'This knowledge is not already captured consistently somewhere in Agility.',
      'Branch staff are willing to record it.',
    ],
    risks: [
      'Stale notes become misleading once a site changes.',
      'Nothing here should hold personal information about a customer contact.',
    ],
    measurableOutcome: 'Reduction in repeat access, equipment and service-time exceptions at known locations.',
    technicalValidation: 'Confirm whether location-level operational notes already exist and where they should live.',
    vsExisting:
      'Agility holds the customer and ship-to record. This adds the operational behaviour of the location over time — how long it really takes, what equipment it needs, what went wrong last time — which is usually captured informally today.',
    infoStatus: 'ASSUMPTION',
  },
  {
    key: 'change',
    n: 4,
    name: 'Last-Minute Change Impact Simulator',
    short: 'Change Impact',
    question: 'If this order changes now, what else does it affect?',
    department: 'Dispatch / Operations',
    owner: 'Dispatch or operations manager',
    supportsSystem: 'Order and route plans',
    newValue: 'Explains consequences before someone approves the change',
    measurement: 'Late changes evaluated before dispatch',
    validation: 'DEMONSTRATION',
    status: 'Simulating',
    statusTone: 'amber',
    activity: '3 late changes traced to their impact',
    glyph: 'change',
    problemDetected:
      'Six units were added to an order after its route was planned and while the truck was loading.',
    whyItMatters:
      'The weight is trivial. The consequence is not: the bundle has to load last to come off first, and that stop holds the tightest appointment window on the board.',
    evidence: [
      'Change received 06:12; route generated 05:20; truck loading since 05:45.',
      'Added weight 420 lbs against remaining deck capacity.',
      'Affected stop window: 90 minutes, with detention billed after 60 minutes on site.',
    ],
    systemsInvolved: ['Order change log', 'Route plan', 'Load plan', 'Customer appointment rules'],
    whatItAdds:
      'Traces a single change through capacity, load sequence, delivery timing, other customers on the same truck, and third-party capacity — before the change is accepted.',
    whatItDoesNotReplace:
      'It does not accept or reject the change and does not instruct the yard. It shows the dispatcher what the change touches.',
    recommendation: 'Re-sequence the load and keep both stops, with dispatcher approval before the yard is instructed.',
    alternative: 'Deliver the original quantity today and send the balance on the next run to the same lane.',
    assumptions: ['The yard can re-sequence before the scheduled departure.'],
    risks: ['Re-sequencing delays departure, which is the risk this change was meant to avoid.'],
    measurableOutcome: 'Share of late changes evaluated before dispatch rather than absorbed at the dock.',
    technicalValidation: 'Confirm whether order revisions are timestamped and observable after route generation.',
    vsExisting:
      'Both Agility and Trimble will show the changed order. Neither is positioned to explain what the change does to the other stops on that truck, the loading sequence, and the appointment behind it.',
    infoStatus: 'DEMONSTRATION',
  },
  {
    key: 'capacity',
    n: 5,
    name: 'Capacity and Mode Decision Support',
    short: 'Capacity & Mode',
    question: 'What is the best approved way to move this freight with the capacity available?',
    department: 'Transportation',
    owner: 'Transportation or branch operations',
    supportsSystem: 'Fleet and approved carrier records',
    newValue: 'One explainable fleet-versus-carrier decision instead of a cost comparison',
    measurement: 'Private-fleet utilization and third-party decisions',
    validation: 'MEASUREMENT REQUIRED',
    status: 'Comparing',
    statusTone: 'green',
    activity: '2 routes reviewed for mode',
    glyph: 'fleet',
    problemDetected:
      'Two routes were flagged for mode review. One should stay on the private fleet; the other cannot be executed by the truck assigned to it.',
    whyItMatters:
      'Choosing on price alone can select an option that cannot physically complete the delivery, or give away a truck that was about to be in the right place for the next load.',
    evidence: [
      'Route 5 returns to the yard by 09:15 and carries the only long deck the plant requires.',
      'Route 11 is a single stop with roughly half its miles run empty.',
      'The unit assigned to Route 11 has no boom or piggyback; the site cannot unload without one.',
    ],
    systemsInvolved: ['Truck and driver availability', 'Approved carrier table', 'Route plans', 'Customer priority'],
    whatItAdds:
      'Weighs capacity, positioning, driver hours, equipment suitability, empty return miles, customer priority and incremental cost in one comparison, and states why.',
    whatItDoesNotReplace:
      'It does not tender loads and cannot use a carrier that is not already approved.',
    recommendation: 'Retain Route 5 on the private fleet. Review Route 11 for third-party coverage with the required unloading equipment.',
    alternative: 'Hold Route 11 and combine it with the next delivery to the same area on a correctly equipped unit.',
    assumptions: ['An approved carrier with the required equipment is available for a same-day tender.'],
    risks: [
      'The carrier option costs more. Price is not the deciding factor here — the private option cannot unload the site.',
      'Carrier approval status has to be current.',
    ],
    measurableOutcome: 'Private-fleet utilization and the share of mode decisions with a recorded reason.',
    technicalValidation: 'Confirm where approved carrier rates and equipment attributes are maintained.',
    vsExisting:
      'Routing tells you the best sequence for a given vehicle. This asks the prior question — which vehicle or carrier should have the load at all — using fleet position and equipment fit that the routing engine is not asked to weigh.',
    infoStatus: 'DEMONSTRATION',
  },
  {
    key: 'yard',
    n: 6,
    name: 'Yard, Loading and Departure Coordinator',
    short: 'Yard & Departure',
    question: 'Will today’s route plan actually leave the yard on time?',
    department: 'Warehouse / Yard',
    owner: 'Warehouse, yard, dispatch, or operations manager',
    supportsSystem: 'Warehouse and yard execution',
    newValue: 'Connects the transportation plan to physical execution',
    measurement: 'On-time departures and staging readiness',
    validation: 'ASSUMPTION',
    status: 'Action Required',
    statusTone: 'red',
    activity: 'Route 12 projected 40 minutes late',
    glyph: 'multi',
    problemDetected:
      'Route 12 is projected to leave 40 minutes late because Truck 108 remains in maintenance and two orders have not reached staging.',
    whyItMatters:
      'A route can be perfectly planned and still fail. If the truck, the product, the driver and the load are not ready together, the plan was never real.',
    evidence: [
      'Truck 108 released from maintenance 40 minutes behind schedule.',
      'Two orders on the route have not reached staging.',
      'The route carries an appointment that closes 30 minutes after the projected arrival.',
    ],
    systemsInvolved: ['Route plan', 'Picking and staging status', 'Equipment availability', 'Driver arrival'],
    whatItAdds:
      'Watches the physical preconditions for departure and raises the risk while there is still time to move a stop, a truck, or a customer conversation.',
    whatItDoesNotReplace:
      'It does not manage the warehouse or direct the yard. It connects yard state to the transportation plan.',
    recommendation: 'Notify the affected site now, or move the at-risk stop to a route that is ready to depart.',
    alternative: 'Hold the departure and accept the appointment miss.',
    assumptions: [
      'Picking and staging status is observable at the order level.',
      'Maintenance release timing can be seen by dispatch.',
    ],
    risks: ['If staging status is captured on paper, this capability has nothing to read.'],
    measurableOutcome: 'On-time departure rate and the share of late departures predicted before they happened.',
    technicalValidation: 'Confirm whether picking, staging and maintenance release states exist in a readable form.',
    vsExisting:
      'This is the gap neither system is positioned to close. Trimble plans the route and Agility holds the order, but whether the load is physically ready to leave is tracked in the yard, often verbally.',
    infoStatus: 'ASSUMPTION',
  },
  {
    key: 'risk',
    n: 7,
    name: 'Delivery Risk and Recovery',
    short: 'Delivery Risk',
    question: 'Which deliveries are likely to fail, and what can we do before the customer is affected?',
    department: 'Dispatch / Operations',
    owner: 'Dispatcher or customer service',
    supportsSystem: 'Dispatch and delivery tracking',
    newValue: 'Manages the risk before the failure instead of reporting it afterwards',
    measurement: 'At-risk deliveries recovered before failure',
    validation: 'DEMONSTRATION',
    status: 'Watching',
    statusTone: 'amber',
    activity: '3 deliveries outside their window',
    glyph: 'exception',
    problemDetected: 'Three deliveries are currently projected to fall outside their delivery window.',
    whyItMatters:
      'A late delivery discovered after the fact is a service failure. The same information an hour earlier is a phone call and a rescheduled arrival.',
    evidence: [
      'One route departed 37 minutes late with an appointment stop remaining.',
      'One stop projected past a window that closes at 11:15.',
      'One site requires a superintendent present and will not accept an unattended drop.',
    ],
    systemsInvolved: ['Route progress', 'Delivery windows', 'Driver hours', 'Stop duration history'],
    whatItAdds:
      'Names the affected customer, the time remaining, the recovery options, the owner, and whether a customer conversation is required.',
    whatItDoesNotReplace: 'It does not contact customers and does not reroute a truck on its own.',
    recommendation: 'Call the affected site now and confirm a revised arrival, or move the stop to a later route.',
    alternative: 'Let the delivery run and handle the miss afterwards.',
    assumptions: ['Route progress is observable during the day.'],
    risks: ['Alerting on every projected delay trains people to ignore the queue. The threshold has to be set by the branch.'],
    measurableOutcome: 'At-risk deliveries recovered before the customer was affected.',
    technicalValidation: 'Confirm what live or near-live route progress information is available and approved for use.',
    vsExisting:
      'Dispatch systems show where the truck is. This adds what that position means for the specific customer window ahead of it, and what can still be done about it.',
    infoStatus: 'DEMONSTRATION',
  },
  {
    key: 'learning',
    n: 8,
    name: 'Planned-versus-Actual Learning',
    short: 'Planned vs. Actual',
    question: 'What did yesterday teach us that should improve tomorrow’s plan?',
    department: 'Branch Management',
    owner: 'Operations management',
    supportsSystem: 'Route actuals and reporting',
    newValue: 'A feedback loop instead of unrelated daily reports',
    measurement: 'Planning assumptions corrected',
    validation: 'MEASUREMENT REQUIRED',
    status: 'Comparing',
    statusTone: 'green',
    activity: '1 planning assumption to correct',
    glyph: 'variance',
    problemDetected:
      'One delivery location consistently requires about 31 minutes more service time than the current planning assumption.',
    whyItMatters:
      'The variance is visible today, but the cause is not, so the same error is planned again next week and every route containing that stop inherits it.',
    evidence: [
      'Planned service time 55 minutes; six-delivery average 86 minutes.',
      'Four of the last six deliveries exceeded the planned value.',
      'Corridor actual miles ran 4.6% above plan across the modeled window.',
    ],
    systemsInvolved: ['Route actuals', 'Proof-of-delivery timestamps', 'Planning parameters'],
    whatItAdds:
      'Compares plan to actual at the stop level, groups the repeated causes, and proposes a specific parameter change with the observations behind it.',
    whatItDoesNotReplace:
      'It does not change a planning parameter on its own, and it will not propose a rule from fewer than five observations.',
    recommendation: 'Raise the planning value for this location after supervisor approval, then re-check in four weeks.',
    alternative: 'Leave the parameter and always schedule this stop last on its route.',
    assumptions: ['Actual arrival and departure times are captured reliably.'],
    risks: ['Six observations is a small sample. A rule set from it has to be reviewed, not set and forgotten.'],
    measurableOutcome: 'Number of planning assumptions corrected and the resulting change in plan-versus-actual variance.',
    technicalValidation: 'Confirm whether stop-level actual times are retained and exportable.',
    vsExisting:
      'Reporting shows the variance. This proposes the specific planning change that would remove it, with the evidence attached and a person required to approve it.',
    infoStatus: 'MEASUREMENT REQUIRED',
  },
  {
    key: 'cost',
    n: 9,
    name: 'True Cost-to-Serve Intelligence',
    short: 'Cost to Serve',
    question: 'Which orders and customers create value after the real cost of serving them?',
    department: 'Branch Management / Finance',
    owner: 'Branch management or finance',
    supportsSystem: 'Agility accounting and margin data',
    newValue: 'Adds operational service cost to the margin picture',
    measurement: 'Contribution after operational service costs',
    validation: 'MEASUREMENT REQUIRED',
    status: 'Illustrative',
    statusTone: 'blue',
    activity: 'Model prepared, awaiting cost baseline',
    glyph: 'consolidate',
    problemDetected:
      'Delivery cost is not currently attached to the order or customer that caused it, so operational profitability is estimated rather than measured.',
    whyItMatters:
      'Revenue alone does not show whether an order, route or customer is operationally profitable. Two customers with identical margin can differ sharply once stop duration, equipment and repeat attempts are counted.',
    evidence: [
      'Stop duration varies from 25 to 103 minutes across modeled locations.',
      'One location requires specialized unloading equipment on every visit.',
      'Empty return miles are not currently attributed to any order.',
    ],
    systemsInvolved: ['Order and margin data', 'Freight expense', 'Fleet miles', 'Stop duration history'],
    whatItAdds:
      'Attaches the operational cost of serving to the order and the customer, so contribution can be seen after the cost of delivering it.',
    whatItDoesNotReplace:
      'It is not an accounting system and does not restate financial results. Agility remains the source of financial truth.',
    recommendation: 'Treat every figure here as illustrative until Boise supplies a cost baseline.',
    alternative: 'Limit this capability to relative comparison between locations rather than absolute cost.',
    assumptions: [
      'A cost-per-mile and a loaded labour rate can be agreed with finance.',
      'Complete accounting data is not available during this demonstration.',
    ],
    risks: [
      'Presenting a cost-to-serve number without a validated baseline is the fastest way to lose credibility with finance.',
      'Attribution rules are a business decision, not a technical one.',
    ],
    measurableOutcome: 'Contribution per order and per customer after operational service cost, once a baseline exists.',
    technicalValidation: 'Requires finance agreement on cost attribution before any figure is presented as real.',
    vsExisting:
      'Agility holds margin and freight expense. What is missing is the operational cost of the delivery itself — stop time, equipment, repeat attempts — attributed back to the order that caused it.',
    infoStatus: 'MEASUREMENT REQUIRED',
  },
  {
    key: 'brief',
    n: 10,
    name: 'Branch Management Brief and Decision Memory',
    short: 'Management Brief',
    question: 'What needs attention, what changed, and what decisions are waiting on us?',
    department: 'Branch Management',
    owner: 'Branch manager',
    supportsSystem: 'Existing branch reporting',
    newValue: 'Converts branch information into an explainable priority list with decision history',
    measurement: 'Decision response time and overdue exceptions',
    validation: 'DEMONSTRATION',
    status: 'Ready',
    statusTone: 'green',
    activity: '3 decisions waiting on management',
    glyph: 'brief',
    problemDetected: 'Three decisions are waiting on management before the dispatch commit, each with a different owner.',
    whyItMatters:
      'Decisions made in the moment are rarely recorded with their reasoning, so the branch cannot tell later whether the call was right.',
    evidence: [
      'Route 6 equipment decision, owner branch manager.',
      'Route 11 mode decision, owner transportation supervisor.',
      'Route 12 consolidation decision, owner dispatcher.',
    ],
    systemsInvolved: ['Every other capability', 'Exception queue', 'Route actuals'],
    whatItAdds:
      'One priority list where every statement traces to its records, plus a decision memory recording what was decided, by whom, why, and what actually happened.',
    whatItDoesNotReplace:
      'It is not a second reporting system and does not replace existing branch reports.',
    recommendation: 'Review the three decisions with their evidence before the dispatch commit.',
    alternative: 'Decide the two transportation items and defer the consolidation to tomorrow’s plan.',
    assumptions: ['The branch wants decisions recorded, not just outcomes.'],
    risks: ['A brief that cannot trace a statement to a record is just another dashboard.'],
    measurableOutcome: 'Time from exception raised to decision recorded, and count of overdue exceptions.',
    technicalValidation: 'Minimal — this capability reads what the others produce.',
    vsExisting:
      'Existing reports say what happened. This says what needs a decision today, who owns it, what it is based on, and what the last decision like it produced.',
    infoStatus: 'DEMONSTRATION',
  },
]

export const capabilityByKey = new Map(capabilities.map((c) => [c.key, c]))

/** Where each existing system sits relative to the concept. */
export const systemRoles = [
  {
    name: 'DMSi Agility',
    role: 'System of record',
    detail:
      'Primary operational system of record for approved order, customer, product, inventory, purchasing, accounting and branch information.',
    tone: '#1F5F99',
  },
  {
    name: 'Trimble / PC*MILER',
    role: 'Routing engine',
    detail: 'Approved routing and transportation calculation engine where applicable.',
    tone: '#7A4FA3',
  },
  {
    name: 'Branch Intelligence Command Center',
    role: 'The layer between them',
    detail:
      'Connects approved information, validates operational readiness, detects cross-system exceptions, compares competing priorities, explains recommendations, organizes human decisions, records why they were made, and compares planned with actual outcomes.',
    tone: '#148345',
  },
]

export const POSITIONING =
  'The command center does not need to replace the systems that already work. Its value is connecting the decisions that happen between them.'

/** Plain-English glossary for the Teach Me toggle. */
export const glossary: Array<{ term: string; plain: string }> = [
  { term: 'API', plain: 'An agreed doorway one system opens so another can read or send specific information, without a person retyping it.' },
  { term: 'System of record', plain: 'The one system everyone agrees holds the true version of something. If two systems disagree, this one wins.' },
  { term: 'Data validation', plain: 'Checking that information is complete and sensible before anything downstream depends on it.' },
  { term: 'Optimization', plain: 'Choosing the best option out of many under fixed limits — like the shortest route that still meets every delivery window.' },
  { term: 'Constraint', plain: 'A limit the answer must respect: truck capacity, a receiving window, an equipment requirement, a driver’s hours.' },
  { term: 'Exception', plain: 'Something that needs a person because it falls outside the normal path.' },
  { term: 'Confidence', plain: 'How sure the system is, based on how much supporting evidence it found. Low confidence means look harder before acting.' },
  { term: 'Human approval', plain: 'A required step where a named person says yes before anything happens. Nothing here executes without one.' },
  { term: 'Planned versus actual', plain: 'Comparing what was expected with what really happened, so the next plan starts closer to reality.' },
  { term: 'Integration', plain: 'Connecting two systems so approved information moves between them reliably instead of by re-keying.' },
  { term: 'Audit trail', plain: 'A record of what was decided, by whom, when, and on what basis — so the decision can be explained later.' },
]

export const CLASSIFICATIONS = [
  { key: 'confirmed', label: 'Accurate' },
  { key: 'partially_accurate', label: 'Partially accurate' },
  { key: 'inaccurate', label: 'Not how Westfield operates' },
  { key: 'already_handled', label: 'Already handled well' },
  { key: 'valuable_gap', label: 'Valuable gap' },
  { key: 'needs_it_validation', label: 'Needs IT validation' },
  { key: 'explore_later', label: 'Worth exploring later' },
] as const

export type ClassificationKey = (typeof CLASSIFICATIONS)[number]['key']
