import { useEffect, useState } from 'react'
import { BoiseLogo } from './BoiseLogo'
import { capabilities, POSITIONING, systemRoles } from './capabilities'
import { StatusLegend } from './views/StatusChip'

/**
 * Presentation Mode. The sequence exists so every capability has a reason to be
 * on the screen by the time it appears — it is not a list of ten ideas up front.
 */
interface Screen {
  eyebrow: string
  title: string
  body: React.ReactNode
}

const SCREENS: Screen[] = [
  {
    eyebrow: 'Westfield, Massachusetts · Building Materials Distribution',
    title: 'Westfield Branch Intelligence Concept',
    body: (
      <div className="max-w-[80ch]">
        <p className="text-[19px] leading-snug text-inkSoft">
          Built from a real operational question: what happens between the order, the route, the yard, the delivery, and the decision?
        </p>
        <p className="mt-6 inline-block rounded-sm2 border border-line bg-shell px-3 py-2 text-[13px] text-inkSoft">
          Demonstration environment — sanitized sample data. No Boise Cascade production system is connected.
        </p>
      </div>
    ),
  },
  {
    eyebrow: 'Screen 2 · What already exists',
    title: 'The branch is not starting from nothing.',
    body: (
      <div className="grid max-w-[110ch] grid-cols-3 gap-4">
        {[
          ['Agility', 'manages core branch information — orders, customers, product, inventory, purchasing and accounting.'],
          ['Trimble / PC*MILER', 'supports routing and transportation calculations where applicable.'],
          ['Boise employees', 'contribute the operational judgment that neither system holds.'],
        ].map(([k, v]) => (
          <div key={k} className="rounded-sm2 border-l-[3px] border-forest bg-shell px-4 py-3">
            <div className="cond text-[15px] font-bold text-ink">{k}</div>
            <p className="mt-1 text-[13.5px] leading-snug text-inkSoft">{v}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Screen 3 · The question',
    title: 'Where does information become a decision — and where can that decision arrive too late?',
    body: (
      <p className="max-w-[80ch] text-[17px] leading-relaxed text-inkSoft">
        Every system in the branch holds part of the picture. The decision that matters usually needs several of them at once, in the twenty minutes
        before a truck leaves.
      </p>
    ),
  },
  {
    eyebrow: 'Screen 4 · One ordinary morning',
    title: 'Two orders, written days apart, going to the same corner of the map.',
    body: (
      <div className="max-w-[95ch]">
        <ol className="space-y-2.5">
          {[
            'Both orders are entered correctly. Nothing is wrong with either one.',
            'They are planned separately, because nothing puts them on one screen at the moment routing happens.',
            'Two trucks are dispatched into overlapping territory, 95 minutes apart.',
            'The duplication becomes visible in a mileage report — after the day is over.',
          ].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="num cond flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[13px] font-bold text-white">{i + 1}</span>
              <span className="pt-1 text-[15.5px] leading-snug text-ink">{t}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    eyebrow: 'Screen 5 · Why consolidation alone is not enough',
    title: 'Combining two orders is the easy part. Making the delivery work is not.',
    body: (
      <div className="grid max-w-[105ch] grid-cols-4 gap-2.5">
        {[
          'Are the orders ready?',
          'Can they ride together?',
          'Is the correct truck available?',
          'Can the yard load it on time?',
          'Does the customer have special requirements?',
          'What happens if something changes?',
          'Did the plan actually work?',
          'What did it really cost to serve?',
        ].map((q) => (
          <div key={q} className="rounded-sm2 border border-line bg-white px-3 py-3 text-[13.5px] font-medium leading-snug text-ink">
            {q}
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Screen 6 · The answer to those questions',
    title: 'Ten capabilities, each answering a different management question.',
    body: (
      <div className="grid max-w-[125ch] grid-cols-5 gap-2">
        {capabilities.map((c) => (
          <div key={c.key} className="rounded-sm2 border border-line bg-white px-2.5 py-2">
            <div className="num cond text-[10px] text-inkFaint">{String(c.n).padStart(2, '0')}</div>
            <div className="cond text-[12.5px] font-bold leading-tight text-ink">{c.short}</div>
            <p className="mt-1 text-[10.5px] leading-snug text-inkSoft">{c.question}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'Screen 7 · Where this started',
    title: 'From a branch-level idea to a working concept',
    body: (
      <div className="grid max-w-[115ch] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-6">
        <div>
          <p className="text-[15px] leading-relaxed text-ink">
            The concept began with a practical observation from inside the Westfield operation: overlapping delivery activity and disconnected planning
            information may create opportunities that are difficult to see early enough.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">
            Steve had already begun exploring the problem through a Python-based consolidation concept. This command-center demonstration builds on that
            operational thinking by showing how the idea could expand into a controlled, explainable branch workflow.
          </p>
          <p className="mt-4 border-l-[3px] border-forest pl-3 text-[14px] italic leading-snug text-inkSoft">
            The strongest technology projects often begin with someone close enough to the operation to recognize the problem before the solution is
            obvious.
          </p>
        </div>
        <div className="rounded-sm2 border border-line bg-shell p-4">
          <div className="cond mb-2 text-[10.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Steve’s operational insight</div>
          <ul className="space-y-2">
            {[
              'The branch already has valuable order and routing systems.',
              'The opportunity may exist between those systems and the daily decisions around them.',
              'Consolidation is not only a routing problem.',
              'Order readiness, loading, customer restrictions, capacity, and actual outcomes all affect whether a route works.',
              'A working concept can help the right stakeholders evaluate the opportunity.',
            ].map((t) => (
              <li key={t} className="flex gap-2 text-[13px] leading-snug text-ink">
                <span aria-hidden className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-forest" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Screen 8 · What you are looking at',
    title: 'What this working concept demonstrates',
    body: (
      <div className="max-w-[110ch]">
        <div className="grid grid-cols-4 gap-3">
          {[
            ['Operational translation', 'Turning a branch problem into a clear, testable workflow.'],
            ['Rapid prototyping', 'Turning an early idea into something leadership can see, challenge, and improve.'],
            ['Systems thinking', 'Connecting orders, routing, transportation, warehouse execution, customer requirements, and management decisions.'],
            ['Implementation depth', 'Access to an implementation team for deeper technical discovery, integration, security review, and enterprise development if Boise identifies a real opportunity.'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-sm2 border border-line bg-white px-3 py-3">
              <div className="cond text-[13px] font-bold uppercase tracking-[0.05em] text-ink">{k}</div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-inkSoft">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-sm2 border-l-[3px] border-forest bg-shell px-4 py-3 text-[14px] leading-snug text-ink">
          The value of the demonstration is not that every assumption is correct. The value is that Boise can now interact with the idea, correct it,
          and decide whether the opportunity deserves deeper technical evaluation.
        </p>
      </div>
    ),
  },
  {
    eyebrow: 'Screen 9 · Scope',
    title: 'Westfield problem or network opportunity?',
    body: (
      <div className="max-w-[105ch]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            'Is this workflow unique to Westfield?',
            'Do other branches use the same order-to-route process?',
            'Are the same manual handoffs repeated elsewhere?',
            'Which rules are corporate standards?',
            'Which rules are branch-specific?',
            'Could a successful Westfield pilot create a reusable branch model?',
          ].map((q) => (
            <div key={q} className="border-b border-lineSoft py-2 text-[14px] text-ink">{q}</div>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-snug text-inkSoft">
          Westfield could provide a practical environment for determining whether the opportunity is local, repeatable, or not worth pursuing.
        </p>
      </div>
    ),
  },
  {
    eyebrow: 'Screen 10 · Next',
    title: 'The responsible next step',
    body: (
      <div className="grid max-w-[115ch] grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6">
        <div>
          <p className="text-[15px] font-semibold leading-snug text-ink">Confirm the workflow before designing the solution.</p>
          <div className="cond mt-3 text-[10.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Recommended participants</div>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-4">
            {['Steve', 'Westfield branch leadership', 'Operations or dispatch owner', 'Warehouse or yard owner', 'Boise IT or integration representative', 'DMSi Agility application owner', 'Trimble or routing application owner', 'Nolan', 'Implementation lead'].map((p) => (
              <li key={p} className="border-b border-lineSoft py-1 text-[12.5px] text-ink">{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="cond text-[10.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">Agenda</div>
          <ol className="mt-1.5 space-y-1">
            {[
              'Correct the current-state workflow.',
              'Identify what Agility and Trimble already handle well.',
              'Identify the gaps between those systems.',
              'Confirm available data and integration methods.',
              'Define Boise’s security requirements.',
              'Select one narrow pilot.',
              'Agree on the baseline and success measurement.',
              'Return with architecture and commercial options only after validation.',
            ].map((a, i) => (
              <li key={a} className="flex gap-2.5 border-b border-lineSoft py-1">
                <span className="num cond w-4 shrink-0 text-[11px] font-bold text-forest">{i + 1}</span>
                <span className="text-[12.5px] leading-snug text-ink">{a}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-sm2 border-l-[3px] border-danger bg-shell px-3 py-2 text-[12.5px] leading-snug text-ink">
            No technical build, timeline, savings estimate, or commercial structure should be promised until the workflow and infrastructure are
            validated.
          </p>
        </div>
      </div>
    ),
  },
]

export function StoryDeck({ onEnter }: { onEnter: () => void }) {
  const [i, setI] = useState(0)
  const s = SCREENS[i]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.key === 'ArrowRight') setI((v) => Math.min(SCREENS.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-0 flex-col px-[18px] pb-3">
      <div className="panel flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-3">
          <BoiseLogo height={26} onDark={false} />
          <span className="cond text-[10.5px] font-bold uppercase tracking-[0.09em] text-inkFaint">
            Working concept · sanitized demonstration data
          </span>
        </div>

        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-8 py-7">
          <div className="cond text-[11.5px] font-bold uppercase tracking-[0.11em] text-accent">{s.eyebrow}</div>
          <h2 className="cond mt-2 max-w-[95ch] text-[34px] font-bold leading-[1.1] text-ink">{s.title}</h2>
          <div className="mt-6">{s.body}</div>
          {i === 1 && <p className="mt-6 max-w-[90ch] text-[15px] font-semibold leading-snug text-forest">{POSITIONING}</p>}
          {i === 5 && (
            <div className="mt-5">
              <StatusLegend />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-line px-6 py-3">
          <button
            type="button"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
            className="cond rounded-sm2 border border-line px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-inkSoft disabled:opacity-35"
          >
            Previous
          </button>
          <div className="flex items-center gap-1.5" aria-hidden>
            {SCREENS.map((_, n) => (
              <span key={n} className={`h-1 w-7 rounded-full ${n <= i ? 'bg-forest' : 'bg-line'}`} />
            ))}
          </div>
          {i === SCREENS.length - 1 ? (
            <button type="button" onClick={onEnter} className="cond rounded-sm2 bg-forest px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-white">
              Open the command center
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setI((v) => Math.min(SCREENS.length - 1, v + 1))}
              className="cond rounded-sm2 bg-forest px-4 py-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-white"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const STORY_SCREEN_COUNT = SCREENS.length

void systemRoles
