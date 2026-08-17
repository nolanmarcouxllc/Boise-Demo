import { ArrowRight, Eye, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DISCLAIMER_LONG } from '../data'
import { useApp } from '../state/AppContext'
import { Chip } from '../components/ui'

const STAGES = ['Order', 'Plan', 'Load', 'Dispatch', 'Deliver', 'Learn'] as const

interface Beat {
  id: string
  stage: number
  headline: string
  body: string
  tone: 'neutral' | 'warning' | 'critical' | 'positive'
}

const BEATS: Beat[] = [
  {
    id: 'b1',
    stage: 0,
    headline: 'The order is entered correctly.',
    body: 'DEMO-10482 goes to the Northampton yard. Everything on it is right — customer, product, quantity, date.',
    tone: 'neutral',
  },
  {
    id: 'b2',
    stage: 0,
    headline: 'Another order is going to the same delivery area.',
    body: 'DEMO-10491 goes to the same yard. A different person wrote it, on a different day, against a different purchase order.',
    tone: 'neutral',
  },
  {
    id: 'b3',
    stage: 1,
    headline: 'The orders are planned separately.',
    body: 'Nothing puts the two orders on one screen at the moment routing happens, so they end up on two routes.',
    tone: 'warning',
  },
  {
    id: 'b4',
    stage: 3,
    headline: 'Two trucks are dispatched into overlapping territory.',
    body: 'Route 1 arrives at the yard at 07:40. Route 12 arrives at 09:15. Two trucks, two drivers, 31 miles of shared corridor each way.',
    tone: 'critical',
  },
  {
    id: 'b5',
    stage: 5,
    headline: 'Management sees the inefficiency only after delivery.',
    body: 'It shows up in a mileage report next week, if it shows up at all. By then the day is gone.',
    tone: 'critical',
  },
  {
    id: 'b6',
    stage: 1,
    headline: 'The command center sees the overlap before dispatch.',
    body: 'Both orders, the shared corridor and the 95-minute arrival gap are compared while the plan is still a plan — and the dispatcher is asked, not overruled.',
    tone: 'positive',
  },
]

export function Opening() {
  const { goToSection, mode } = useApp()
  const [beat, setBeat] = useState(0)
  const [playing, setPlaying] = useState(true)
  const timer = useRef<number | null>(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!playing || reduced) return
    timer.current = window.setTimeout(() => setBeat((b) => (b < BEATS.length - 1 ? b + 1 : b)), beat === 0 ? 2600 : 4200)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [beat, playing, reduced])

  useEffect(() => {
    if (beat === BEATS.length - 1) setPlaying(false)
  }, [beat])

  const current = BEATS[beat]
  const revealed = BEATS.slice(0, beat + 1)

  return (
    <div className="flex min-h-[calc(100vh-13rem)] flex-col">
      <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------ left: title + workflow */}
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex items-center gap-3">
            <span aria-hidden className="flex h-11 w-11 flex-col justify-center gap-1 rounded-[3px] bg-forest-800 p-2.5">
              <span className="block h-1 w-full rounded-sm bg-timber-300" />
              <span className="block h-1 w-full rounded-sm bg-forest-300" />
              <span className="block h-1 w-2/3 rounded-sm bg-timber-100" />
            </span>
            <span className="label-caps text-forest-700">Building Materials Distribution · Westfield, Massachusetts</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-charcoal-900 lg:text-5xl">
            Westfield Branch Intelligence Command Center
          </h1>
          <p className="pres-body mt-4 max-w-2xl text-base leading-relaxed text-charcoal-600">
            A working concept for connecting orders, routing, dispatch, transportation, exceptions, and management visibility.
          </p>

          <div className="mt-8">
            <div className="label-caps mb-3">One order, six stages</div>
            <WorkflowStrip activeStage={current.stage} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary px-6 py-3 text-base" onClick={() => goToSection('overview')}>
              Enter the command center <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setPlaying((p) => !p)} disabled={beat === BEATS.length - 1}>
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setBeat(0)
                setPlaying(true)
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Replay
            </button>
            {beat < BEATS.length - 1 && (
              <button type="button" className="btn btn-ghost" onClick={() => setBeat(BEATS.length - 1)}>
                Skip to the point
              </button>
            )}
          </div>

          <p className="mt-8 max-w-2xl border-l-2 border-timber-300 pl-4 text-[13px] leading-relaxed text-charcoal-500">
            {DISCLAIMER_LONG}
          </p>
        </div>

        {/* ------------------------------------------------ right: the story */}
        <div className="flex flex-col justify-center">
          <div className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="label-caps">What happens today</span>
              <span className="font-mono text-xs text-charcoal-400">
                {beat + 1} / {BEATS.length}
              </span>
            </div>

            <ol className="space-y-3">
              {revealed.map((b, i) => {
                const active = i === beat
                const border =
                  b.tone === 'critical'
                    ? 'border-l-alert-critical'
                    : b.tone === 'warning'
                      ? 'border-l-alert-warn'
                      : b.tone === 'positive'
                        ? 'border-l-forest-600'
                        : 'border-l-charcoal-300'
                return (
                  <li
                    key={b.id}
                    className={`animate-fade-up border-l-[3px] ${border} bg-white pl-4 transition-opacity ${active ? 'opacity-100' : 'opacity-55'}`}
                  >
                    <h2 className={`text-[15px] font-semibold leading-snug ${b.tone === 'positive' ? 'text-forest-700' : 'text-charcoal-900'}`}>
                      {b.headline}
                    </h2>
                    {active && <p className="pres-body mt-1.5 text-sm leading-relaxed text-charcoal-600">{b.body}</p>}
                  </li>
                )
              })}
            </ol>

            {beat >= BEATS.length - 1 && (
              <div className="mt-6 animate-fade-up rounded-[3px] border border-forest-600/30 bg-forest-50 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-forest-700" aria-hidden />
                  <span className="label-caps text-forest-700">The question this raises</span>
                </div>
                <p className="text-lg font-semibold leading-snug text-forest-800">
                  What if the branch could see the problem before the trucks left the yard?
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip tone="green">1 truck</Chip>
                  <Chip tone="green">74 planned miles</Chip>
                  <Chip tone="green">95-minute duplicate arrival</Chip>
                  <Chip tone="neutral">Decision stays with the dispatcher</Chip>
                </div>
              </div>
            )}
          </div>

          {mode === 'explore' && (
            <p className="mt-4 text-[13px] text-charcoal-500">
              Press <kbd className="rounded border border-charcoal-300 bg-white px-1 font-mono text-[11px]">F</kbd> to switch to Presentation Mode, or
              use the left navigation to go anywhere directly.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkflowStrip({ activeStage }: { activeStage: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {STAGES.map((stage, i) => {
        const state = i < activeStage ? 'done' : i === activeStage ? 'active' : 'todo'
        return (
          <li key={stage} className="flex items-center">
            <div
              className={`flex h-11 items-center gap-2 rounded-[3px] border px-3 transition-colors duration-500 ${
                state === 'active'
                  ? 'border-forest-700 bg-forest-700 text-white'
                  : state === 'done'
                    ? 'border-forest-300 bg-forest-50 text-forest-700'
                    : 'border-charcoal-200 bg-white text-charcoal-400'
              }`}
            >
              <span className="font-mono text-[11px] opacity-70">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">{stage}</span>
            </div>
            {i < STAGES.length - 1 && (
              <span aria-hidden className="relative mx-1.5 h-[2px] w-6 bg-charcoal-200">
                <span
                  className="absolute inset-y-0 left-0 bg-forest-600 transition-[width] duration-500"
                  style={{ width: i < activeStage ? '100%' : '0%' }}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
