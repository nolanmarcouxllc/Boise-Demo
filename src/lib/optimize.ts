import { branch, locationById } from '../data'

/**
 * A deliberately simple planning heuristic used only to make the sandbox respond
 * to changes in a way that is directionally honest.
 *
 * This is NOT a routing engine and is not represented as one anywhere in the
 * interface. It is a sweep-and-bin-pack model with a straight-line distance
 * estimate and a fixed road factor.
 */

const ROAD_FACTOR = 1.24
const EARTH_MI = 3958.8

export interface LabOrder {
  id: string
  label: string
  locationId: string
  weightLbs: number
  serviceMinutes: number
  windowStart: string
  windowEnd: string
  privateOnly: boolean
  thirdPartyEligible: boolean
  requiresPiggyback: boolean
  requiresBoom: boolean
  maxTruckFt: number
  included: boolean
  day: 'today' | 'tomorrow'
}

export interface LabSettings {
  capacityLbs: number
  trucksAvailable: number
  costPerMile: number
  avgSpeedMph: number
  departHour: number
  maxStopsPerRoute: number
}

export interface LabRoute {
  index: number
  orderIds: string[]
  miles: number
  weightLbs: number
  durationMin: number
  utilizationPct: number
  lateStops: number
  bearing: number
  centroid: [number, number]
}

export interface LabResult {
  routes: LabRoute[]
  trucksRequired: number
  totalMiles: number
  totalCost: number
  averageUtilization: number
  onTimeConfidence: number
  driverHours: number
  serviceRisks: string[]
  overlappingRoutes: number
  unplanned: string[]
}

function haversine(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_MI * Math.asin(Math.sqrt(h))
}

function bearingFromBranch(p: [number, number]): number {
  const angle = Math.atan2(p[1] - branch.lon, p[0] - branch.lat)
  return (angle * 180) / Math.PI
}

const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`

export function plan(orders: LabOrder[], settings: LabSettings): LabResult {
  const active = orders.filter((o) => o.included && o.day === 'today')
  const points = new Map<string, [number, number]>()
  active.forEach((o) => {
    const loc = locationById.get(o.locationId)
    if (loc) points.set(o.id, [loc.lat, loc.lon])
  })

  // Sweep by bearing so geographically adjacent work lands on the same truck.
  const sorted = [...active].sort((a, b) => {
    const pa = points.get(a.id)
    const pb = points.get(b.id)
    if (!pa || !pb) return 0
    return bearingFromBranch(pa) - bearingFromBranch(pb)
  })

  const bins: LabOrder[][] = []
  let current: LabOrder[] = []
  let currentWeight = 0
  for (const o of sorted) {
    const wouldExceed = currentWeight + o.weightLbs > settings.capacityLbs || current.length >= settings.maxStopsPerRoute
    if (wouldExceed && current.length) {
      bins.push(current)
      current = []
      currentWeight = 0
    }
    current.push(o)
    currentWeight += o.weightLbs
  }
  if (current.length) bins.push(current)

  const unplanned: string[] = []
  const usable = bins.slice(0, settings.trucksAvailable)
  bins.slice(settings.trucksAvailable).forEach((b) => b.forEach((o) => unplanned.push(o.id)))

  const serviceRisks: string[] = []
  const routes: LabRoute[] = usable.map((bin, index) => {
    // Nearest-neighbour sequence starting from the branch.
    const remaining = [...bin]
    const seq: LabOrder[] = []
    let cursor: [number, number] = [branch.lat, branch.lon]
    while (remaining.length) {
      let best = 0
      let bestD = Infinity
      remaining.forEach((o, i) => {
        const p = points.get(o.id)
        if (!p) return
        const d = haversine(cursor, p)
        if (d < bestD) {
          bestD = d
          best = i
        }
      })
      const chosen = remaining.splice(best, 1)[0]
      seq.push(chosen)
      cursor = points.get(chosen.id) ?? cursor
    }

    let miles = 0
    let clock = settings.departHour * 60
    let lateStops = 0
    let prev: [number, number] = [branch.lat, branch.lon]
    const lats: number[] = []
    const lons: number[] = []

    seq.forEach((o) => {
      const p = points.get(o.id)
      if (!p) return
      const leg = haversine(prev, p) * ROAD_FACTOR
      miles += leg
      clock += (leg / settings.avgSpeedMph) * 60
      const winStart = toMinutes(o.windowStart)
      const winEnd = toMinutes(o.windowEnd)
      if (clock < winStart) clock = winStart
      if (clock > winEnd) {
        lateStops += 1
        serviceRisks.push(`${o.label} — projected arrival ${fmt(clock)} is after the ${o.windowEnd} window closes.`)
      }
      clock += o.serviceMinutes
      lats.push(p[0])
      lons.push(p[1])
      prev = p
    })

    const back = haversine(prev, [branch.lat, branch.lon]) * ROAD_FACTOR
    miles += back
    clock += (back / settings.avgSpeedMph) * 60

    const weightLbs = seq.reduce((s, o) => s + o.weightLbs, 0)
    const centroid: [number, number] = [
      lats.reduce((a, b) => a + b, 0) / Math.max(1, lats.length),
      lons.reduce((a, b) => a + b, 0) / Math.max(1, lons.length),
    ]

    // Equipment feasibility is checked but never silently "solved".
    seq.forEach((o) => {
      if (o.requiresBoom) serviceRisks.push(`${o.label} — requires a boom unit; confirm equipment before this plan is used.`)
      else if (o.requiresPiggyback) serviceRisks.push(`${o.label} — requires a piggyback; confirm equipment before this plan is used.`)
      if (o.privateOnly && !o.thirdPartyEligible && settings.trucksAvailable < 2) {
        serviceRisks.push(`${o.label} — private-fleet only with limited units available.`)
      }
    })

    return {
      index: index + 1,
      orderIds: seq.map((o) => o.id),
      miles: Math.round(miles),
      weightLbs,
      durationMin: Math.round(clock - settings.departHour * 60),
      utilizationPct: Math.round((weightLbs / settings.capacityLbs) * 100),
      lateStops,
      bearing: bearingFromBranch(centroid),
      centroid,
    }
  })

  let overlapping = 0
  for (let i = 0; i < routes.length; i += 1) {
    for (let j = i + 1; j < routes.length; j += 1) {
      if (haversine(routes[i].centroid, routes[j].centroid) < 22) overlapping += 1
    }
  }

  const totalMiles = routes.reduce((s, r) => s + r.miles, 0)
  const totalStops = routes.reduce((s, r) => s + r.orderIds.length, 0)
  const lateStops = routes.reduce((s, r) => s + r.lateStops, 0)

  return {
    routes,
    trucksRequired: routes.length,
    totalMiles,
    totalCost: Math.round(totalMiles * settings.costPerMile),
    averageUtilization: routes.length ? Math.round(routes.reduce((s, r) => s + r.utilizationPct, 0) / routes.length) : 0,
    onTimeConfidence: totalStops ? Math.round(((totalStops - lateStops) / totalStops) * 100) : 100,
    driverHours: Math.round((routes.reduce((s, r) => s + r.durationMin, 0) / 60) * 10) / 10,
    serviceRisks: Array.from(new Set(serviceRisks)),
    overlappingRoutes: overlapping,
    unplanned,
  }
}
