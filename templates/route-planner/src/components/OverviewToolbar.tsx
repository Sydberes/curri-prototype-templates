import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  CaretDown,
  MapTrifold,
  ListBullets,
  ClockClockwise,
} from '@phosphor-icons/react'

export function OverviewToolbar() {
  return (
    <div
      className="h-10 px-3 flex items-center justify-between shrink-0 border-b"
      style={{ borderColor: 'var(--color-border-primary)' }}
    >
      <div className="flex items-center gap-2">
        <DatePicker />
        <RouteCountChip />
      </div>

      <ViewToggle />
    </div>
  )
}

function DatePicker() {
  return (
    <div className="flex items-center">
      <button
        className="h-6 w-6 inline-flex items-center justify-center"
        style={{
          border: '0.5px solid var(--color-border-primary)',
          borderRight: 'none',
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
          background: 'transparent',
          color: 'var(--color-icon-secondary)',
        }}
        aria-label="Previous day"
      >
        <CaretLeft size={12} />
      </button>
      <button
        className="h-6 inline-flex items-center gap-1 px-4"
        style={{
          border: '0.5px solid var(--color-border-primary)',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: '20px',
        }}
      >
        <CalendarBlank
          size={12}
          style={{ color: 'var(--color-icon-secondary)' }}
        />
        <span>05/20/2026</span>
      </button>
      <button
        className="h-6 w-6 inline-flex items-center justify-center"
        style={{
          border: '0.5px solid var(--color-border-primary)',
          borderLeft: 'none',
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
          background: 'transparent',
          color: 'var(--color-icon-secondary)',
        }}
        aria-label="Next day"
      >
        <CaretRight size={12} />
      </button>
    </div>
  )
}

function RouteCountChip() {
  return (
    <button
      className="h-6 inline-flex items-center gap-1 px-4 rounded-[4px]"
      style={{
        border: '0.5px solid var(--color-border-primary)',
        background: 'transparent',
        color: 'var(--color-text-primary)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      <span>12 Routes</span>
      <CaretDown size={10} style={{ color: 'var(--color-icon-secondary)' }} />
    </button>
  )
}

function ViewToggle() {
  return (
    <div
      className="inline-flex"
      style={{
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <ToggleBtn active>
        <MapTrifold size={12} />
      </ToggleBtn>
      <ToggleBtn>
        <ListBullets size={12} />
      </ToggleBtn>
      <ToggleBtn>
        <ClockClockwise size={12} />
      </ToggleBtn>
    </div>
  )
}

function ToggleBtn({
  children,
  active,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      className="h-6 w-7 inline-flex items-center justify-center"
      style={{
        background: active
          ? 'var(--color-background-neutral-primary-pressed)'
          : 'transparent',
        color: 'var(--color-icon-secondary)',
      }}
    >
      {children}
    </button>
  )
}
