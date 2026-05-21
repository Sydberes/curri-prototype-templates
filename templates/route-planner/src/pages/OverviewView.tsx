import { OverviewMap } from '../components/OverviewMap'
import { OverviewToolbar } from '../components/OverviewToolbar'
import { RouteTimeline } from '../components/RouteTimeline'
import type { ExceptionRow } from '../data/exceptions'

export function OverviewView({
  onOpenException,
}: {
  onOpenException: (row: ExceptionRow, anchor: HTMLElement) => void
  onOpenRoute?: () => void
}) {
  return (
    <div className="h-full flex flex-col">
      <OverviewToolbar />
      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{ background: 'var(--color-elevation-surface-sunken)' }}
      >
        <div className="flex-[3] min-h-0 p-2">
          <div
            className="w-full h-full rounded-lg overflow-hidden border"
            style={{ borderColor: 'var(--color-border-primary)' }}
          >
            <OverviewMap onOpenException={onOpenException} />
          </div>
        </div>
        <div
          className="flex-[2] min-h-0 border-t"
          style={{ borderColor: 'var(--color-border-primary)' }}
        >
          <RouteTimeline onOpenException={onOpenException} />
        </div>
      </div>
    </div>
  )
}
