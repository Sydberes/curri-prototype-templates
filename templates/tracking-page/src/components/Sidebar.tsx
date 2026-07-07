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
  UserPlus,
  Headphones,
  SignOut,
  CaretDown,
  Bell,
  X,
} from '@phosphor-icons/react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TOP = [
  { label: 'Book delivery', icon: Lightning },
  { label: 'Order queue', icon: Tray, badge: 2 },
  { label: 'My deliveries', icon: Crosshair, active: true },
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
  { label: 'Invite members', icon: UserPlus },
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
      className="shrink-0 flex flex-col p-4 gap-6"
      style={{
        width: 232,
        background: 'var(--color-elevation-surface-base)',
      }}
    >
      <OrgSwitcher />

      <div className="flex-1 min-h-0 flex flex-col justify-between" style={{ opacity: 0.9 }}>
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
          {BOTTOM.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </aside>
  )
}

/**
 * The same Sidebar, off-canvas. On narrow breakpoints the nav slides in from
 * the left over a scrim instead of sitting in the layout — chrome that
 * degrades rather than disappears.
 */
export function SidebarDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ background: 'rgba(9, 30, 66, 0.32)', zIndex: 2000 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 bottom-0 left-0 flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            style={{
              width: 256,
              background: 'var(--color-elevation-surface-base)',
              boxShadow: 'var(--shadow-elevation-overlay)',
              zIndex: 2001,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="tp-action-btn absolute top-3 right-3 w-8 h-8 rounded-[4px] flex items-center justify-center"
              style={{ color: 'var(--color-icon-secondary)', zIndex: 1 }}
            >
              <X size={16} />
            </button>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Sidebar />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
          AC
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[14px] leading-[21px] truncate"
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            Acme Co.
          </span>
          <span
            className="text-[10px] leading-[14px] truncate"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Omaha Branch
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
      {open && items.map((item) => <NavItem key={item.label} {...item} />)}
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
