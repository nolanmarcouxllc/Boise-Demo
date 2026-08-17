import { useEffect, useRef, useState } from 'react'
import { navItems, type NavItem } from './data'
import { NavIcon } from './icons'

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-4" style={{ height: 88 }}>
      <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="18" fill="none" stroke="#fff" strokeWidth="2" />
        <path
          d="M20 8.5 26.5 19h-3.2L28 27.5h-5.9V31h-4.2v-3.5H12L16.7 19h-3.2L20 8.5Z"
          fill="#fff"
        />
      </svg>
      <span className="cond text-[19px] font-semibold leading-none tracking-[0.005em] text-white">Boise Cascade</span>
    </div>
  )
}

export function Sidebar({ active, onSelect }: { active: NavItem; onSelect: (n: NavItem) => void }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!profileOpen) return
    const onDoc = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [profileOpen])

  return (
    <aside className="flex min-h-0 flex-col bg-forestDeep text-white" aria-label="Command center sections">
      <Logo />

      <nav className="mt-1">
        <ul>
          {navItems.map((item) => {
            const isActive = item === active
            return (
              <li key={item} className="relative">
                {isActive && <span aria-hidden className="absolute inset-y-0 left-0 w-[4px] bg-accentBright" />}
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 pl-[18px] pr-3 text-left transition-colors ${
                    isActive ? 'bg-forest text-white' : 'text-white/85 hover:bg-white/[0.07] hover:text-white'
                  }`}
                  style={{ height: 54 }}
                >
                  <span className={isActive ? 'text-white' : 'text-white/80'}>
                    <NavIcon name={item} />
                  </span>
                  <span className={`flex-1 truncate text-[13.5px] ${isActive ? 'font-semibold' : 'font-normal'}`}>{item}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto px-5">
        <span aria-hidden className="mb-4 block h-[2px] w-[52px] bg-accentBright/80" />
        <p className="text-[13.5px] leading-[1.5] text-white/80">
          The system catches
          <br />
          the exception.
          <br />
          The operator makes
          <br />
          the decision.
        </p>
      </div>

      <div className="relative mt-6 border-t border-white/15 px-4" style={{ paddingTop: 12, paddingBottom: 14 }} ref={profileRef}>
        {profileOpen && (
          <div className="absolute bottom-[62px] left-4 right-4 z-40 overflow-hidden rounded-sm2 border border-line bg-white py-1 shadow-xl">
            {['Switch branch', 'Notification settings', 'Sign out'].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setProfileOpen(false)}
                className="block w-full px-3 py-1.5 text-left text-[12px] text-ink hover:bg-shell"
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          className="flex w-full items-center gap-2.5 rounded-sm2 text-left hover:bg-white/5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" strokeLinecap="round" />
            </svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium leading-tight text-white">Westfield Ops Manager</span>
            <span className="cond block truncate text-[10px] uppercase leading-tight tracking-[0.1em] text-white/60">Westfield Branch</span>
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            aria-hidden
            style={{ transform: profileOpen ? 'rotate(180deg)' : undefined }}
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
