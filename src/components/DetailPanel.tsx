import { ArrowRight, Package, Truck, User } from 'lucide-react'
import {
  agentById,
  carrierById,
  customerById,
  customerName,
  driverById,
  exceptionById,
  exceptions,
  locationById,
  locationCity,
  locationName,
  orderById,
  orders,
  productBySku,
  recommendationById,
  recommendations,
  routeById,
  routeLabel,
  routes,
  truckById,
  utilization,
} from '../data'
import type { Order, Route } from '../data/types'
import { useApp } from '../state/AppContext'
import { RecommendationCard } from './RecommendationCard'
import { BulletList, Chip, ConfidenceMeter, Drawer, KeyValue, PermissionBadge, ProgressBar, SeverityChip } from './ui'

export function DetailPanel() {
  const { selection, clearSelection } = useApp()
  if (!selection) return null

  const content = renderContent(selection.kind, selection.id)
  return (
    <Drawer open onClose={clearSelection} eyebrow={content.eyebrow} title={content.title}>
      {content.body}
    </Drawer>
  )
}

function renderContent(kind: string, id: string): { eyebrow: string; title: string; body: React.ReactNode } {
  switch (kind) {
    case 'order': {
      const order = orderById.get(id)
      if (!order) return notFound('Order', id)
      return { eyebrow: `Order · ${order.status}`, title: order.id, body: <OrderDetail order={order} /> }
    }
    case 'route': {
      const route = routeById.get(id)
      if (!route) return notFound('Route', id)
      return { eyebrow: `Route · ${route.status}`, title: `Route ${route.number} — ${route.name}`, body: <RouteDetail route={route} /> }
    }
    case 'exception': {
      const exc = exceptionById.get(id)
      if (!exc) return notFound('Exception', id)
      return { eyebrow: `${exc.id} · ${exc.category}`, title: exc.title, body: <ExceptionDetail id={id} /> }
    }
    case 'recommendation': {
      const rec = recommendationById.get(id)
      if (!rec) return notFound('Recommendation', id)
      return { eyebrow: 'Recommendation', title: rec.title, body: <RecommendationCard rec={rec} /> }
    }
    case 'agent': {
      const agent = agentById.get(id)
      if (!agent) return notFound('Agent', id)
      return { eyebrow: `Agent ${agent.number} · ${agent.group}`, title: agent.name, body: <AgentDetail id={id} /> }
    }
    case 'customer': {
      const c = customerById.get(id)
      if (!c) return notFound('Customer', id)
      return { eyebrow: `Customer · ${c.segment}`, title: c.name, body: <CustomerDetail id={id} /> }
    }
    default:
      return notFound('Record', id)
  }
}

function notFound(label: string, id: string) {
  return {
    eyebrow: label,
    title: id,
    body: (
      <p className="text-sm text-charcoal-500">
        This record exists in the branch totals but is not modeled in detail in this demonstration data set.
      </p>
    ),
  }
}

function LinkButton({ kind, id, label }: { kind: 'order' | 'route' | 'exception' | 'recommendation' | 'customer' | 'agent'; id: string; label: string }) {
  const { select } = useApp()
  return (
    <button type="button" onClick={() => select(kind, id)} className="btn btn-secondary btn-sm">
      {label} <ArrowRight className="h-3 w-3" aria-hidden />
    </button>
  )
}

function OrderDetail({ order }: { order: Order }) {
  const { select } = useApp()
  const loc = locationById.get(order.locationId)
  const relatedRecs = recommendations.filter((r) => r.relatedOrderIds.includes(order.id))
  const relatedExc = exceptions.filter((e) => e.relatedOrderIds.includes(order.id))
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Chip tone="neutral">{order.status}</Chip>
        <Chip tone="blue">{order.fleetEligibility}</Chip>
        {order.routeId && <Chip tone="green">{routeLabel(order.routeId)}</Chip>}
        {order.dataFlags.length > 0 && <Chip tone="amber">{order.dataFlags.length} data flag(s)</Chip>}
      </div>

      <dl>
        <KeyValue label="Customer">
          <button type="button" className="link-underline" onClick={() => select('customer', order.customerId)}>
            {customerName(order.customerId)}
          </button>
        </KeyValue>
        <KeyValue label="Deliver to">
          {locationName(order.locationId)} — {loc?.address}, {locationCity(order.locationId)} {loc?.zip}
        </KeyValue>
        <KeyValue label="Requested date / window">
          {order.requestedDate} · {order.window[0]}–{order.window[1]}
          {loc?.appointmentRequired ? ' · appointment required' : ''}
        </KeyValue>
        <KeyValue label="Weight / longest product">
          {order.totalWeightLbs.toLocaleString()} lbs · {order.maxLengthFt} ft
        </KeyValue>
        <KeyValue label="Order value">${order.valueUsd.toLocaleString()}</KeyValue>
        <KeyValue label="Written by">{order.writtenBy}</KeyValue>
        <KeyValue label="Unload equipment">{loc?.unloadEquipment}</KeyValue>
        <KeyValue label="Site notes">{loc?.accessNotes}</KeyValue>
        <KeyValue label="Order notes">{order.notes}</KeyValue>
      </dl>

      <div>
        <div className="label-caps mb-2">Order lines</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-200 text-left">
              <th scope="col" className="label-caps py-1.5">SKU</th>
              <th scope="col" className="label-caps py-1.5">Description</th>
              <th scope="col" className="label-caps py-1.5 text-right">Qty</th>
              <th scope="col" className="label-caps py-1.5 text-right">Weight</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l) => (
              <tr key={l.sku} className="data-row">
                <td className="py-1.5 font-mono text-[12px]">{l.sku}</td>
                <td className="py-1.5 text-charcoal-600">{productBySku.get(l.sku)?.description}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">{l.qty}</td>
                <td className="py-1.5 text-right font-mono tabular-nums">{l.weightLbs.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.lastChangeAt && (
        <div className="rounded-[3px] border-l-[3px] border-alert-warn bg-alert-warn/5 px-3 py-2.5">
          <div className="label-caps mb-1 text-alert-warn">Change after routing</div>
          <p className="text-sm text-charcoal-700">
            {order.lastChangeAt.replace('T', ' ')} — {order.lastChangeNote}
          </p>
        </div>
      )}

      {order.dataFlags.length > 0 && (
        <div>
          <div className="label-caps mb-2">Data flags raised by the watchdog</div>
          <BulletList items={order.dataFlags} tone="risk" />
        </div>
      )}

      {(relatedRecs.length > 0 || relatedExc.length > 0 || order.routeId) && (
        <div>
          <div className="label-caps mb-2">Connected records</div>
          <div className="flex flex-wrap gap-2">
            {order.routeId && <LinkButton kind="route" id={order.routeId} label={routeLabel(order.routeId)} />}
            {relatedExc.map((e) => (
              <LinkButton key={e.id} kind="exception" id={e.id} label={e.id} />
            ))}
            {relatedRecs.map((r) => (
              <LinkButton key={r.id} kind="recommendation" id={r.id} label={r.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function RouteDetail({ route }: { route: Route }) {
  const { select } = useApp()
  const truck = route.truckId ? truckById.get(route.truckId) : null
  const driver = route.driverId ? driverById.get(route.driverId) : null
  const carrier = route.carrierId ? carrierById.get(route.carrierId) : null
  const util = utilization(route)
  const relatedRecs = recommendations.filter((r) => r.relatedRouteIds.includes(route.id))
  const relatedExc = exceptions.filter((e) => e.relatedRouteIds.includes(route.id))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Chip tone={route.health === 'ok' ? 'green' : route.health === 'attention' ? 'amber' : 'red'}>{route.status}</Chip>
        <Chip tone={route.mode === 'Private fleet' ? 'green' : 'timber'}>{route.mode}</Chip>
        <Chip tone="neutral">{route.corridor}</Chip>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="panel p-3">
          <div className="label-caps mb-2 flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" aria-hidden /> Equipment
          </div>
          {truck ? (
            <p className="text-sm text-charcoal-700">
              Unit {truck.unit} · {truck.type} · {truck.capacityLbs.toLocaleString()} lbs · {truck.deckLengthFt} ft deck
              <span className="mt-1 block text-[12px] text-charcoal-500">{truck.notes}</span>
            </p>
          ) : carrier ? (
            <p className="text-sm text-charcoal-700">
              {carrier.name} · {carrier.equipment.join(', ')}
              <span className="mt-1 block text-[12px] text-charcoal-500">
                On-time {carrier.onTimePct}% · ${carrier.avgCostPerMile.toFixed(2)}/mile · approved through {carrier.approvedThrough}
              </span>
            </p>
          ) : (
            <p className="text-sm text-alert-critical">No equipment assigned. This route cannot be released.</p>
          )}
        </div>
        <div className="panel p-3">
          <div className="label-caps mb-2 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" aria-hidden /> Driver
          </div>
          {driver ? (
            <p className="text-sm text-charcoal-700">
              {driver.name} · shift {driver.shiftStart} · {driver.hoursAvailable} hours available
              <span className="mt-1 block text-[12px] text-charcoal-500">{driver.endorsements.join(' · ')}</span>
            </p>
          ) : (
            <p className="text-sm text-charcoal-500">{carrier ? 'Carrier-supplied driver.' : 'No driver assigned.'}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Planned miles" value={String(route.plannedMiles)} sub={route.actualMiles ? `actual ${route.actualMiles}` : undefined} />
        <Stat
          label="Duration"
          value={`${Math.floor(route.plannedDurationMin / 60)}h ${route.plannedDurationMin % 60}m`}
          sub={route.actualDurationMin ? `actual ${Math.floor(route.actualDurationMin / 60)}h ${route.actualDurationMin % 60}m` : undefined}
        />
        <Stat label="Weight" value={`${route.weightLbs.toLocaleString()} lbs`} sub={`of ${route.capacityLbs.toLocaleString()}`} />
        <Stat label="Cost estimate" value={`$${route.costEstimateUsd}`} sub="illustrative" />
      </div>

      <div>
        <div className="label-caps mb-2">Capacity utilization</div>
        <ProgressBar pct={util} tone={util > 85 ? 'amber' : 'green'} label={`Capacity utilization ${util} percent`} />
      </div>

      <div>
        <div className="label-caps mb-2">Stops</div>
        <ol className="space-y-2">
          {route.stops.map((s) => (
            <li key={s.seq} className="rounded-[3px] border border-charcoal-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    {s.seq}. {locationName(s.locationId)}
                  </div>
                  <div className="text-[12px] text-charcoal-500">{locationCity(s.locationId)}</div>
                </div>
                <SeverityChip
                  severity={s.status === 'At risk' ? 'critical' : s.status === 'Complete' ? 'resolved' : 'info'}
                  label={s.status}
                />
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-charcoal-600 sm:grid-cols-4">
                <div>
                  <dt className="label-caps">Planned</dt>
                  <dd className="font-mono">
                    {s.plannedArrival}–{s.plannedDepart}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps">Actual</dt>
                  <dd className="font-mono">{s.actualArrival ? `${s.actualArrival}–${s.actualDepart ?? '—'}` : '—'}</dd>
                </div>
                <div>
                  <dt className="label-caps">Weight</dt>
                  <dd className="font-mono">{s.weightLbs.toLocaleString()} lbs</dd>
                </div>
                <div>
                  <dt className="label-caps">Service</dt>
                  <dd className="font-mono">{s.serviceMinutes} min</dd>
                </div>
              </dl>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.orderIds.map((oid) => (
                  <LinkButton key={oid} kind="order" id={oid} label={oid} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {relatedExc.length > 0 && (
        <div>
          <div className="label-caps mb-2">Current exceptions</div>
          <div className="space-y-2">
            {relatedExc.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => select('exception', e.id)}
                className="flex w-full items-start gap-2 rounded-[3px] border border-charcoal-200 px-3 py-2 text-left transition-colors hover:border-alert-critical/50"
              >
                <SeverityChip severity={e.severity} />
                <span className="text-sm text-charcoal-700">{e.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {relatedRecs.length > 0 && (
        <div>
          <div className="label-caps mb-2">Agent recommendations for this route</div>
          <div className="flex flex-wrap gap-2">
            {relatedRecs.map((r) => (
              <LinkButton key={r.id} kind="recommendation" id={r.id} label={`${r.id} — ${r.title.slice(0, 42)}…`} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[3px] border border-charcoal-200 bg-charcoal-50 px-3 py-2.5 text-[13px] text-charcoal-600">
        <span className="font-semibold">Required approvals:</span>{' '}
        {relatedRecs.length ? Array.from(new Set(relatedRecs.map((r) => r.requiredApprover))).join(', ') : 'None outstanding for this route.'}
      </div>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[3px] border border-charcoal-200 px-3 py-2">
      <div className="label-caps leading-tight">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-charcoal-900">{value}</div>
      {sub && <div className="text-[11px] text-charcoal-400">{sub}</div>}
    </div>
  )
}

export function ExceptionDetail({ id }: { id: string }) {
  const exc = exceptionById.get(id)
  if (!exc) return null
  const agent = agentById.get(exc.detectedByAgentId)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <SeverityChip severity={exc.severity} />
        <Chip tone="neutral">{exc.category}</Chip>
        <Chip tone={exc.status === 'Resolved' ? 'green' : 'amber'}>{exc.status}</Chip>
        {exc.overdue && <Chip tone="red">Overdue</Chip>}
        {exc.unassigned && <Chip tone="red">Unassigned</Chip>}
      </div>
      <dl>
        <KeyValue label="Business impact">{exc.businessImpact}</KeyValue>
        <KeyValue label="Owner">{exc.owner}</KeyValue>
        <KeyValue label="Detected">{exc.detectedAt.replace('T', ' ')} by {agent?.name}</KeyValue>
        <KeyValue label="Deadline">{exc.deadline.replace('T', ' ')}</KeyValue>
        <KeyValue label="Recommended action">{exc.recommendedAction}</KeyValue>
        <KeyValue label="Escalation path">{exc.escalationPath}</KeyValue>
        <KeyValue label="Resolution notes">{exc.resolutionNotes || 'None recorded yet.'}</KeyValue>
      </dl>
      <div>
        <div className="label-caps mb-2">Connected records</div>
        <div className="flex flex-wrap gap-2">
          {exc.relatedRouteIds.map((rid) => (
            <LinkButton key={rid} kind="route" id={rid} label={routeLabel(rid)} />
          ))}
          {exc.relatedOrderIds.map((oid) => (
            <LinkButton key={oid} kind="order" id={oid} label={oid} />
          ))}
          {exc.relatedCustomerIds.map((cid) => (
            <LinkButton key={cid} kind="customer" id={cid} label={customerName(cid)} />
          ))}
          <LinkButton kind="agent" id={exc.detectedByAgentId} label={agent?.shortName ?? exc.detectedByAgentId} />
        </div>
      </div>
    </div>
  )
}

export function AgentDetail({ id }: { id: string }) {
  const agent = agentById.get(id)
  if (!agent) return null
  const recs = recommendations.filter((r) => r.agentId === id)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <PermissionBadge level={agent.permission} />
        <Chip tone="neutral">{agent.status}</Chip>
        <Chip tone="blue">{agent.group}</Chip>
      </div>

      <p className="text-sm leading-relaxed text-charcoal-700">{agent.purpose}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Items monitored" value={String(agent.itemsMonitored)} />
        <Stat label="Findings today" value={String(agent.findingsToday)} />
        <Stat label="Awaiting review" value={String(agent.recommendationsWaiting)} />
        <Stat label="Last activity" value={agent.lastActivity.slice(11)} sub={agent.lastActivity.slice(0, 10)} />
      </div>

      <div>
        <div className="label-caps mb-1">Confidence</div>
        <ConfidenceMeter confidence={agent.confidence} pct={agent.confidencePct} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="label-caps mb-2">Monitors</div>
          <BulletList items={agent.monitors} />
        </div>
        <div>
          <div className="label-caps mb-2">Data sources used</div>
          <BulletList items={agent.dataSources} />
        </div>
      </div>

      <div>
        <div className="label-caps mb-2">Findings today</div>
        <ul className="space-y-2">
          {agent.findings.map((f) => (
            <li key={f.id} className="rounded-[3px] border border-charcoal-200 p-3">
              <p className="text-sm leading-relaxed text-charcoal-700">{f.summary}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-charcoal-400">{f.at.replace('T', ' ')}</span>
                {f.relatedRouteIds?.map((rid) => (
                  <LinkButton key={rid} kind="route" id={rid} label={routeLabel(rid)} />
                ))}
                {f.relatedOrderIds?.slice(0, 3).map((oid) => (
                  <LinkButton key={oid} kind="order" id={oid} label={oid} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[3px] border-l-[3px] border-alert-critical bg-alert-critical/5 px-3 py-2.5">
        <div className="label-caps mb-2 text-alert-critical">Not allowed to do automatically</div>
        <BulletList items={agent.notAllowedTo} tone="risk" />
        <p className="mt-2 text-[13px] text-charcoal-600">
          <span className="font-semibold">Human approval:</span> {agent.humanApproval}
        </p>
      </div>

      <div>
        <div className="label-caps mb-2">Recommendations ({recs.length})</div>
        <div className="space-y-4">
          {recs.map((r) => (
            <RecommendationCard key={r.id} rec={r} compact />
          ))}
        </div>
      </div>
    </div>
  )
}

function CustomerDetail({ id }: { id: string }) {
  const c = customerById.get(id)
  if (!c) return null
  const locs = Array.from(locationById.values()).filter((l) => l.customerId === id)
  const custOrders = orders.filter((o) => o.customerId === id)
  const custRoutes = routes.filter((r) => r.stops.some((s) => locs.some((l) => l.id === s.locationId)))
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Chip tone="green">{c.tier} account</Chip>
        <Chip tone="neutral">{c.segment}</Chip>
        <Chip tone="neutral">Customer since {c.since}</Chip>
      </div>
      <dl>
        <KeyValue label="Simulated annual volume">${c.annualVolumeUsd.toLocaleString()}</KeyValue>
        <KeyValue label="Contacts">
          {c.contacts.map((ct) => `${ct.name} (${ct.role})`).join(' · ')}
        </KeyValue>
      </dl>
      <div>
        <div className="label-caps mb-2">Operating rules the branch has agreed to</div>
        <BulletList items={c.rules} />
      </div>
      <div>
        <div className="label-caps mb-2">Delivery locations</div>
        <ul className="space-y-2">
          {locs.map((l) => (
            <li key={l.id} className="rounded-[3px] border border-charcoal-200 p-3 text-sm">
              <div className="font-semibold">{l.name}</div>
              <div className="text-[12px] text-charcoal-500">
                {l.city}, {l.state} · {l.milesFromBranch} mi · {l.window[0]}–{l.window[1]} · {l.unloadEquipment}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="label-caps mb-2 flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" aria-hidden /> Orders in this data set ({custOrders.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {custOrders.map((o) => (
            <LinkButton key={o.id} kind="order" id={o.id} label={o.id} />
          ))}
        </div>
      </div>
      {custRoutes.length > 0 && (
        <div>
          <div className="label-caps mb-2">Routes serving this customer today</div>
          <div className="flex flex-wrap gap-2">
            {custRoutes.map((r) => (
              <LinkButton key={r.id} kind="route" id={r.id} label={routeLabel(r.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
