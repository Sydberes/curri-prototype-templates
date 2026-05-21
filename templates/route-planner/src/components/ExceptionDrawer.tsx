import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  DotsThree,
  MapPin,
  Phone,
} from '@phosphor-icons/react'
import { SEVERITY_LABEL, type ExceptionRow } from '../data/exceptions'
import { CoreIntelligenceIcon } from './CoreIntelligenceIcon'


export function ExceptionDrawer({
  row,
  onClose,
}: {
  row: ExceptionRow | null
  onClose: () => void
}) {
  const open = !!row

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        className={`drawer-backdrop ${open ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        {row && <DrawerContent row={row} onClose={onClose} />}
      </aside>
    </>,
    document.body,
  )
}

function DrawerContent({
  row,
  onClose,
}: {
  row: ExceptionRow
  onClose: () => void
}) {
  return (
    <>
      <div className="curri-drawer-hdr">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 min-w-0">
            <span className={`badge badge-${row.severity}`}>
              <span className="dot" />
              {SEVERITY_LABEL[row.severity]}
            </span>
            <h2 className="curri-drawer-title">{row.type}</h2>
            <p className="curri-drawer-meta">
              {row.id} · Route {row.route} · Order {row.order}
            </p>
          </div>
          <button className="curri-icon-close" onClick={onClose} title="Close">
            <X size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <CurriButton variant="brand">Resolve</CurriButton>
          <CurriButton variant="primary" iconLeft={<MapPin size={12} />}>
            View on map
          </CurriButton>
          <CurriButton variant="primary" shape="icon" aria-label="More">
            <DotsThree size={12} weight="bold" />
          </CurriButton>
        </div>
      </div>

      <div className="curri-drawer-body">
        <CurriCard>
          <div className="curri-card-section">
            <div className="flex items-center gap-1.5">
              <CoreIntelligenceIcon
                size={12}
                style={{ color: 'var(--color-icon-primary)' }}
              />
              <span className="curri-card-eyebrow">Summary</span>
            </div>
            <p className="curri-card-body-text">
              {contextSummary(row.type)}
            </p>
            <span className="curri-card-meta">
              Detected {row.detected} · auto-detected
            </span>
          </div>
        </CurriCard>

        <SectionLabel>Order</SectionLabel>
        <CurriCard>
          <div className="curri-card-section">
            <StopTimeline pickup={row.pickup} dropoff={row.dropoff} />
          </div>
        </CurriCard>

        <SectionLabel>Driver</SectionLabel>
        <CurriCard>
          <div className="curri-card-row">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="curri-avatar">{initials(row.driver)}</div>
              <div className="flex-1 min-w-0">
                <div className="curri-row-label">{row.driver}</div>
                <div className="curri-row-sub">
                  Assigned to Route {row.route}
                </div>
              </div>
            </div>
            <CurriButton variant="primary" shape="icon" aria-label="Call driver">
              <Phone size={12} />
            </CurriButton>
          </div>
        </CurriCard>

        <SectionLabel>Activity</SectionLabel>
        <CurriCard>
          <Activity detected={row.detected} type={row.type} />
        </CurriCard>
      </div>
    </>
  )
}

function CurriButton({
  variant,
  shape,
  size = 'small',
  iconLeft,
  children,
  ...rest
}: {
  variant: 'brand' | 'primary' | 'tertiary'
  shape?: 'default' | 'icon'
  size?: 'small' | 'base'
  iconLeft?: React.ReactNode
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const klass = ['curri-btn', `curri-btn-${variant}`]
  if (size === 'small') klass.push('curri-btn-sm')
  if (shape === 'icon') klass.push('curri-btn-icon')
  return (
    <button className={klass.join(' ')} {...rest}>
      {iconLeft}
      {children}
    </button>
  )
}

function CurriCard({ children }: { children: React.ReactNode }) {
  return <div className="curri-card">{children}</div>
}

function CurriDivider() {
  return <div className="curri-divider" />
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="curri-section-label">{children}</div>
}

function StopTimeline({
  pickup,
  dropoff,
}: {
  pickup: string
  dropoff: string
}) {
  return (
    <div className="stop-timeline">
      <div className="stop-timeline-row">
        <div className="stop-timeline-rail">
          <StopTile kind="pickup" />
          <span className="stop-timeline-line" aria-hidden />
        </div>
        <div className="stop-timeline-content">
          <span className="curri-row-sub">Pickup</span>
          <span className="curri-row-label">{pickup}</span>
        </div>
      </div>
      <div className="stop-timeline-row">
        <div className="stop-timeline-rail">
          <StopTile kind="dropoff" />
        </div>
        <div className="stop-timeline-content">
          <span className="curri-row-sub">Drop-off</span>
          <span className="curri-row-label">{dropoff}</span>
        </div>
      </div>
    </div>
  )
}

function StopTile({ kind }: { kind: 'pickup' | 'dropoff' }) {
  return (
    <div
      className="curri-stop-tile"
      style={{ background: 'var(--color-icon-primary)' }}
    >
      {kind === 'pickup' ? (
        <span
          style={{
            display: 'inline-block',
            width: 0,
            height: 0,
            borderLeft: '3.5px solid transparent',
            borderRight: '3.5px solid transparent',
            borderBottom: '6px solid var(--color-icon-inverse)',
          }}
        />
      ) : (
        <span
          style={{
            display: 'inline-flex',
            width: 7,
            height: 7,
            background: 'var(--color-icon-inverse)',
            borderRadius: 1,
          }}
        />
      )}
    </div>
  )
}

function Activity({ detected, type }: { detected: string; type: string }) {
  const events = [
    {
      time: detected,
      title: `${type} detected`,
      sub: 'System flagged automatically',
      accent: true,
    },
    {
      time: '3m ago',
      title: 'Driver pinged location',
      sub: 'Location update sent from device',
    },
    {
      time: '6m ago',
      title: 'Arrived at stop',
      sub: 'Driver entered geofence',
    },
  ]
  return (
    <ol className="curri-activity">
      {events.map((e, i) => (
        <li key={i} className="curri-activity-item">
          <div className="curri-activity-rail">
            <span
              className={`curri-activity-dot ${e.accent ? 'is-accent' : ''}`}
            />
            {i < events.length - 1 && <span className="curri-activity-line" />}
          </div>
          <div className="flex-1 min-w-0 pb-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="curri-activity-title">{e.title}</span>
              <span className="curri-activity-time">{e.time}</span>
            </div>
            <div className="curri-activity-sub text-pretty">{e.sub}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function contextSummary(type: string) {
  switch (type) {
    case 'Driver not moving':
      return 'Driver has been stationary for 9 min outside the scheduled stop window.'
    case 'Order failed':
      return 'Driver was unable to complete the pickup or drop-off for this order.'
    default:
      return 'Issue detected on this route.'
  }
}
