import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  Funnel,
  MapTrifold,
  MagnifyingGlass,
  Sliders,
  DotsThree,
} from '@phosphor-icons/react'

export function PlannerToolbar() {
  return (
    <div
      className="h-10 px-3 flex items-center justify-between shrink-0 border-b"
      style={{ borderColor: 'var(--color-border-primary)' }}
    >
      <div className="flex items-center gap-2">
        <DatePicker />
        <FilterChip />
      </div>

      <div className="flex items-center">
        <MapBtn />
        <IconBtn>
          <MagnifyingGlass size={12} />
        </IconBtn>
        <IconBtn pressed>
          <Sliders size={12} />
        </IconBtn>
        <IconBtn>
          <DotsThree size={12} weight="bold" />
        </IconBtn>
      </div>
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

function FilterChip() {
  return (
    <button
      className="h-6 inline-flex items-center gap-1 px-4 rounded-[4px]"
      style={{
        background: 'var(--color-background-neutral-secondary-pressed)',
        color: 'var(--color-text-secondary)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      <Funnel size={12} />
      <span>Filter</span>
    </button>
  )
}

function MapBtn() {
  return (
    <button
      className="h-6 inline-flex items-center gap-1 px-4 rounded-[4px]"
      style={{
        background: 'transparent',
        color: 'var(--color-text-primary)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      <MapTrifold
        size={12}
        style={{ color: 'var(--color-icon-secondary)' }}
      />
      <span>Map</span>
    </button>
  )
}

function IconBtn({
  children,
  pressed,
}: {
  children: React.ReactNode
  pressed?: boolean
}) {
  return (
    <button
      className="h-6 w-6 inline-flex items-center justify-center rounded-[4px]"
      style={{
        background: pressed
          ? 'var(--color-background-neutral-secondary-pressed)'
          : 'transparent',
        color: 'var(--color-icon-secondary)',
      }}
    >
      {children}
    </button>
  )
}
