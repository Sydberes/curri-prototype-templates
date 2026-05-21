import {
  MagnifyingGlass,
  Funnel,
  SortAscending,
  CaretLeft,
  CaretRight,
  CaretDown,
  WarningCircle,
  ArrowClockwise,
  ListBullets,
  Sparkle,
} from '@phosphor-icons/react'
import { ORDER_QUEUE, type OrderQueueItem } from '../data/exceptions'

export function OrderQueueRail() {
  return (
    <aside
      className="shrink-0 h-full flex flex-col border-r"
      style={{
        width: 288,
        borderColor: 'var(--color-border-primary)',
        background: 'var(--color-elevation-surface-primary)',
      }}
    >
      <div
        className="h-10 px-3 flex items-center justify-between shrink-0 border-b"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex items-center gap-1.5">
          <button className="p-0.5 rounded-[4px]">
            <CaretDown
              size={12}
              style={{ color: 'var(--color-icon-tertiary)' }}
            />
          </button>
          <span
            className="text-[12px]"
            style={{
              color: 'var(--color-text-primary)',
              fontWeight: 500,
              lineHeight: '18px',
            }}
          >
            Order Queue
          </span>
          <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-[3px] text-[10px]"
            style={{
              background: 'var(--color-background-neutral-primary-pressed)',
              color: 'var(--color-text-primary)',
              lineHeight: '14px',
            }}
          >
            11
          </span>
        </div>
        <div className="flex items-center">
          <RailIconBtn>
            <WarningCircle size={12} />
          </RailIconBtn>
          <RailIconBtn>
            <ArrowClockwise size={11} />
          </RailIconBtn>
          <RailIconBtn>
            <ListBullets size={11} />
          </RailIconBtn>
        </div>
      </div>

      <div
        className="px-3 pt-3 pb-3 shrink-0 flex flex-col gap-2.5 border-b"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="flex-1 min-w-0 h-8 inline-flex items-center gap-2 px-2.5 rounded-[6px]"
            style={{
              border: '0.5px solid var(--color-border-primary)',
              background: 'var(--color-background-input)',
            }}
          >
            <MagnifyingGlass
              size={12}
              style={{
                color: 'var(--color-icon-tertiary)',
                flexShrink: 0,
              }}
            />
            <span
              className="text-[12px] truncate"
              style={{
                color: 'var(--color-text-tertiary)',
                whiteSpace: 'nowrap',
              }}
            >
              Search orders
            </span>
          </div>
          <SquareBtn>
            <Funnel size={13} />
          </SquareBtn>
          <SquareBtn>
            <SortAscending size={13} />
          </SquareBtn>
        </div>
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 text-[11px] min-w-0"
            style={{
              color: 'var(--color-text-tertiary)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>Per page</span>
            <button
              className="h-6 inline-flex items-center gap-1 px-1.5 rounded-[4px]"
              style={{
                border: '0.5px solid var(--color-border-primary)',
                background: 'var(--color-elevation-surface-overlay)',
                color: 'var(--color-text-primary)',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              150
              <CaretDown size={9} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <PageNavBtn>
              <CaretLeft size={10} />
            </PageNavBtn>
            <span
              className="text-[11px] tabular-nums"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              1 of 10
            </span>
            <PageNavBtn>
              <CaretRight size={10} />
            </PageNavBtn>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-3 py-3 flex flex-col gap-2">
        {ORDER_QUEUE.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>

      <div
        className="px-3 py-3 shrink-0 border-t"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          className="w-full h-9 inline-flex items-center justify-center gap-2 rounded-[6px]"
          style={{
            background: 'var(--color-background-brand-primary)',
            color: 'var(--color-text-brand-button)',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          <Sparkle size={12} weight="fill" />
          Auto-assign orders
        </button>
      </div>
    </aside>
  )
}

function OrderCard({ order }: { order: OrderQueueItem }) {
  return (
    <div
      className="rounded-[8px] p-2 flex flex-col gap-1.5"
      style={{
        background: 'var(--color-elevation-surface-raised)',
        border: '0.5px solid var(--color-border-primary)',
        boxShadow: 'var(--shadow-elevation-element)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px]"
          style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
        >
          {order.orderNum}
        </span>
      </div>
      <div className="flex flex-col">
        <OrderStop
          kind="pickup"
          company={order.pickupCompany}
          address={order.pickupAddress}
          window={order.window}
        />
        <OrderStop
          kind="dropoff"
          company={order.dropoffCompany}
          address={order.dropoffAddress}
          window={order.window}
        />
      </div>
      <div className="flex gap-1 pt-0.5">
        {order.tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center h-5 px-1.5 rounded-[4px]"
            style={{
              border: '0.5px solid var(--color-border-primary)',
              fontSize: 9,
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function OrderStop({
  kind,
  company,
  address,
  window: timeWindow,
}: {
  kind: 'pickup' | 'dropoff'
  company: string
  address: string
  window: string
}) {
  return (
    <div className="flex gap-1.5 items-start p-1">
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 16,
          height: 16,
          borderRadius: 3,
          background: 'var(--color-icon-primary)',
          marginTop: 1,
        }}
      >
        {kind === 'pickup' ? (
          <span
            style={{
              display: 'inline-block',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '7px solid var(--color-icon-inverse)',
            }}
          />
        ) : (
          <span
            style={{
              display: 'inline-flex',
              width: 7,
              height: 7,
              background: 'var(--color-icon-inverse)',
              borderRadius: 1,
            }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] truncate"
          style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
        >
          {company}
        </div>
        <div
          className="text-[8px] mt-0.5"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        >
          {timeWindow}
        </div>
        <div
          className="text-[8px] truncate"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {address}
        </div>
      </div>
    </div>
  )
}

function RailIconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="h-6 w-6 inline-flex items-center justify-center rounded-[4px]"
      style={{ color: 'var(--color-icon-secondary)' }}
    >
      {children}
    </button>
  )
}

function SquareBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="h-8 w-8 inline-flex items-center justify-center rounded-[6px]"
      style={{
        border: '0.5px solid var(--color-border-primary)',
        background: 'var(--color-elevation-surface-overlay)',
        color: 'var(--color-icon-secondary)',
      }}
    >
      {children}
    </button>
  )
}

function PageNavBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="h-6 w-6 inline-flex items-center justify-center rounded-[4px]"
      style={{ color: 'var(--color-icon-secondary)' }}
    >
      {children}
    </button>
  )
}
