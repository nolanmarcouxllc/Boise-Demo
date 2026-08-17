import { useState } from 'react'
import { AgentActivity } from './dashboard/AgentActivity'
import { CapacityChart } from './dashboard/CapacityChart'
import { Header } from './dashboard/Header'
import { ManagementBrief } from './dashboard/ManagementBrief'
import { Metrics } from './dashboard/Metrics'
import { Priorities } from './dashboard/Priorities'
import { RouteMapPanel } from './dashboard/RouteMapPanel'
import { Sidebar } from './dashboard/Sidebar'
import type { NavItem } from './dashboard/data'

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

export default function App() {
  const [nav, setNav] = useState<NavItem>('Branch Overview')
  const [presenting, setPresenting] = useState(true)
  const [mode, setMode] = useState('Explore Mode')
  const [priority, setPriority] = useState<number | null>(null)
  const [agent, setAgent] = useState<string | null>(null)
  const [showWhy, setShowWhy] = useState(false)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      <div className="grid min-h-0 flex-1 grid-cols-[255px_1fr]">
        <Sidebar active={nav} onSelect={setNav} />

        <div className="grid min-h-0 min-w-0 grid-rows-[82px_1fr]">
          <Header presenting={presenting} onPresentingChange={setPresenting} mode={mode} onModeChange={setMode} />

          <div className="grid min-h-0 grid-rows-[104px_minmax(0,398px)_minmax(0,398px)] content-start gap-2.5 px-[18px] pb-3">
            <Metrics />

            <div className={`grid min-h-0 gap-2.5 ${COLS}`}>
              <RouteMapPanel />
              <Priorities selected={priority} onSelect={(n) => setPriority((p) => (p === n ? null : n))} />
            </div>

            <div className={`grid min-h-0 gap-2.5 ${COLS}`}>
              <AgentActivity selected={agent} onSelect={(id) => setAgent((a) => (a === id ? null : id))} />
              <ManagementBrief showWhy={showWhy} onToggle={() => setShowWhy((v) => !v)} />
              <CapacityChart />
            </div>
          </div>
        </div>
      </div>

      <WoodAccent />
    </div>
  )
}
