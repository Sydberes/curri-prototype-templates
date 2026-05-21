import {
  UserCircle,
  Truck,
  Clock,
  Path,
  MapTrifold,
  DotsThree,
  WarningCircle,
  House,
  Info,
} from '@phosphor-icons/react'
import {
  laneException,
  stopException,
  type ExceptionRow,
  type PlannerLane,
  type PlannerStop,
} from '../data/exceptions'

type OpenExceptionFn = (row: ExceptionRow, anchor: HTMLElement) => void

const PICKUP_BLUE = '#1e46c0'
const DROPOFF_ORANGE = '#ce4b08'

export function Swimlane({
  lane,
  onOpenException,
}: {
  lane: PlannerLane
  onOpenException: OpenExceptionFn
}) {
  const routeExc = laneException(lane)

  return (
    <div
      className="shrink-0 h-full flex flex-col gap-1"
      style={{ width: 265 }}
    >
      <div
        className="relative rounded-t-[8px] flex flex-col"
        style={{
          background: 'var(--color-elevation-surface-overlay)',
          border: '0.5px solid var(--color-border-primary)',
          paddingTop: 12,
          paddingBottom: 8,
          paddingLeft: 8,
          paddingRight: 8,
          gap: 8,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: 4, background: lane.colorBar }}
        />

        <div className="flex items-center justify-between">
          <span
            className="text-[12px]"
            style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
          >
            {lane.routeName}
          </span>
          <div className="flex items-center gap-2">
            {routeExc && (
              <button
                onClick={(e) => onOpenException(routeExc, e.currentTarget)}
                className="inline-flex items-center"
                title="View exception"
                style={{ background: 'transparent' }}
              >
                <WarningCircle
                  size={14}
                  weight="fill"
                  color="var(--color-icon-danger)"
                />
              </button>
            )}
            <MapTrifold
              size={14}
              style={{ color: 'var(--color-icon-secondary)' }}
            />
            <DotsThree
              size={14}
              weight="bold"
              style={{ color: 'var(--color-icon-secondary)' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <RouteMeta icon={UserCircle} label={lane.driver} />
            <RouteMeta icon={Truck} label={lane.truck} />
          </div>
          <div className="flex items-center gap-4">
            <RouteMeta icon={Clock} label={lane.duration} />
            <RouteMeta icon={Path} label={lane.miles} />
          </div>
        </div>

        <span
          className="text-[8px]"
          style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
        >
          CODE: {lane.code}
        </span>

      </div>

      <div
        className="flex-1 min-h-0 overflow-auto flex flex-col gap-1"
        style={{ paddingBottom: 8 }}
      >
        {lane.stops.map((stop) => {
          const stopExc = stopException(lane, stop)
          return (
            <StopCard
              key={stop.id}
              stop={stop}
              exception={stopExc}
              onOpenException={onOpenException}
            />
          )
        })}
      </div>
    </div>
  )
}

function RouteMeta({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-2 w-[100px]">
      <Icon size={12} style={{ color: 'var(--color-icon-secondary)' }} />
      <span
        className="text-[10px] truncate"
        style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  )
}

function StopCard({
  stop,
  exception,
  onOpenException,
}: {
  stop: PlannerStop
  exception?: ExceptionRow
  onOpenException: OpenExceptionFn
}) {
  const isPickup = stop.kind === 'pickup'
  const tagColor = isPickup ? PICKUP_BLUE : DROPOFF_ORANGE
  const tagLabel = isPickup ? 'PICKUP' : 'DROPOFF'

  return (
    <div
      className="rounded-[8px] flex flex-col gap-2"
      style={{
        background: 'var(--color-elevation-surface-raised)',
        border: '0.5px solid var(--color-border-primary)',
        boxShadow: 'var(--shadow-elevation-raised)',
        paddingTop: 8,
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="shrink-0 w-6 h-6 rounded-[4px] flex items-center justify-center"
          style={{ background: 'var(--color-icon-warning)' }}
        >
          <House size={14} weight="fill" color="#fff" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] truncate"
            style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
          >
            {stop.company}
          </div>
          <div
            className="text-[10px] truncate"
            style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
          >
            {stop.address}
          </div>
        </div>
      </div>

      <div
        className="rounded-[4px] py-2 flex items-center justify-between px-2"
        style={{ background: 'var(--color-elevation-surface-overlay)' }}
      >
        <TimeCol label="Arrival" value={stop.arrival} />
        <TimeCol label="At stop" value={stop.duration} />
        <TimeCol label="Departure" value={stop.departure} />
      </div>

      <div
        className="rounded-[4px] p-2 flex flex-col"
        style={{
          background: 'var(--color-elevation-surface-raised)',
          border: '0.5px solid var(--color-border-primary)',
          gap: 2,
        }}
      >
        <div className="flex items-start justify-between">
          <span
            style={{
              color: tagColor,
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: '0.6px',
            }}
          >
            {tagLabel}
          </span>
          <Info
            size={12}
            style={{ color: 'var(--color-icon-tertiary)' }}
          />
        </div>
        <div className="flex flex-col" style={{ gap: 4 }}>
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
          >
            {stop.orderId}
          </span>
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
          >
            {stop.window}
          </span>
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
          >
            {stop.weight}
          </span>
        </div>
      </div>

      {exception && (
        <button
          onClick={(e) => onOpenException(exception, e.currentTarget)}
          className="flex items-center gap-1.5 rounded-[4px] p-1.5 text-left"
          style={{
            background: 'var(--color-elevation-surface-sunken)',
            border: '0.5px solid var(--color-border-primary)',
          }}
        >
          <WarningCircle
            size={12}
            weight="fill"
            style={{ color: 'var(--color-icon-danger)', flexShrink: 0 }}
          />
          <span
            className="text-[10px] flex-1 min-w-0 truncate"
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            {exception.type}
          </span>
          <span
            className="text-[10px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            View
          </span>
        </button>
      )}
    </div>
  )
}

function TimeCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[8px]"
        style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        className="text-[10px]"
        style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  )
}
