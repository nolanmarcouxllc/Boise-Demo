import { ArrowRight, Calculator, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Chip, Panel, SectionHeading } from '../components/ui'

const BEFORE = [
  'Information distributed across systems and people',
  'Separate order and routing views',
  'Problems discovered after planning',
  'Manual comparison across screens',
  'Duplicate travel into the same territory',
  'Limited feedback into future planning',
  'Management relies on multiple reports or conversations',
]

const AFTER = [
  'Approved information organized in one operational view',
  'Exceptions detected before dispatch',
  'Consolidation opportunities surfaced automatically',
  'Dispatchers compare recommended scenarios',
  'Management sees the reason behind each alert',
  'Actual route outcomes improve future decisions',
  'Human operators retain control',
]

interface Input {
  key: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  prefix?: string
  decimals?: number
}

const DEFAULTS: Input[] = [
  { key: 'routesPerDay', label: 'Routes per day', value: 17, min: 5, max: 40, step: 1 },
  { key: 'milesPerRoute', label: 'Average miles per route', value: 55, min: 20, max: 200, step: 5 },
  { key: 'overlapPct', label: 'Estimated overlapping-route percentage', value: 10, min: 0, max: 35, step: 1, unit: '%' },
  { key: 'costPerMile', label: 'Average cost per mile', value: 2.92, min: 1.5, max: 6, step: 0.05, prefix: '$', decimals: 2 },
  { key: 'planningMinutes', label: 'Average dispatcher planning time per day', value: 75, min: 15, max: 300, step: 5, unit: ' min' },
  { key: 'correctionsPerDay', label: 'Orders requiring manual correction per day', value: 12, min: 0, max: 60, step: 1 },
  { key: 'minutesPerCorrection', label: 'Average time per correction', value: 8, min: 2, max: 45, step: 1, unit: ' min' },
  { key: 'workingDays', label: 'Working days per year', value: 250, min: 200, max: 300, step: 5 },
  { key: 'thirdPartyPerWeek', label: 'Third-party loads per week', value: 30, min: 0, max: 120, step: 1 },
  { key: 'consolidationPerDay', label: 'Estimated consolidation opportunities per day', value: 4, min: 0, max: 20, step: 1 },
]

/** Conservative capture assumptions. Both ends are shown; neither is a promise. */
const CAPTURE_LOW = 0.25
const CAPTURE_HIGH = 0.55
const DISPATCH_REDUCTION_LOW = 0.1
const DISPATCH_REDUCTION_HIGH = 0.25
const DISPATCHER_RATE = 38
const ORDER_DESK_RATE = 32

export function Opportunity() {
  const [inputs, setInputs] = useState<Input[]>(DEFAULTS)
  const v = useMemo(() => Object.fromEntries(inputs.map((i) => [i.key, i.value])) as Record<string, number>, [inputs])

  const calc = useMemo(() => {
    const dailyMiles = v.routesPerDay * v.milesPerRoute
    const overlapMiles = dailyMiles * (v.overlapPct / 100)
    const milesLow = Math.round(overlapMiles * CAPTURE_LOW * v.workingDays)
    const milesHigh = Math.round(overlapMiles * CAPTURE_HIGH * v.workingDays)

    const dispatchHoursLow = Math.round(((v.planningMinutes * DISPATCH_REDUCTION_LOW) / 60) * v.workingDays)
    const dispatchHoursHigh = Math.round(((v.planningMinutes * DISPATCH_REDUCTION_HIGH) / 60) * v.workingDays)

    const routeDaysLow = Math.round(v.consolidationPerDay * CAPTURE_LOW * v.workingDays)
    const routeDaysHigh = Math.round(v.consolidationPerDay * CAPTURE_HIGH * v.workingDays)

    const correctionsLow = Math.round(v.correctionsPerDay * CAPTURE_LOW * v.workingDays)
    const correctionsHigh = Math.round(v.correctionsPerDay * CAPTURE_HIGH * v.workingDays)
    const correctionHoursLow = Math.round((correctionsLow * v.minutesPerCorrection) / 60)
    const correctionHoursHigh = Math.round((correctionsHigh * v.minutesPerCorrection) / 60)

    const dollarsLow = Math.round(milesLow * v.costPerMile + dispatchHoursLow * DISPATCHER_RATE + correctionHoursLow * ORDER_DESK_RATE)
    const dollarsHigh = Math.round(milesHigh * v.costPerMile + dispatchHoursHigh * DISPATCHER_RATE + correctionHoursHigh * ORDER_DESK_RATE)

    return {
      dailyMiles,
      overlapMiles,
      milesLow,
      milesHigh,
      dispatchHoursLow,
      dispatchHoursHigh,
      routeDaysLow,
      routeDaysHigh,
      correctionsLow,
      correctionsHigh,
      correctionHoursLow,
      correctionHoursHigh,
      dollarsLow,
      dollarsHigh,
    }
  }, [v])

  const set = (key: string, value: number) => setInputs((prev) => prev.map((i) => (i.key === key ? { ...i, value } : i)))

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Act 5 · Before and after, and what it could be worth"
        title="Opportunity and value"
        blurb="A comparison of how the work happens today against how it could happen with a connected view — and a transparent calculator you can change in the room. Every result shows its formula and its assumptions."
      />

      {/* ------------------------------------------------------- before / after */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start">
        <Panel title="Current simulated workflow" subtitle="How the day is put together now">
          <ul className="space-y-2.5">
            {BEFORE.map((b) => (
              <li key={b} className="pres-body flex gap-2.5 text-sm leading-relaxed text-charcoal-700">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-charcoal-400" />
                {b}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="hidden items-center justify-center self-center lg:flex">
          <ArrowRight className="h-6 w-6 text-charcoal-300" aria-hidden />
        </div>

        <Panel title="Connected command-center concept" subtitle="What a shared operational view could change">
          <ul className="space-y-2.5">
            {AFTER.map((a) => (
              <li key={a} className="pres-body flex gap-2.5 text-sm leading-relaxed text-charcoal-800">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" />
                {a}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ------------------------------------------------------- simulator */}
      <Panel
        title="Value simulator"
        subtitle="Change any assumption. Every output shows the formula behind it."
        actions={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setInputs(DEFAULTS)}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset assumptions
          </button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className="label-caps flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5" aria-hidden /> Inputs
            </div>
            {inputs.map((i) => (
              <label key={i.key} className="block">
                <span className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-[13px] text-charcoal-600">{i.label}</span>
                  <span className="font-mono text-[13px] font-semibold text-charcoal-900">
                    {i.prefix ?? ''}
                    {i.value.toFixed(i.decimals ?? 0)}
                    {i.unit ?? ''}
                  </span>
                </span>
                <input
                  type="range"
                  min={i.min}
                  max={i.max}
                  step={i.step}
                  value={i.value}
                  onChange={(e) => set(i.key, Number(e.target.value))}
                  className="w-full accent-[#215733]"
                />
              </label>
            ))}
          </div>

          <div className="space-y-3">
            <div className="label-caps">Illustrative outputs — ranges, not forecasts</div>
            <Output
              label="Miles reviewed for elimination"
              range={`${calc.milesLow.toLocaleString()} – ${calc.milesHigh.toLocaleString()} miles / year`}
              formula={`(${v.routesPerDay} routes × ${v.milesPerRoute} miles) × ${v.overlapPct}% overlap × ${Math.round(CAPTURE_LOW * 100)}–${Math.round(CAPTURE_HIGH * 100)}% captured × ${v.workingDays} days`}
              assumption={`${calc.overlapMiles.toFixed(0)} overlapping miles a day are identified; between a quarter and just over half of them are actually removable once customer rules are applied.`}
            />
            <Output
              label="Dispatcher hours redirected"
              range={`${calc.dispatchHoursLow.toLocaleString()} – ${calc.dispatchHoursHigh.toLocaleString()} hours / year`}
              formula={`${v.planningMinutes} min/day × ${Math.round(DISPATCH_REDUCTION_LOW * 100)}–${Math.round(DISPATCH_REDUCTION_HIGH * 100)}% reduction ÷ 60 × ${v.workingDays} days`}
              assumption="Time is redirected, not removed. The dispatcher still makes every routing decision — they spend less of the day assembling the picture."
            />
            <Output
              label="Route capacity potentially recovered"
              range={`${calc.routeDaysLow.toLocaleString()} – ${calc.routeDaysHigh.toLocaleString()} route-days / year`}
              formula={`${v.consolidationPerDay} opportunities/day × ${Math.round(CAPTURE_LOW * 100)}–${Math.round(CAPTURE_HIGH * 100)}% captured × ${v.workingDays} days`}
              assumption="A recovered route-day is capacity available for growth or for absorbing third-party volume — it is not automatically a truck removed from the fleet."
            />
            <Output
              label="Manual corrections avoided"
              range={`${calc.correctionsLow.toLocaleString()} – ${calc.correctionsHigh.toLocaleString()} corrections (${calc.correctionHoursLow.toLocaleString()} – ${calc.correctionHoursHigh.toLocaleString()} hours) / year`}
              formula={`${v.correctionsPerDay} corrections/day × ${Math.round(CAPTURE_LOW * 100)}–${Math.round(CAPTURE_HIGH * 100)}% captured × ${v.workingDays} days × ${v.minutesPerCorrection} min ÷ 60`}
              assumption="Assumes the missing value already exists on a customer or location record and only needs confirmation."
            />
            <Output
              label="Estimated annual operational opportunity"
              range={`$${calc.dollarsLow.toLocaleString()} – $${calc.dollarsHigh.toLocaleString()}`}
              formula={`miles × $${v.costPerMile.toFixed(2)} + dispatcher hours × $${DISPATCHER_RATE} + correction hours × $${ORDER_DESK_RATE}`}
              assumption="Loaded labor rates are placeholders. Cost per mile, labor rates and capture percentage all have to be replaced with Boise figures before this number means anything."
              emphasis
            />

            <div className="rounded-[3px] border border-timber-300 bg-timber-50 px-4 py-3">
              <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-timber-600">
                Illustrative opportunity — requires validation against Boise data
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-600">
                Every figure above is produced by the formula shown next to it, from assumptions on this screen. Nothing here is a guaranteed saving, a
                committed result, or a measurement of Boise Cascade’s operations.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'What would make this real',
            body: 'A mileage baseline from the routing engine, a dispatcher time study over two weeks, and an agreed definition of what counts as an avoidable mile.',
          },
          {
            title: 'What would make it smaller',
            body: 'Customer rules that prevent consolidation, appointment windows that cannot move, and equipment constraints that force separate trips.',
          },
          {
            title: 'What we are not claiming',
            body: 'That any of these numbers describe Westfield today, that integration is technically confirmed, or that a system replaces a decision.',
          },
        ].map((c) => (
          <Panel key={c.title} title={c.title}>
            <p className="text-[13px] leading-relaxed text-charcoal-600">{c.body}</p>
          </Panel>
        ))}
      </div>

      <p className="flex flex-wrap items-center gap-2">
        <Chip tone="green">The goal is not another dashboard.</Chip>
        <Chip tone="green">The goal is fewer problems discovered too late.</Chip>
      </p>
    </div>
  )
}

function Output({
  label,
  range,
  formula,
  assumption,
  emphasis = false,
}: {
  label: string
  range: string
  formula: string
  assumption: string
  emphasis?: boolean
}) {
  return (
    <div className={`rounded-[3px] border p-3.5 ${emphasis ? 'border-forest-600/40 bg-forest-50/60' : 'border-charcoal-200 bg-white'}`}>
      <div className="label-caps">{label}</div>
      <div className={`mt-1 font-mono font-semibold tabular-nums ${emphasis ? 'text-xl text-forest-800' : 'text-lg text-charcoal-900'}`}>{range}</div>
      <div className="mt-2 rounded-[2px] bg-charcoal-50 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-charcoal-600">{formula}</div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-charcoal-500">{assumption}</p>
    </div>
  )
}
