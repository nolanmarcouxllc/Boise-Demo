import { useEffect, useState } from 'react'

/**
 * Renders the official Boise Cascade mark from a file dropped into `public/`.
 *
 * The file is not in the repository — it has to come from Boise Cascade's brand
 * kit. Drop it at `public/boise-cascade-logo.svg` (preferred, scales cleanly) or
 * `public/boise-cascade-logo.png` and it appears everywhere automatically.
 *
 * The mark is never redrawn, traced, recoloured, cropped or rasterized here: it
 * is rendered from the supplied file at its own aspect ratio. On the dark
 * sidebar it sits on a white plate rather than being knocked out to white, so
 * the artwork stays exactly as Boise Cascade supplied it.
 */
const CANDIDATES = ['/boise-cascade-logo.svg', '/boise-cascade-logo.png']

export function useOfficialLogo(): string | null {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const find = async () => {
      for (const path of CANDIDATES) {
        try {
          const r = await fetch(path)
          if (!r.ok) continue
          const type = r.headers.get('content-type') ?? ''
          // A dev server rewrites unknown paths to index.html, so confirm the
          // response is actually an image before trusting it.
          if (!type.startsWith('image/')) continue
          if (!cancelled) setSrc(path)
          return
        } catch {
          /* try the next candidate */
        }
      }
      if (!cancelled) setSrc(null)
    }
    void find()
    return () => {
      cancelled = true
    }
  }, [])

  return src
}

/**
 * `height` sets the rendered height; width follows the file's own aspect ratio
 * so the mark is never distorted or cropped.
 */
export function BoiseLogo({ height = 30, onDark = true }: { height?: number; onDark?: boolean }) {
  const src = useOfficialLogo()

  if (src) {
    const img = <img src={src} alt="Boise Cascade" style={{ height, width: 'auto', display: 'block' }} />
    // A white plate keeps the supplied artwork untouched on the dark sidebar.
    return onDark ? (
      <span className="inline-flex items-center rounded-sm2 bg-white" style={{ padding: '6px 10px' }}>
        {img}
      </span>
    ) : (
      img
    )
  }

  return (
    <span className="flex items-center gap-2.5" title="Official logo file not yet added to public/">
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
