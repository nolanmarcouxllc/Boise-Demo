import type { ComponentType } from 'react'
import { DetailPanel } from './components/DetailPanel'
import { PresentationControls, Sidebar, TopBar } from './components/Shell'
import { AgentNetwork } from './screens/AgentNetwork'
import { BranchOverview } from './screens/BranchOverview'
import { ControlTower } from './screens/ControlTower'
import { DiscoveryBoard } from './screens/DiscoveryBoard'
import { ExceptionCenter } from './screens/ExceptionCenter'
import { ManagementBrief } from './screens/ManagementBrief'
import { NextStep } from './screens/NextStep'
import { Opening } from './screens/Opening'
import { Opportunity } from './screens/Opportunity'
import { OptimizationLab } from './screens/OptimizationLab'
import { OrderFlow } from './screens/OrderFlow'
import { PlannedVsActual } from './screens/PlannedVsActual'
import { AppProvider, useApp } from './state/AppContext'

const screens: Record<string, ComponentType> = {
  opening: Opening,
  overview: BranchOverview,
  agents: AgentNetwork,
  'order-flow': OrderFlow,
  'control-tower': ControlTower,
  exceptions: ExceptionCenter,
  lab: OptimizationLab,
  'planned-actual': PlannedVsActual,
  brief: ManagementBrief,
  opportunity: Opportunity,
  discovery: DiscoveryBoard,
  'next-step': NextStep,
}

function Screen() {
  const { section } = useApp()
  const Component = screens[section] ?? BranchOverview
  return (
    <div key={section} className="animate-fade-up">
      <Component />
    </div>
  )
}

function Layout() {
  const { mode } = useApp()
  const presenting = mode === 'presentation'

  return (
    <div className={`flex h-screen w-full overflow-hidden ${presenting ? 'presenting' : ''}`}>
      {!presenting && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className={`mx-auto w-full ${presenting ? 'max-w-[1500px] px-8 py-8' : 'max-w-[1600px] px-6 py-6'}`}>
            <Screen />
          </div>
          {presenting && <PresentationControls />}
        </main>
      </div>
      <DetailPanel />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  )
}
