import { Buildings, CaretDown, DotsThree } from '@phosphor-icons/react'

const PLANNER_TABS = [
  { label: 'All', count: 12, active: true },
  { label: 'Planned', count: 10 },
  { label: 'Not scheduled', count: 0 },
  { label: 'Unassigned', count: 2 },
]

export function TopNavHeader({ pageTitle }: { pageTitle: string }) {
  return (
    <div
      className="h-10 px-6 flex items-center justify-between shrink-0 border-b"
      style={{
        borderColor: 'var(--color-border-primary)',
        background: 'var(--color-elevation-surface-primary)',
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-[12px]"
          style={{
            color: 'var(--color-text-primary)',
            fontWeight: 500,
            lineHeight: '18px',
          }}
        >
          {pageTitle}
        </span>

        {pageTitle === 'Planner' && (
          <div className="flex items-center gap-2">
            {PLANNER_TABS.map((t) => (
              <TabChip key={t.label} {...t} />
            ))}
            <Divider />
            <DispatchedBtn />
          </div>
        )}
      </div>

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
        <Buildings size={12} style={{ color: 'var(--color-icon-secondary)' }} />
        <span>2 teams selected</span>
        <CaretDown size={12} style={{ color: 'var(--color-icon-secondary)' }} />
      </button>
    </div>
  )
}

function TabChip({
  label,
  count,
  active,
}: {
  label: string
  count: number
  active?: boolean
}) {
  return (
    <button
      className="h-6 inline-flex items-center gap-1 px-4 rounded-[4px]"
      style={{
        border: '0.5px solid var(--color-border-primary)',
        background: active
          ? 'var(--color-background-neutral-primary-pressed)'
          : 'var(--color-background-neutral-primary)',
        boxShadow: 'var(--shadow-elevation-element)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      <span style={{ color: 'var(--color-text-primary)' }}>{label}</span>
      <span style={{ color: 'var(--color-text-tertiary)' }}>{count}</span>
    </button>
  )
}

function Divider() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 0.5,
        height: 16,
        background: 'var(--color-border-primary)',
      }}
    />
  )
}

function DispatchedBtn() {
  return (
    <button
      className="h-6 inline-flex items-center gap-1 px-1.5 rounded-[4px]"
      style={{
        background: 'transparent',
        color: 'var(--color-text-primary)',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '20px',
      }}
    >
      <DotsThree
        size={12}
        weight="bold"
        style={{ color: 'var(--color-icon-secondary)' }}
      />
      <span>Dispatched</span>
    </button>
  )
}
