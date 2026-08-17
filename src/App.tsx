import { useLayoutEffect, useRef, useState } from 'react'
import { AgentActivity } from './dashboard/AgentActivity'
import { CapacityChart } from './dashboard/CapacityChart'
import { Drawer, type Detail } from './dashboard/Drawer'
import { Header } from './dashboard/Header'
import { ManagementBrief } from './dashboard/ManagementBrief'
import { Metrics } from './dashboard/Metrics'
import { Priorities } from './dashboard/Priorities'
import { RouteMapPanel } from './dashboard/RouteMapPanel'
import { Sidebar } from './dashboard/Sidebar'
import type { NavItem } from './dashboard/data'
import { IntelligenceNetworkView } from './dashboard/views/IntelligenceNetworkView'
import { CapabilityValueMapView } from './dashboard/views/CapabilityValueMapView'
import { NextStepView } from './dashboard/views/NextStepView'
import { StoryDeck } from './dashboard/StoryDeck'
import { SystemStatus } from './dashboard/SystemStatus'
import { DiscoveryBoardView } from './dashboard/views/DiscoveryBoardView'
import { ExceptionsView } from './dashboard/views/ExceptionsView'
import { ManagementBriefView } from './dashboard/views/ManagementBriefView'
import { OrderFlowView } from './dashboard/views/OrderFlowView'
import { PlannedActualView } from './dashboard/views/PlannedActualView'
import { RouteLabView } from './dashboard/views/RouteLabView'
import { TransportationView } from './dashboard/views/TransportationView'

/**
 * Column weights are taken from the reference: the map spans the first two
 * bottom-row columns and the priorities panel lines up with the capacity chart,
 * so both rows share one column definition.
 */
const COLS = 'grid-cols-[578fr_286fr_533fr]'

/** Thin timber strip closing the screen. Solid plank segments, no gradient. */
const PLANKS: Array<[string, number]> = [
  ['#DCC7A2', 7],
  ['#E1CFAD', 4],
  ['#D6C098', 6],
  ['#E0CDA8', 5],
  ['#DAC49F', 8],
  ['#E4D3B4', 3],
  ['#D3BC93', 6],
  ['#DECBA6', 5],
  ['#D0B78C', 4],
  ['#E2D1B0', 7],
]

function WoodAccent() {
  return (
    <div aria-hidden className="flex w-full shrink-0 overflow-hidden" style={{ height: 16 }}>
      {[0, 1, 2, 3].map((rep) =>
        PLANKS.map(([color, weight], i) => (
          <span key={`${rep}-${i}`} className="h-full" style={{ backgroundColor: color, flex: `${weight} 1 0%` }} />
        )),
      )}
    </div>
  )
}

/**
 * The board is a fixed 1920x1080 canvas. Any other viewport scales the whole
 * thing rather than reflowing it, so the proportions stay exactly as designed
 * and nothing ever clips.
 */
const CANVAS_W = 1920
const CANVAS_H = 1080

function useCanvasScale() {
  const [scale, setScale] = useState(1)
  const raf = useRef(0)
  useLayoutEffect(() => {
    const measure = () => {
      const s = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H)
      setScale(Number(s.toFixed(4)))
    }
    measure()
    const onResize = () => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf.current)
    }
  }, [])
  return scale
}

export default function App() {
  const [nav, setNav] = useState<NavItem>('Branch Overview')
  const [presenting, setPresenting] = useState(false)
  const [mode, setMode] = useState('Explore Mode')
  const [priority, setPriority] = useState<number | null>(null)
  const [agent, setAgent] = useState<string | null>(null)
  const [showWhy, setShowWhy] = useState(false)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)

  const scale = useCanvasScale()
  const open = (d: Detail) => setDetail(d)

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-white">
      <div
        className="relative flex flex-col overflow-hidden bg-white"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          flex: 'none',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="grid min-h-0 flex-1 grid-cols-[255px_1fr]">
          <Sidebar
            active={nav}
            onSelect={(n) => {
              setNav(n)
              setDetail(null)
            }}
          />

          <div className="grid min-h-0 min-w-0 grid-rows-[82px_1fr]">
            <Header
              presenting={presenting}
              onPresentingChange={setPresenting}
              mode={mode}
              onModeChange={setMode}
              section={nav}
              onOpenStatus={() => setStatusOpen(true)}
            />

            {presenting ? (
              <StoryDeck onEnter={() => setPresenting(false)} />
            ) : nav === 'Branch Overview' ? (
              <div className="grid min-h-0 grid-rows-[104px_minmax(0,398px)_minmax(0,398px)] content-start gap-2.5 px-[18px] pb-3">
                <Metrics onOpen={(id) => open({ kind: 'metric', id })} />

                <div className={`grid min-h-0 gap-2.5 ${COLS}`}>
                  <RouteMapPanel onOpenRoute={(id) => open({ kind: 'route', id })} />
                  <Priorities
                    selected={priority}
                    onSelect={(n) => {
                      setPriority(n)
                      open({ kind: 'priority', id: n })
                    }}
                    onViewAll={() => open({ kind: 'allPriorities' })}
                  />
                </div>

                <div className={`grid min-h-0 gap-2.5 ${COLS}`}>
                  <AgentActivity selected={agent} onSelect={setAgent} onOpen={(id) => open({ kind: 'agent', id })} />
                  <ManagementBrief showWhy={showWhy} onToggle={() => setShowWhy((v) => !v)} />
                  <CapacityChart />
                </div>
              </div>
            ) : (
              <div className="grid min-h-0 px-[18px] pb-3">
                {nav === 'Intelligence Network' && <IntelligenceNetworkView onOpen={open} />}
                {nav === 'Capability Value Map' && <CapabilityValueMapView onOpen={open} />}
                {nav === 'Next Step' && <NextStepView />}
                {nav === 'Order Flow' && <OrderFlowView />}
                {nav === 'Transportation' && <TransportationView onOpen={open} />}
                {nav === 'Exceptions' && <ExceptionsView onOpen={open} />}
                {nav === 'Route Lab' && <RouteLabView />}
                {nav === 'Planned vs. Actual' && <PlannedActualView />}
                {nav === 'Management Brief' && <ManagementBriefView onOpen={open} />}
                {nav === 'Discovery Board' && <DiscoveryBoardView />}
              </div>
            )}
          </div>
        </div>

        <WoodAccent />
        <Drawer detail={detail} onClose={() => setDetail(null)} onOpen={open} />
        <SystemStatus open={statusOpen} onClose={() => setStatusOpen(false)} />
      </div>
    </div>
  )
}
