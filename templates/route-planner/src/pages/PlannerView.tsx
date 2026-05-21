import { OrderQueueRail } from '../components/OrderQueueRail'
import { PlannerToolbar } from '../components/PlannerToolbar'
import { Swimlane } from '../components/Swimlane'
import { PLANNER_LANES, type ExceptionRow } from '../data/exceptions'

export function PlannerView({
  onOpenException,
}: {
  onOpenException: (row: ExceptionRow, anchor: HTMLElement) => void
}) {
  return (
    <div className="h-full flex">
      <OrderQueueRail />

      <div className="flex-1 min-w-0 h-full flex flex-col">
        <PlannerToolbar />
        <div
          className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden"
          style={{ background: 'var(--color-elevation-surface-sunken)' }}
        >
          <div className="h-full flex gap-2 p-3 min-w-max">
            {PLANNER_LANES.map((lane) => (
              <Swimlane
                key={lane.id}
                lane={lane}
                onOpenException={onOpenException}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
