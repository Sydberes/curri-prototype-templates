import { CaretRight, List } from '@phosphor-icons/react'

type Props = {
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  /** Booker drilled into one receiver's view: adds a PO crumb, makes "Track delivery" the way back. */
  legCrumb?: { label: string; onBack: () => void }
  /** Narrow breakpoints: a hamburger that opens the nav drawer (booker only). */
  onMenu?: () => void
  /** The "My deliveries" root crumb belongs to logged-in workspace nav; drop it
   *  for share-link recipients and where space is tight. */
  showHomeCrumb?: boolean
}

export function TopNav({
  leftSlot,
  rightSlot,
  legCrumb,
  onMenu,
  showHomeCrumb = true,
}: Props) {
  return (
    <header
      className="h-10 shrink-0 flex items-center justify-between gap-3 pl-2 pr-2 sm:pl-4 sm:pr-3"
      style={{
        background: 'var(--color-elevation-surface-primary)',
        borderBottom: '0.5px solid var(--color-border-primary)',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onMenu && (
          <button
            type="button"
            onClick={onMenu}
            aria-label="Open menu"
            className="tp-action-btn w-8 h-8 -ml-0.5 rounded-[4px] flex items-center justify-center shrink-0"
            style={{ color: 'var(--color-icon-primary)' }}
          >
            <List size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          {showHomeCrumb && (
            <>
              <Crumb>My deliveries</Crumb>
              <Sep />
            </>
          )}
          {legCrumb ? (
            <>
              <button
                type="button"
                onClick={legCrumb.onBack}
                className="text-[12px] tp-crumb-back"
                style={{
                  color: 'var(--color-text-tertiary)',
                  lineHeight: '18px',
                  fontWeight: 500,
                }}
              >
                Track delivery
              </button>
              <Sep />
              <Crumb current>{legCrumb.label}</Crumb>
            </>
          ) : (
            <Crumb current>Track delivery</Crumb>
          )}
        </div>
        {leftSlot}
      </div>
      {rightSlot}
    </header>
  )
}

function Crumb({
  children,
  current,
}: {
  children: React.ReactNode
  current?: boolean
}) {
  return (
    <span
      className="text-[12px]"
      style={{
        color: current
          ? 'var(--color-text-primary)'
          : 'var(--color-text-tertiary)',
        lineHeight: '18px',
        fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {children}
    </span>
  )
}

function Sep() {
  return (
    <CaretRight size={10} style={{ color: 'var(--color-icon-tertiary)' }} />
  )
}
