import { useState } from 'react'
import { Sidebar, type ActiveNav } from './components/Sidebar'
import { ExceptionDrawer } from './components/ExceptionDrawer'
import {
  ExceptionPopover,
  type PopoverContext,
} from './components/ExceptionPopover'
import { TopNavHeader } from './components/TopNavHeader'
import { ExceptionsList } from './pages/ExceptionsList'
import { OverviewView } from './pages/OverviewView'
import { PlannerView } from './pages/PlannerView'
import type { ExceptionRow } from './data/exceptions'

export type OpenExceptionFn = (row: ExceptionRow, anchor: HTMLElement) => void

export default function App() {
  const [view, setView] = useState<ActiveNav>('Planner')
  const [popover, setPopover] = useState<PopoverContext | null>(null)
  const [drawerRow, setDrawerRow] = useState<ExceptionRow | null>(null)

  const openException: OpenExceptionFn = (row, anchor) => {
    setPopover({ row, anchor: anchor.getBoundingClientRect() })
  }

  const promoteToDrawer = (row: ExceptionRow) => {
    setPopover(null)
    setDrawerRow(row)
  }

  return (
    <div
      className="h-screen w-screen flex"
      style={{ background: 'var(--color-elevation-surface-base)' }}
    >
      <Sidebar active={view} onSelect={setView} />

      <main className="flex-1 min-w-0 pt-1.5 pr-1.5 pb-1.5">
        <div
          className="relative h-full flex flex-col overflow-hidden rounded-lg border"
          style={{
            background: 'var(--color-elevation-surface-primary)',
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <TopNavHeader pageTitle={view} />

          <div className="flex-1 min-h-0 overflow-hidden">
            {view === 'Exceptions' && (
              <ExceptionsList onOpenDrawer={setDrawerRow} />
            )}
            {view === 'Overview' && (
              <OverviewView onOpenException={openException} />
            )}
            {view === 'Planner' && (
              <PlannerView onOpenException={openException} />
            )}
          </div>
        </div>
      </main>

      <ExceptionPopover
        context={popover}
        onClose={() => setPopover(null)}
        onPromote={promoteToDrawer}
      />
      <ExceptionDrawer
        row={drawerRow}
        onClose={() => setDrawerRow(null)}
      />
    </div>
  )
}
