import {
  Lightning,
  Tray,
  Crosshair,
  NotePencil,
  Package,
  CalendarBlank,
  GlobeHemisphereWest,
  ChartBar,
  AddressBook,
  Files,
  CardsThree,
  UserCircle,
  Headphones,
  SignOut,
  CaretDown,
  Bell,
  Sun,
  Moon,
  Monitor,
  Check,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'

const TOP = [
  { label: 'Book delivery', icon: Lightning, active: true },
  { label: 'Order queue', icon: Tray, badge: 2 },
  { label: 'My deliveries', icon: Crosshair },
  { label: 'Drafts', icon: NotePencil, badge: 2 },
]

const ROUTE_PLANNER = [
  { label: 'Orders', icon: Package },
  { label: 'Planner', icon: CalendarBlank },
  { label: 'Overview', icon: GlobeHemisphereWest },
  { label: 'Metrics', icon: ChartBar },
]

const WORKSPACE = [
  { label: 'Address book', icon: AddressBook },
  { label: 'Reports', icon: Files },
  { label: 'Providers', icon: CardsThree },
  { label: 'Profile', icon: UserCircle },
]

const SETTINGS = [{ label: 'Notifications', icon: Bell }]

const BOTTOM = [
  { label: 'Help & support', icon: Headphones },
  { label: 'Log out', icon: SignOut },
]

type Item = {
  label: string
  icon: React.ElementType
  active?: boolean
  badge?: number
}

export function Sidebar() {
  return (
    <aside
      className="relative z-30 shrink-0 flex flex-col p-4 gap-6"
      style={{
        width: 232,
        background: 'var(--color-elevation-surface-base)',
      }}
    >
      <OrgSwitcher />

      <div className="flex-1 min-h-0 flex flex-col justify-between" style={{ opacity: 0.8 }}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            {TOP.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
          <Section title="Route Planner" items={ROUTE_PLANNER} />
          <Section title="Workspace" items={WORKSPACE} />
          <Section title="Settings" items={SETTINGS} />
        </div>

        <div className="flex flex-col">
          <ThemeRow />
          {BOTTOM.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </aside>
  )
}

type ThemeMode = 'system' | 'light' | 'dark'
const THEME_KEY = 'aiBooking.theme'

function applyTheme(mode: ThemeMode) {
  const resolved =
    mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : mode
  if (resolved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

function ThemeRow() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    return (window.localStorage.getItem(THEME_KEY) as ThemeMode) || 'light'
  })
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applyTheme(mode)
    window.localStorage.setItem(THEME_KEY, mode)
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDocClick)
    return () => window.removeEventListener('mousedown', onDocClick)
  }, [open])

  const TriggerIcon = mode === 'dark' ? Moon : mode === 'system' ? Monitor : Sun
  const label = mode === 'dark' ? 'Dark' : mode === 'system' ? 'System' : 'Light'

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-[200px] flex items-center p-2 rounded-lg text-left transition-colors hover:bg-[var(--color-elevation-surface-base-hover)]"
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <TriggerIcon
            size={16}
            style={{ color: 'var(--color-icon-primary)' }}
          />
          <span
            className="text-[14px] leading-[21px] truncate"
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            Theme
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="text-[12px] leading-[16px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {label}
          </span>
          <CaretDown
            size={12}
            style={{
              color: 'var(--color-icon-tertiary)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </span>
      </button>

      {open && (
        <div
          className="absolute bottom-0 left-full ml-2 z-30 rounded-lg overflow-hidden flex flex-col py-2"
          style={{
            width: 172,
            background: 'var(--color-elevation-surface-overlay)',
            boxShadow: 'var(--shadow-elevation-overlay)',
            animation: 'ai-fade-in 160ms ease-out both',
          }}
        >
          <ThemeMenuItem
            icon={Monitor}
            label="System"
            selected={mode === 'system'}
            onSelect={() => {
              setMode('system')
              setOpen(false)
            }}
          />
          <ThemeMenuItem
            icon={Sun}
            label="Light"
            selected={mode === 'light'}
            onSelect={() => {
              setMode('light')
              setOpen(false)
            }}
          />
          <ThemeMenuItem
            icon={Moon}
            label="Dark"
            selected={mode === 'dark'}
            onSelect={() => {
              setMode('dark')
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

function ThemeMenuItem({
  icon: Icon,
  label,
  selected,
  onSelect,
}: {
  icon: React.ElementType
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <div className="px-2">
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-2 p-2 rounded text-left transition-colors hover:bg-[var(--color-background-neutral-primary-hover)]"
      >
        <Icon size={12} style={{ color: 'var(--color-icon-secondary)' }} />
        <span
          className="flex-1 text-[12px] leading-[20px]"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        >
          {label}
        </span>
        {selected && (
          <Check
            size={12}
            weight="bold"
            style={{ color: 'var(--color-icon-primary)' }}
          />
        )}
      </button>
    </div>
  )
}

function OrgSwitcher() {
  return (
    <div className="flex items-center w-[200px]">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-8 h-8 shrink-0 rounded flex items-center justify-center text-[11px]"
          style={{
            background: 'var(--color-background-brand-primary)',
            color: 'var(--color-text-brand-button)',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          CU
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[14px] leading-[21px] truncate"
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            Curri
          </span>
          <span
            className="text-[10px] leading-[14px] truncate"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            1 - CTOLAND
          </span>
        </div>
      </div>
    </div>
  )
}

function Section({ title, items }: { title: string; items: Item[] }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 p-2 w-full text-left"
      >
        <span
          className="text-[14px] leading-[21px]"
          style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
        >
          {title}
        </span>
        <CaretDown
          size={12}
          style={{
            color: 'var(--color-icon-tertiary)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 120ms',
          }}
        />
      </button>
      {open &&
        items.map((item) => <NavItem key={item.label} {...item} />)}
    </div>
  )
}

function NavItem({ label, icon: Icon, active, badge }: Item) {
  return (
    <button
      type="button"
      className="w-[200px] flex items-center p-2 rounded-lg text-left transition-colors"
      style={{
        background: active
          ? 'var(--color-elevation-surface-base-pressed)'
          : 'transparent',
      }}
    >
      <span className="flex items-center gap-2 flex-1 min-w-0">
        <Icon
          size={16}
          weight={active ? 'fill' : 'regular'}
          style={{ color: 'var(--color-icon-primary)' }}
        />
        <span
          className="text-[14px] leading-[21px] truncate"
          style={{
            color: 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </span>
      {badge !== undefined && <Badge value={badge} />}
    </button>
  )
}

function Badge({ value }: { value: number }) {
  return (
    <span
      className="w-4 h-4 shrink-0 rounded-[2px] flex items-center justify-center text-[10px] leading-[14px]"
      style={{
        background: 'var(--color-background-selected-pressed)',
        color: 'var(--color-text-primary)',
      }}
    >
      {value}
    </span>
  )
}

