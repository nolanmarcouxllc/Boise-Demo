import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip as LTooltip, useMap } from 'react-leaflet'
import { branch, locationById, locationName, routes } from '../data'
import type { Route } from '../data/types'

const HEALTH_COLOR: Record<Route['health'], string> = {
  ok: '#215733',
  attention: '#b46a06',
  risk: '#a52322',
}

/**
 * Tiles are fetched from OpenStreetMap when the network allows it. If they cannot
 * load, the component falls back to a self-contained schematic so the presentation
 * never shows an empty grey box.
 */
function useTilesAvailable(): 'checking' | 'ok' | 'unavailable' {
  const [state, setState] = useState<'checking' | 'ok' | 'unavailable'>('checking')
  useEffect(() => {
    let done = false
    const img = new Image()
    const timeout = window.setTimeout(() => {
      if (!done) {
        done = true
        setState('unavailable')
      }
    }, 4000)
    img.onload = () => {
      if (!done) {
        done = true
        window.clearTimeout(timeout)
        setState('ok')
      }
    }
    img.onerror = () => {
      if (!done) {
        done = true
        window.clearTimeout(timeout)
        setState('unavailable')
      }
    }
    img.src = 'https://tile.openstreetmap.org/8/77/95.png'
    return () => {
      done = true
      window.clearTimeout(timeout)
    }
  }, [])
  return state
}

function FitBounds({ activeRoute }: { activeRoute: Route | null }) {
  const map = useMap()
  useEffect(() => {
    const pts = activeRoute ? activeRoute.path : routes.flatMap((r) => r.path)
    if (!pts.length) return
    map.fitBounds(pts as [number, number][], { padding: [40, 40], maxZoom: activeRoute ? 10 : 9 })
  }, [activeRoute, map])
  return null
}

export function RouteMap({
  selectedRouteId,
  onSelectRoute,
  visibleRouteIds,
  height = 'h-[520px]',
}: {
  selectedRouteId: string | null
  onSelectRoute: (id: string) => void
  visibleRouteIds?: string[]
  height?: string
}) {
  const tiles = useTilesAvailable()
  const shown = useMemo(
    () => (visibleRouteIds ? routes.filter((r) => visibleRouteIds.includes(r.id)) : routes),
    [visibleRouteIds],
  )
  const activeRoute = shown.find((r) => r.id === selectedRouteId) ?? null

  if (tiles === 'unavailable') {
    return <SchematicMap shown={shown} selectedRouteId={selectedRouteId} onSelectRoute={onSelectRoute} height={height} />
  }

  // Wait for the tile probe before mounting Leaflet so a blocked network never
  // fills the console with failed tile requests during a presentation.
  if (tiles === 'checking') {
    return (
      <div className={`flex w-full items-center justify-center rounded-[3px] border border-charcoal-200 bg-[#eceadf] text-sm text-charcoal-500 ${height}`}>
        Loading map…
      </div>
    )
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-[3px] border border-charcoal-200 ${height}`}>
      <MapContainer
        center={[branch.lat, branch.lon]}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
        />
        <FitBounds activeRoute={activeRoute} />

        {shown.map((r) => {
          const active = r.id === selectedRouteId
          return (
            <Polyline
              key={r.id}
              positions={r.path}
              pathOptions={{
                color: HEALTH_COLOR[r.health],
                weight: active ? 6 : 3,
                opacity: selectedRouteId && !active ? 0.28 : 0.85,
                dashArray: r.mode === 'Third party' ? '10 6' : undefined,
              }}
              eventHandlers={{ click: () => onSelectRoute(r.id) }}
            >
              <LTooltip sticky>
                Route {r.number} — {r.name} · {r.plannedMiles} mi · {r.status}
              </LTooltip>
            </Polyline>
          )
        })}

        <CircleMarker center={[branch.lat, branch.lon]} radius={9} pathOptions={{ color: '#14351f', fillColor: '#14351f', fillOpacity: 1 }}>
          <LTooltip permanent direction="right" offset={[8, 0]}>
            Westfield branch
          </LTooltip>
        </CircleMarker>

        {shown.flatMap((r) =>
          r.stops.map((s) => {
            const loc = locationById.get(s.locationId)
            if (!loc) return null
            const color = s.status === 'At risk' ? '#a52322' : s.status === 'Complete' ? '#215733' : '#4b5252'
            return (
              <CircleMarker
                key={`${r.id}-${s.seq}`}
                center={[loc.lat, loc.lon]}
                radius={selectedRouteId === r.id ? 8 : 6}
                pathOptions={{ color, fillColor: '#ffffff', fillOpacity: 1, weight: 3 }}
                eventHandlers={{ click: () => onSelectRoute(r.id) }}
              >
                <LTooltip>
                  <span className="font-semibold">
                    Route {r.number} · Stop {s.seq}
                  </span>
                  <br />
                  {locationName(s.locationId)}
                  <br />
                  {s.plannedArrival}–{s.plannedDepart} · {s.weightLbs.toLocaleString()} lbs · {s.status}
                </LTooltip>
              </CircleMarker>
            )
          }),
        )}
      </MapContainer>
    </div>
  )
}

/** Self-contained fallback: an equirectangular projection of the same geometry. */
function SchematicMap({
  shown,
  selectedRouteId,
  onSelectRoute,
  height,
}: {
  shown: Route[]
  selectedRouteId: string | null
  onSelectRoute: (id: string) => void
  height: string
}) {
  const pts = shown.flatMap((r) => r.path).concat([[branch.lat, branch.lon]])
  const lats = pts.map((p) => p[0])
  const lons = pts.map((p) => p[1])
  const minLat = Math.min(...lats) - 0.06
  const maxLat = Math.max(...lats) + 0.06
  const minLon = Math.min(...lons) - 0.06
  // Extra right-hand padding so city labels are not clipped at the frame edge.
  const maxLon = Math.max(...lons) + 0.22
  const W = 900
  const H = 620
  const x = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * W
  const y = (lat: number) => H - ((lat - minLat) / (maxLat - minLat)) * H

  return (
    <div className={`w-full overflow-hidden rounded-[3px] border border-charcoal-200 bg-[#f3f1e8] ${height}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Schematic map of simulated routes around Westfield">
        <defs>
          <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(26,69,40,0.09)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <text x={12} y={22} className="fill-charcoal-400" fontSize="12" fontFamily="monospace">
          Map tiles unavailable — schematic view of the same simulated geometry
        </text>

        {shown.map((r) => (
          <polyline
            key={r.id}
            points={r.path.map((p) => `${x(p[1])},${y(p[0])}`).join(' ')}
            fill="none"
            stroke={HEALTH_COLOR[r.health]}
            strokeWidth={r.id === selectedRouteId ? 5 : 2.5}
            strokeOpacity={selectedRouteId && r.id !== selectedRouteId ? 0.25 : 0.85}
            strokeDasharray={r.mode === 'Third party' ? '10 6' : undefined}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectRoute(r.id)}
          />
        ))}

        {shown.flatMap((r) =>
          r.stops.map((s) => {
            const loc = locationById.get(s.locationId)
            if (!loc) return null
            return (
              <g key={`${r.id}-${s.seq}`} style={{ cursor: 'pointer' }} onClick={() => onSelectRoute(r.id)}>
                <circle
                  cx={x(loc.lon)}
                  cy={y(loc.lat)}
                  r={6}
                  fill="#fff"
                  stroke={s.status === 'At risk' ? '#a52322' : s.status === 'Complete' ? '#215733' : '#4b5252'}
                  strokeWidth={3}
                />
                <text x={x(loc.lon) + 10} y={y(loc.lat) + 4} fontSize="11" fill="#343a3a">
                  {loc.city}
                </text>
              </g>
            )
          }),
        )}

        <rect x={x(branch.lon) - 7} y={y(branch.lat) - 7} width={14} height={14} fill="#14351f" />
        <text x={x(branch.lon) + 12} y={y(branch.lat) + 5} fontSize="12" fontWeight="700" fill="#14351f">
          Westfield branch
        </text>
      </svg>
    </div>
  )
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-charcoal-600">
      <Legend color="#215733" label="On plan" />
      <Legend color="#b46a06" label="Needs attention" />
      <Legend color="#a52322" label="At risk" />
      <span className="flex items-center gap-1.5">
        <svg width="26" height="6" aria-hidden>
          <line x1="0" y1="3" x2="26" y2="3" stroke="#4b5252" strokeWidth="2.5" strokeDasharray="8 5" />
        </svg>
        Third-party load
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="h-3 w-3 bg-forest-800" /> Branch
      </span>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg width="26" height="6" aria-hidden>
        <line x1="0" y1="3" x2="26" y2="3" stroke={color} strokeWidth="3.5" />
      </svg>
      {label}
    </span>
  )
}
