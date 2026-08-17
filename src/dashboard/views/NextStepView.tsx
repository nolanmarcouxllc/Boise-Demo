import { BoiseLogo } from '../BoiseLogo'
import { ViewPanel } from './shared'

const PARTICIPANTS = ['Steve', 'Westfield branch leadership', 'Operations or dispatch owner', 'Warehouse or yard owner', 'Boise IT or integration representative', 'DMSi Agility application owner', 'Trimble or routing application owner', 'Nolan', 'Implementation lead']
const AGENDA = ['Correct the current-state workflow.', 'Identify what Agility and Trimble already handle well.', 'Identify the gaps between those systems.', 'Confirm available data and integration methods.', 'Define Boise’s security requirements.', 'Select one narrow pilot.', 'Agree on the baseline and success measurement.', 'Return with architecture and commercial options only after validation.']
const SCOPE = ['Is this workflow unique to Westfield?', 'Do other branches use the same order-to-route process?', 'Are the same manual handoffs repeated elsewhere?', 'Which rules are corporate standards?', 'Which rules are branch-specific?', 'Could a successful Westfield pilot create a reusable branch model?']

export function NextStepView() {
  return (
    <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2.5">
      <ViewPanel title="The responsible next step">
        <BoiseLogo height={24} onDark={false} />
        <p className="mt-3 text-[14px] font-semibold leading-snug text-ink">Confirm the workflow before designing the solution.</p>
        <div className="cond mt-3 text-[9.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Recommended participants</div>
        <ul className="mt-1">
          {PARTICIPANTS.map((p) => (
            <li key={p} className="border-b border-lineSoft py-[5px] text-[12px] text-ink last:border-0">{p}</li>
          ))}
        </ul>
        <p className="mt-3 rounded-sm2 border-l-[3px] border-danger bg-shell px-3 py-2 text-[11.5px] leading-snug text-ink">
          No technical build, timeline, savings estimate, or commercial structure should be promised until the workflow and infrastructure are validated.
        </p>
      </ViewPanel>

      <ViewPanel title="Agenda">
        <ol>
          {AGENDA.map((a, i) => (
            <li key={a} className="flex gap-2.5 border-b border-lineSoft py-[7px] last:border-0">
              <span className="num cond w-4 shrink-0 text-[11.5px] font-bold text-forest">{i + 1}</span>
              <span className="text-[12px] leading-snug text-ink">{a}</span>
            </li>
          ))}
        </ol>
      </ViewPanel>

      <ViewPanel title="Westfield problem or network opportunity?">
        <ul>
          {SCOPE.map((q) => (
            <li key={q} className="border-b border-lineSoft py-[7px] text-[12px] leading-snug text-ink last:border-0">{q}</li>
          ))}
        </ul>
        <p className="mt-3 text-[11.5px] leading-snug text-inkSoft">
          Westfield could provide a practical environment for determining whether the opportunity is local, repeatable, or not worth pursuing.
        </p>
      </ViewPanel>
    </div>
  )
}
