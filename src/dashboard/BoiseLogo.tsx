import { useEffect, useState } from 'react'

/**
 * Renders the official Boise Cascade SVG from /boise-cascade-logo.svg.
 *
 * The file is not in the repository yet. Drop the official SVG at
 * public/boise-cascade-logo.svg and it appears everywhere automatically — the
 * logo is never redrawn, traced, recoloured or rasterized here. Until then a
 * neutral wordmark stands in so no screen ships with a broken image.
 */
const LOGO_PATH = '/boise-cascade-logo.svg'

export function useOfficialLogo(): boolean {
  const [present, setPresent] = useState(false)
  useEffect(() => {
    let cancelled = false
    fetch(LOGO_PATH, { method: 'GET' })
      .then((r) => r.ok && (r.headers.get('content-type') ?? '').includes('svg'))
      .then((ok) => !cancelled && setPresent(Boolean(ok)))
      .catch(() => !cancelled && setPresent(false))
    return () => {
      cancelled = true
    }
  }, [])
  return present
}

/**
 * `height` sets the rendered height; width follows the file's own aspect ratio
 * so the mark is never distorted or cropped.
 */
export function BoiseLogo({ height = 30, onDark = true }: { height?: number; onDark?: boolean }) {
  const official = useOfficialLogo()

  if (official) {
    return (
      <img
        src={LOGO_PATH}
        alt="Boise Cascade"
        style={{ height, width: 'auto', display: 'block' }}
        className={onDark ? 'brightness-0 invert' : undefined}
      />
    )
  }

  return (
    <span className="flex items-center gap-2.5" title="Official SVG not yet added to the repository">
      <svg width={height} height={height} viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="none" stroke={onDark ? '#fff' : '#3AAA4B'} strokeWidth="2.4" />
        <path
          d="M20 8.5 26.5 19h-3.2L28 27.5h-5.9V31h-4.2v-3.5H12L16.7 19h-3.2L20 8.5Z"
          fill={onDark ? '#fff' : '#3AAA4B'}
        />
      </svg>
      <span
        className="cond font-semibold leading-none tracking-[0.005em]"
        style={{ fontSize: height * 0.63, color: onDark ? '#fff' : '#17231C' }}
      >
        Boise Cascade
      </span>
    </span>
  )
}
