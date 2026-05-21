import { Flag, NavigationArrow, WarningCircle } from '@phosphor-icons/react'
import {
  PLANNER_LANES,
  NOW_MIN,
  laneException,
  type ExceptionRow,
  type PlannerLane,
} from '../data/exceptions'

const TIMELINE_END = 24 * 60
const LABEL_WIDTH = 268
const ROW_HEIGHT = 88

const HOURS = Array.from({ length: 25 }, (_, h) => h)

export function RouteTimeline({
  onOpenException,
}: {
  onOpenException: (row: ExceptionRow, anchor: HTMLElement) => void
}) {
  return (
    <div
      className="h-full overflow-auto"
      style={{ background: 'var(--color-elevation-surface-primary)' }}
    >
      <div className="relative" style={{ minWidth: 1600 }}>
        <TimeScale />
        <div className="relative">
          {PLANNER_LANES.map((lane) => (
            <RouteRow
              key={lane.id}
              lane={lane}
              onOpenException={onOpenException}
            />
          ))}
          <NowLine />
        </div>
      </div>
    </div>
  )
}

function TimeScale() {
  return (
    <div
      className="flex sticky top-0 z-10 border-b"
      style={{
        borderColor: 'var(--color-border-primary)',
        background: 'var(--color-elevation-surface-primary)',
      }}
    >
      <div
        className="shrink-0"
        style={{ width: LABEL_WIDTH }}
      />
      <div className="flex-1 relative h-7">
        {HOURS.slice(0, -1).map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 px-2 flex items-center"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            <span
              className="text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {formatHour(h)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RouteRow({
  lane,
  onOpenException,
}: {
  lane: PlannerLane & { timeBlocks: { startMin: number; endMin: number }[] }
  onOpenException: (row: ExceptionRow, anchor: HTMLElement) => void
}) {
  const exc = laneException(lane)
  const stops = lane.stops.map((s) => ({
    minutes: parseTime(s.arrival),
    kind: s.kind,
  }))

  return (
    <div
      className="flex"
      style={{
        height: ROW_HEIGHT,
      }}
    >
      <div
        className="shrink-0 flex items-stretch"
        style={{
          width: LABEL_WIDTH,
          padding: 8,
        }}
      >
        <div
          className="flex w-full rounded-[4px] overflow-hidden"
          style={{
            background: 'var(--color-elevation-surface-overlay)',
            boxShadow: 'var(--shadow-elevation-overlay)',
          }}
        >
          <div
            style={{
              width: 6,
              background: lane.colorBar,
              flexShrink: 0,
            }}
          />
          <div className="flex-1 min-w-0 flex flex-col justify-center pl-3 pr-2 py-2 gap-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="text-[13px] truncate"
                style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  lineHeight: '18px',
                }}
              >
                {lane.routeName}
              </span>
              {exc && (
                <button
                  onClick={(e) => onOpenException(exc, e.currentTarget)}
                  title="View exception"
                  style={{ background: 'transparent', lineHeight: 0 }}
                >
                  <WarningCircle
                    size={13}
                    weight="fill"
                    color="var(--color-icon-danger)"
                  />
                </button>
              )}
            </div>
            <span
              className="text-[9px] uppercase truncate"
              style={{
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.6px',
                fontWeight: 600,
              }}
            >
              {lane.truck} · {lane.driver}
            </span>
            <span
              className="text-[10px]"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Code{' '}
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {lane.code}
              </span>
            </span>
          </div>
          <button
            className="shrink-0 w-8 flex items-start justify-center pt-2.5"
            style={{
              background: 'transparent',
              color: 'var(--color-icon-primary)',
            }}
            title="Navigate to route"
          >
            <NavigationArrow size={12} weight="fill" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        {lane.timeBlocks.map((b, i) => {
          const startPct = (b.startMin / TIMELINE_END) * 100
          const widthPct =
            ((b.endMin - b.startMin) / TIMELINE_END) * 100
          return (
            <div
              key={i}
              className="absolute rounded-[2px]"
              style={{
                left: `${startPct}%`,
                width: `${widthPct}%`,
                top: 22,
                height: 44,
                background: 'var(--color-elevation-surface-sunken)',
              }}
            />
          )
        })}

        {stops.map((s, i) => {
          const leftPct = (s.minutes / TIMELINE_END) * 100
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: 22,
                height: 44,
                width: 3,
                background: 'var(--color-background-neutral-primary-pressed)',
                transform: 'translateX(-1.5px)',
              }}
            />
          )
        })}

        {stops.length >= 2 && (
          <StopChip
            leftPct={(stops[stops.length - 2].minutes / TIMELINE_END) * 100}
            label={`${stops.length - 1}`}
          />
        )}
        {stops.length >= 1 && (
          <FinalFlag
            leftPct={(stops[stops.length - 1].minutes / TIMELINE_END) * 100}
          />
        )}

        {exc && (
          <ExceptionMarker
            exc={exc}
            onClick={(anchor) => onOpenException(exc, anchor)}
          />
        )}
      </div>
    </div>
  )
}

function excTimeMin(detected: string) {
  const m = detected.match(/(\d+)\s*m/)
  const minsAgo = m ? parseInt(m[1], 10) : 0
  return Math.max(0, NOW_MIN - minsAgo)
}

function formatTimeMin(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  const period = h >= 12 ? 'p' : 'a'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${String(m).padStart(2, '0')}${period}`
}

function ExceptionMarker({
  exc,
  onClick,
}: {
  exc: ExceptionRow
  onClick: (anchor: HTMLElement) => void
}) {
  const min = excTimeMin(exc.detected)
  const leftPct = (min / TIMELINE_END) * 100
  return (
    <button
      onClick={(e) => onClick(e.currentTarget)}
      className="absolute z-10"
      title={`${exc.type} · ${formatTimeMin(min)}`}
      style={{
        left: `calc(${leftPct}% - 2px)`,
        top: 22,
        width: 4,
        height: 44,
        background: 'var(--color-background-system-danger-bold)',
        border: 'none',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: 8,
          background: 'var(--color-background-system-danger-bold)',
          color: 'var(--color-icon-inverse)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-elevation-raised)',
        }}
      >
        <WarningCircle size={10} weight="fill" />
      </span>
    </button>
  )
}

function StopChip({ leftPct, label }: { leftPct: number; label: string }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-[2px]"
      style={{
        left: `calc(${leftPct}% - 9px)`,
        top: 34,
        width: 18,
        height: 20,
        background: 'var(--color-elevation-surface-raised)',
        border: '0.5px solid var(--color-border-primary)',
        color: 'var(--color-text-primary)',
        fontSize: 10,
        fontWeight: 600,
        boxShadow: 'var(--shadow-elevation-element)',
      }}
    >
      {label}
    </div>
  )
}

function FinalFlag({ leftPct }: { leftPct: number }) {
  return (
    <div
      className="absolute flex items-center justify-center rounded-[2px]"
      style={{
        left: `calc(${leftPct}% - 9px)`,
        top: 34,
        width: 18,
        height: 20,
        background: 'var(--color-elevation-surface-raised)',
        border: '0.5px solid var(--color-border-primary)',
        color: 'var(--color-icon-secondary)',
        boxShadow: 'var(--shadow-elevation-element)',
      }}
    >
      <Flag size={10} weight="fill" />
    </div>
  )
}

function NowLine() {
  const pct = (NOW_MIN / TIMELINE_END) * 100
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: 0,
        bottom: 0,
        left: `calc(${LABEL_WIDTH}px + (100% - ${LABEL_WIDTH}px) * ${pct / 100})`,
        width: 1,
        background: 'var(--color-text-primary)',
      }}
    >
      <div
        className="absolute -top-1.5"
        style={{
          left: -4,
          width: 9,
          height: 9,
          borderRadius: 5,
          background: 'var(--color-text-primary)',
        }}
      />
    </div>
  )
}

function parseTime(s: string) {
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return 0
  let hours = parseInt(m[1], 10)
  const minutes = parseInt(m[2], 10)
  const period = m[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function formatHour(h: number) {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}
