import type { AgentGlyph, MetricIcon } from './data'

/** Outlined metric icons, drawn to match the reference rather than pulled from a set. */
export function MetricGlyph({ name, color, size = 40 }: { name: MetricIcon; color: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 40 40',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'lumber':
      return (
        <svg {...common}>
          <path d="M5 13.5 11 10h18l6 3.5-6 3.5H11L5 13.5Z" />
          <path d="M5 20 11 16.5h18L35 20l-6 3.5H11L5 20Z" />
          <path d="M5 26.5 11 23h18l6 3.5-6 3.5H11L5 26.5Z" />
          <path d="M11 10v3.5M29 10v3.5M11 16.5V20M29 16.5V20M11 23v3.5M29 23v3.5" />
        </svg>
      )
    case 'clipboard':
      return (
        <svg {...common}>
          <rect x="9" y="8" width="22" height="26" rx="2.5" />
          <path d="M15 8V6.5A1.5 1.5 0 0 1 16.5 5h7A1.5 1.5 0 0 1 25 6.5V8" />
          <path d="M14 17h12M14 22h12M14 27h7" />
        </svg>
      )
    case 'routes':
      return (
        <svg {...common}>
          <circle cx="9" cy="12" r="3" />
          <circle cx="31" cy="12" r="3" />
          <circle cx="31" cy="28" r="3" />
          <circle cx="14" cy="28" r="3" />
          <path d="M12 12h8a4 4 0 0 1 4 4v8a4 4 0 0 0 4 4M17 28h5" />
        </svg>
      )
    case 'venn':
      return (
        <svg {...common}>
          <circle cx="16" cy="20" r="9" />
          <circle cx="24" cy="20" r="9" />
        </svg>
      )
    case 'warning':
      return (
        <svg {...common}>
          <path d="M20 7.5 35 31.5H5L20 7.5Z" />
          <path d="M20 16.5v7" />
          <circle cx="20" cy="27.5" r="0.9" fill={color} stroke="none" />
        </svg>
      )
    case 'road':
      return (
        <svg {...common}>
          <path d="M13 6 8 34M27 6l5 28" />
          <path d="M20 8v5M20 18v5M20 28v5" />
        </svg>
      )
  }
}

/** Small white glyphs used inside the agent table's dark green tiles. */
export function AgentGlyphIcon({ name }: { name: AgentGlyph }) {
  const c = {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#fff',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'consolidate':
      return (
        <svg {...c}>
          <path d="M4 6h7M4 12h7M4 18h7M14 12h6M17 9l3 3-3 3" />
        </svg>
      )
    case 'duplicate':
      return (
        <svg {...c}>
          <circle cx="9" cy="12" r="6" />
          <circle cx="15" cy="12" r="6" />
        </svg>
      )
    case 'watchdog':
      return (
        <svg {...c}>
          <path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6l8-3Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'overlap':
      return (
        <svg {...c}>
          <path d="M4 8h9a4 4 0 0 1 0 8H4" />
          <path d="M20 16h-3" />
          <circle cx="4" cy="8" r="1.6" />
          <circle cx="20" cy="16" r="1.6" />
        </svg>
      )
    case 'multi':
      return (
        <svg {...c}>
          <rect x="2" y="9" width="9" height="7" rx="1" />
          <rect x="13" y="9" width="9" height="7" rx="1" />
          <path d="M5 16v2M19 16v2" />
        </svg>
      )
    case 'change':
      return (
        <svg {...c}>
          <path d="M4 9a8 8 0 0 1 13-3l3 3M20 15a8 8 0 0 1-13 3l-3-3" />
          <path d="M20 5v4h-4M4 19v-4h4" />
        </svg>
      )
    case 'fleet':
      return (
        <svg {...c}>
          <path d="M2 7h11v8H2zM13 10h5l3 3v2h-8z" />
          <circle cx="6" cy="18" r="1.6" />
          <circle cx="17" cy="18" r="1.6" />
        </svg>
      )
    case 'variance':
      return (
        <svg {...c}>
          <path d="M3 18V9M9 18V5M15 18v-6M21 18V8" />
        </svg>
      )
    case 'exception':
      return (
        <svg {...c}>
          <path d="M12 4l9 15H3l9-15Z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      )
    case 'brief':
      return (
        <svg {...c}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      )
  }
}

/** Sidebar navigation icons, keyed by label. */
export function NavIcon({ name }: { name: string }) {
  const c = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'Branch Overview':
      return (
        <svg {...c}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V20h13V9.5" />
        </svg>
      )
    case 'Intelligence Network':
      return (
        <svg {...c}>
          <circle cx="12" cy="7" r="3" />
          <circle cx="5" cy="17" r="2.4" />
          <circle cx="19" cy="17" r="2.4" />
          <path d="M9.6 9.2 6.6 14.8M14.4 9.2l3 5.6M7.4 17h9.2" />
        </svg>
      )
    case 'Order Flow':
      return (
        <svg {...c}>
          <rect x="4.5" y="3" width="15" height="18" rx="2" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
        </svg>
      )
    case 'Transportation':
      return (
        <svg {...c}>
          <path d="M2 6.5h12v9H2zM14 9.5h4.5L22 13v2.5h-8z" />
          <circle cx="6" cy="18" r="1.9" />
          <circle cx="17.5" cy="18" r="1.9" />
        </svg>
      )
    case 'Exceptions':
      return (
        <svg {...c}>
          <path d="M12 3.5 22 20.5H2L12 3.5Z" />
          <path d="M12 10v4.5M12 18h.01" />
        </svg>
      )
    case 'Route Lab':
      return (
        <svg {...c}>
          <path d="M9.5 3v6.2L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3l-4.9-8.8V3" />
          <path d="M8 3h8M7.6 14.5h8.8" />
        </svg>
      )
    case 'Planned vs. Actual':
      return (
        <svg {...c}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20" />
          <path d="M20 20V7" />
        </svg>
      )
    case 'Management Brief':
      return (
        <svg {...c}>
          <rect x="4" y="4" width="16" height="17" rx="2" />
          <path d="M9 3h6v3H9zM8 11h8M8 15h5" />
        </svg>
      )
    case 'Capability Value Map':
      return (
        <svg {...c}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9.5h18M3 15h18M9 4v16M15 4v16" />
        </svg>
      )
    case 'Next Step':
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" />
        </svg>
      )
    case 'Discovery Board':
      return (
        <svg {...c}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
        </svg>
      )
    default:
      return null
  }
}

export function BriefIcon({ name, color }: { name: 'chart' | 'route' | 'warning' | 'team'; color: string }) {
  const c = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (name) {
    case 'chart':
      return (
        <svg {...c}>
          <path d="M3 20h18" />
          <path d="M6 20v-5M11 20V9M16 20v-8M20.5 20V5" />
          <path d="M4.5 10.5 9 5.5l4 3.5 6.5-6" />
        </svg>
      )
    case 'route':
      return (
        <svg {...c}>
          <circle cx="6" cy="5.5" r="2.5" />
          <circle cx="18" cy="18.5" r="2.5" />
          <path d="M8.5 5.5H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h5.5" />
        </svg>
      )
    case 'warning':
      return (
        <svg {...c}>
          <path d="M12 3.5 22 20.5H2L12 3.5Z" />
          <path d="M12 10v4.5M12 18h.01" />
        </svg>
      )
    case 'team':
      return (
        <svg {...c}>
          <circle cx="8.5" cy="8" r="3" />
          <circle cx="16.5" cy="9.5" r="2.4" />
          <path d="M3 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M15 19c0-2.2 1.2-3.8 3-4.3" />
        </svg>
      )
  }
}
