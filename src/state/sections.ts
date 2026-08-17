import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Flag,
  Gauge,
  LayoutGrid,
  Map as MapIcon,
  Network,
  Route as RouteIcon,
  ScrollText,
  Split,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface SectionDef {
  id: string
  label: string
  navLabel: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  act: string
  actTitle: string
  presenterNote: string
}

/** The guided sequence and the explore navigation share one ordered list. */
export const sections: SectionDef[] = [
  {
    id: 'opening',
    label: 'Opening',
    navLabel: 'Opening',
    icon: Flag,
    act: 'Act 1',
    actTitle: 'The invisible problem',
    presenterNote:
      'Two orders create avoidable route overlap. Walk the workflow once, then show where the problem becomes visible today — after delivery.',
  },
  {
    id: 'overview',
    label: 'Branch Overview',
    navLabel: 'Branch Overview',
    icon: LayoutGrid,
    act: 'Act 2',
    actTitle: 'The command center sees it',
    presenterNote: 'Start with the five priorities. Use SHOW ME WHY on the management brief to prove every statement traces to a record.',
  },
  {
    id: 'agents',
    label: 'Agent Network',
    navLabel: 'Agent Network',
    icon: Network,
    act: 'Act 2',
    actTitle: 'The command center sees it',
    presenterNote: 'Ten services, four groups, one shared context. Hover an agent to show what it is not allowed to do on its own.',
  },
  {
    id: 'order-flow',
    label: 'Order Flow',
    navLabel: 'Order Flow',
    icon: ClipboardList,
    act: 'Act 2',
    actTitle: 'The command center sees it',
    presenterNote: 'Ask them to correct this. Use Edit Workflow to capture what is different at Westfield while they are talking.',
  },
  {
    id: 'control-tower',
    label: 'Transportation Control Tower',
    navLabel: 'Control Tower',
    icon: MapIcon,
    act: 'Act 3',
    actTitle: 'The dispatcher stays in control',
    presenterNote: 'Open Route 12. Show the at-risk stop, then the recommendation, then the approval requirement.',
  },
  {
    id: 'exceptions',
    label: 'Exception Center',
    navLabel: 'Exception Center',
    icon: AlertTriangle,
    act: 'Act 3',
    actTitle: 'The dispatcher stays in control',
    presenterNote: 'One inbox, twelve categories. Filter to Unassigned — that is usually the conversation that starts.',
  },
  {
    id: 'lab',
    label: 'Route Optimization Lab',
    navLabel: 'Optimization Lab',
    icon: Split,
    act: 'Act 3',
    actTitle: 'The dispatcher stays in control',
    presenterNote: 'Let them change something. Ask what constraint the model is missing.',
  },
  {
    id: 'planned-actual',
    label: 'Planned vs. Actual',
    navLabel: 'Planned vs. Actual',
    icon: BarChart3,
    act: 'Act 4',
    actTitle: 'Execution creates new information',
    presenterNote: 'Route 3 ran 71 minutes long and 48 of them were at one stop. Ask whether they already know that.',
  },
  {
    id: 'brief',
    label: 'Management Intelligence',
    navLabel: 'Management Brief',
    icon: ScrollText,
    act: 'Act 5',
    actTitle: 'Management learns before the next day',
    presenterNote: 'Trace every statement. The point is that management sees the reason, not just the number.',
  },
  {
    id: 'opportunity',
    label: 'Opportunity and Value',
    navLabel: 'Opportunity & Value',
    icon: Gauge,
    act: 'Act 5',
    actTitle: 'Management learns before the next day',
    presenterNote: 'Change the assumptions in front of them. The formula is on screen — this is a range, not a promise.',
  },
  {
    id: 'discovery',
    label: 'Discovery Board',
    navLabel: 'Discovery Board',
    icon: Activity,
    act: 'Act 6',
    actTitle: 'Boise corrects the model',
    presenterNote: 'Stop presenting. Capture what is different at Westfield, who owns it, and what to ask IT.',
  },
  {
    id: 'next-step',
    label: 'Next Step',
    navLabel: 'Next Step',
    icon: RouteIcon,
    act: 'Act 7',
    actTitle: 'The right next step',
    presenterNote: 'Name the participants and the agenda. Build the scoping summary from what was captured.',
  },
]

export const sectionById = new Map(sections.map((s) => [s.id, s]))
export const sectionIndex = (id: string) => sections.findIndex((s) => s.id === id)
