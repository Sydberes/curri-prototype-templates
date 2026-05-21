import { ExceptionsTable } from '../components/ExceptionsTable'
import type { ExceptionRow } from '../data/exceptions'

export function ExceptionsList({
  onOpenDrawer,
}: {
  onOpenDrawer: (row: ExceptionRow) => void
}) {
  return (
    <div className="h-full flex flex-col">
      <header className="px-6 pt-5 pb-4 shrink-0">
        <h1
          className="text-[18px] leading-[24px] text-pretty"
          style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
        >
          Active exceptions
        </h1>
        <p
          className="text-[12px] leading-[16px] mt-1 text-pretty"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Driver, route, and stop issues that need attention.
        </p>
      </header>

      <ExceptionsTable onOpenDrawer={onOpenDrawer} />
    </div>
  )
}
