import { useState } from 'react'

const ROUTE = '#0F6B37'
const OVERLAP = '#E39A16'

const routes: Array<{ id: string; d: string; stops: Array<[number, number]> }> = [
  {
    id: '101',
    d: 'M96 292 C150 268 196 250 246 240 C300 229 340 224 386 216',
    stops: [
      [96, 292],
      [172, 258],
      [246, 240],
      [316, 226],
    ],
  },
  {
    id: '102',
    d: 'M386 216 C428 186 470 160 516 140 C566 118 620 100 686 86',
    stops: [
      [434, 182],
      [492, 150],
      [552, 124],
      [618, 102],
      [686, 86],
    ],
  },
  {
    id: '103',
    d: 'M386 216 C404 258 420 292 452 318 C492 350 546 366 616 376',
    stops: [
      [408, 262],
      [450, 316],
      [508, 348],
      [566, 366],
      [616, 376],
    ],
  },
  {
    id: '104',
    d: 'M386 216 C346 246 312 272 278 298 C250 320 226 342 202 368',
    stops: [
      [340, 250],
      [286, 292],
      [238, 330],
      [202, 368],
    ],
  },
  {
    id: '105',
    d: 'M386 216 C368 172 350 128 316 100 C282 72 246 58 208 48',
    stops: [
      [362, 158],
      [332, 112],
      [280, 72],
      [208, 48],
    ],
  },
]

/** The corridor Routes 103 and 104 share between 9:30 and 11:00 AM. */
const overlapPath = 'M214 262 C286 250 356 248 430 258 C512 270 588 292 664 316'

const trucks: Array<[number, number]> = [
  [150, 268],
  [452, 168],
  [560, 358],
  [232, 336],
]

const towns: Array<{ name: string; x: number; y: number; major?: boolean; lines?: string[] }> = [
  { name: 'Southwick', x: 236, y: 74 },
  { name: 'WESTFIELD', x: 318, y: 168, major: true },
  { name: 'Holyoke', x: 664, y: 66 },
  { name: 'Chicopee', x: 676, y: 198 },
  { name: 'Agawam', x: 244, y: 300 },
  { name: 'West Springfield', x: 668, y: 296, lines: ['West', 'Springfield'] },
]

function Shield({ x, y, label, kind }: { x: number; y: number; label: string; kind: 'state' | 'us' | 'interstate' }) {
  if (kind === 'interstate') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M-15 -11 h30 v13 c0 6 -9 9 -15 11 c-6 -2 -15 -5 -15 -11 z" fill="#1B4E8F" stroke="#fff" strokeWidth="1.4" />
        <path d="M-15 -11 h30 v4 h-30 z" fill="#C1272D" />
        <text x="0" y="6" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">
          {label}
        </text>
      </g>
    )
  }
  if (kind === 'us') {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="-13" y="-10" width="26" height="20" rx="3" fill="#fff" stroke="#5B6360" strokeWidth="1.2" />
        <text x="0" y="4.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2A2F2C">
          {label}
        </text>
      </g>
    )
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -12 l13 7 v10 l-13 7 l-13 -7 v-10 z" fill="#fff" stroke="#3E7A4E" strokeWidth="1.4" />
      <text x="0" y="4.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#1D3B26">
        {label}
      </text>
    </g>
  )
}

function TruckMarker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-16" y="-11" width="32" height="22" rx="4" fill="#fff" stroke="#B9BEB9" strokeWidth="1" />
      <g stroke="#123B22" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-10 -4 h11 v8 h-11 z" />
        <path d="M1 -1 h4.5 l3.5 3.5 V4 H1 z" />
        <circle cx="-6.5" cy="5.5" r="1.7" />
        <circle cx="5.5" cy="5.5" r="1.7" />
      </g>
    </g>
  )
}

function DistributionCenter({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="18" fill="#fff" stroke="#123B22" strokeWidth="2.4" />
      <g stroke="#123B22" strokeWidth="1.5" fill="none" strokeLinejoin="round">
        <path d="M-8 6 v-11 l8 -4 l8 4 v11 z" />
        <path d="M-3.5 6 v-6 h7 v6" />
        <path d="M-8 6 h16" strokeLinecap="round" />
      </g>
    </g>
  )
}

export function RouteMapPanel() {
  const [zoom, setZoom] = useState(1)
  const clamp = (z: number) => Math.min(1.6, Math.max(0.8, Number(z.toFixed(2))))

  return (
    <section className="panel col-span-2 overflow-hidden">
      <div className="flex min-h-0 flex-1">
        {/* ------------------------------------------------------ legend rail */}
        <div className="flex w-[250px] shrink-0 flex-col border-r border-line px-3.5 py-3">
          <div className="cond flex items-center gap-1.5 whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.05em] text-ink">
            Today’s Routes
            <span className="font-normal text-line">|</span>
            <span className="font-semibold text-inkSoft">Westfield, MA</span>
          </div>

          <ul className="mt-3 space-y-[9px]">
            {['101', '102', '103', '104', '105'].map((r) => (
              <li key={r} className="flex items-center gap-2.5">
                <svg width="26" height="8" aria-hidden>
                  <line x1="1" y1="4" x2="25" y2="4" stroke={ROUTE} strokeWidth="3.4" strokeLinecap="round" />
                </svg>
                <span className="text-[12.5px] text-ink">Route {r}</span>
              </li>
            ))}

            <li className="flex items-center gap-2.5">
              <svg width="26" height="10" aria-hidden>
                <circle cx="13" cy="5" r="4" fill="#17231C" />
              </svg>
              <span className="text-[12.5px] text-ink">Customer Stop</span>
            </li>
            <li className="flex items-center gap-2.5">
              <svg width="26" height="16" viewBox="0 0 26 16" aria-hidden>
                <circle cx="13" cy="8" r="7" fill="#fff" stroke="#123B22" strokeWidth="1.6" />
                <path d="M9.5 11V6l3.5-2 3.5 2v5z" fill="none" stroke="#123B22" strokeWidth="1.2" />
              </svg>
              <span className="text-[12.5px] text-ink">Distribution Center</span>
            </li>
            <li className="flex items-center gap-2.5">
              <svg width="26" height="12" aria-hidden>
                <circle cx="13" cy="6" r="5" fill="#fff" stroke="#D71920" strokeWidth="2" />
              </svg>
              <span className="text-[12.5px] text-ink">At-Risk Stop</span>
            </li>
            <li className="flex items-center gap-2.5">
              <svg width="26" height="8" aria-hidden>
                <line x1="1" y1="4" x2="25" y2="4" stroke={OVERLAP} strokeWidth="3.4" strokeLinecap="round" />
              </svg>
              <span className="text-[12.5px] text-ink">Route Overlap</span>
            </li>
            <li className="flex items-center gap-2.5">
              <svg width="26" height="16" viewBox="-16 -11 32 22" aria-hidden>
                <g stroke="#17231C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M-10 -4 h11 v8 h-11 z" />
                  <path d="M1 -1 h4.5 l3.5 3.5 V4 H1 z" />
                  <circle cx="-6.5" cy="5.5" r="1.7" />
                  <circle cx="5.5" cy="5.5" r="1.7" />
                </g>
              </svg>
              <span className="text-[12.5px] text-ink">En Route Vehicle</span>
            </li>
          </ul>

          <div className="mt-auto flex items-center gap-2 pt-2 text-[11.5px] text-inkSoft">
            Last updated: 7:45 AM
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12a9 9 0 1 1-2.6-6.4" strokeLinecap="round" />
              <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ------------------------------------------------------ map */}
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[#EDEBE4]">
          <svg viewBox="0 0 780 420" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Simulated route map for the Westfield branch">
            <g transform={`translate(390 210) scale(${zoom}) translate(-390 -210)`}>
              <rect x="-200" y="-200" width="1180" height="820" fill="#EDEBE4" />

              {/* green space */}
              <path d="M34 28 C96 16 150 40 168 82 C182 118 148 152 100 156 C56 160 24 122 34 28 Z" fill="#DDE7D1" opacity="0.7" />
              <path d="M486 336 C536 326 578 346 592 386 C548 404 496 398 474 378 Z" fill="#DDE7D1" opacity="0.65" />
              <path d="M612 36 C656 26 700 48 714 88 C682 112 636 106 610 80 Z" fill="#DDE7D1" opacity="0.6" />
              <path d="M112 336 C154 328 186 344 196 376 C168 396 128 392 108 372 Z" fill="#DDE7D1" opacity="0.6" />

              {/* Connecticut River */}
              <path
                d="M636 -10 C628 60 656 110 640 168 C624 226 656 274 644 330 C634 380 652 404 646 430"
                fill="none"
                stroke="#BCD6E6"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <path
                d="M636 -10 C628 60 656 110 640 168 C624 226 656 274 644 330 C634 380 652 404 646 430"
                fill="none"
                stroke="#A9C9DD"
                strokeWidth="1"
              />

              {/* minor road mesh */}
              <g stroke="#E2DED3" strokeWidth="1.2" fill="none">
                <path d="M-10 56 H790M-10 96 H790M-10 152 H790M-10 196 H790M-10 232 H790M-10 286 H790M-10 322 H790M-10 366 H790M-10 400 H790" />
                <path d="M56 -10 V430M112 -10 V430M164 -10 V430M228 -10 V430M268 -10 V430M340 -10 V430M400 -10 V430M446 -10 V430M508 -10 V430M548 -10 V430M614 -10 V430M660 -10 V430M736 -10 V430" />
              </g>
              <g stroke="#DCD7CA" strokeWidth="1.8" fill="none">
                <path d="M-10 30 C120 44 220 84 306 132 C400 184 494 214 600 226 C670 234 730 240 790 236" />
                <path d="M40 430 C118 356 190 300 276 262 C356 226 434 200 520 170 C600 142 690 124 790 118" />
                <path d="M-10 178 C90 168 176 190 248 226 C324 264 386 316 452 358 C518 400 596 420 660 428" />
                <path d="M212 -10 C236 60 276 116 336 158 C400 202 470 232 540 252" />
              </g>

              {/* major roads */}
              <g fill="none" strokeLinecap="round">
                <path d="M-10 246 C120 232 260 224 400 236 C540 248 660 276 790 300" stroke="#C9C3B4" strokeWidth="11" />
                <path d="M-10 246 C120 232 260 224 400 236 C540 248 660 276 790 300" stroke="#FBF9F3" strokeWidth="7.5" />

                <path d="M700 -10 C688 90 704 190 692 290 C684 356 696 396 690 430" stroke="#C9C3B4" strokeWidth="10" />
                <path d="M700 -10 C688 90 704 190 692 290 C684 356 696 396 690 430" stroke="#FBF9F3" strokeWidth="6.5" />

                <path d="M300 -10 C292 70 306 140 296 210 C288 280 300 350 292 430" stroke="#CFC9BB" strokeWidth="7" />
                <path d="M300 -10 C292 70 306 140 296 210 C288 280 300 350 292 430" stroke="#FDFBF6" strokeWidth="4.5" />

                <path d="M-10 340 C140 330 300 344 460 366 C580 382 680 392 790 388" stroke="#CFC9BB" strokeWidth="6" />
                <path d="M-10 340 C140 330 300 344 460 366 C580 382 680 392 790 388" stroke="#FDFBF6" strokeWidth="3.8" />
              </g>

              {/* route overlap corridor sits under the routes */}
              <path d={overlapPath} fill="none" stroke={OVERLAP} strokeWidth="6" strokeLinecap="round" opacity="0.95" />

              {/* routes */}
              {routes.map((r) => (
                <path key={r.id} d={r.d} fill="none" stroke={ROUTE} strokeWidth="3.4" strokeLinecap="round" />
              ))}

              {/* customer stops */}
              {routes.flatMap((r) =>
                r.stops.map(([x, y], i) => <circle key={`${r.id}-${i}`} cx={x} cy={y} r="5" fill={ROUTE} stroke="#fff" strokeWidth="1.6" />),
              )}

              {/* at-risk stop */}
              <circle cx="616" cy="376" r="7" fill="#fff" stroke="#D71920" strokeWidth="2.6" />

              {/* town labels */}
              {towns.map((t) =>
                t.lines ? (
                  <text key={t.name} x={t.x} y={t.y} textAnchor="middle" fontSize="13" fill="#4A524D" fontWeight="500">
                    {t.lines.map((l, i) => (
                      <tspan key={l} x={t.x} dy={i === 0 ? 0 : 14}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                ) : (
                  <text
                    key={t.name}
                    x={t.x}
                    y={t.y}
                    textAnchor="middle"
                    fontSize={t.major ? 15 : 13}
                    fontWeight={t.major ? 700 : 500}
                    letterSpacing={t.major ? 1.1 : 0}
                    fill={t.major ? '#2A322C' : '#4A524D'}
                  >
                    {t.name}
                  </text>
                ),
              )}

              <Shield x={300} y={92} label="202" kind="state" />
              <Shield x={186} y={272} label="57" kind="us" />
              <Shield x={252} y={330} label="20" kind="us" />
              <Shield x={704} y={252} label="90" kind="interstate" />

              {trucks.map(([x, y]) => (
                <TruckMarker key={`${x}-${y}`} x={x} y={y} />
              ))}

              <DistributionCenter x={386} y={216} />
            </g>
          </svg>

          {/* zoom controls */}
          <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-sm2 border border-line bg-white shadow-sm">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => clamp(z + 0.2))}
              className="flex h-[30px] w-[30px] items-center justify-center border-b border-line text-[19px] leading-none text-ink hover:bg-shell"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => clamp(z - 0.2))}
              className="flex h-[30px] w-[30px] items-center justify-center text-[19px] leading-none text-ink hover:bg-shell"
            >
              −
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
