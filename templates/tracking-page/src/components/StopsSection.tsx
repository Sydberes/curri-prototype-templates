import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, Check } from '@phosphor-icons/react'
import { SectionTitle } from './DeliveryDetailsCard'
import type { Pod, Stop } from '../data/stops'

type Props = {
  stops: Stop[]
  selectedId: string | null
  onSelect: (id: string) => void
  onOpenPods: (stopId: string, index: number) => void
  /** Booker view: payload POs render as links that open that receiver's view. */
  onOpenOrder?: (order: string) => void
  /** Mobile: collect each row's node so the sheet can scroll a tapped stop into view. */
  rowRefs?: React.MutableRefObject<Record<string, HTMLElement | null>>
}

export function StopsSection({
  stops,
  selectedId,
  onSelect,
  onOpenPods,
  onOpenOrder,
  rowRefs,
}: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <SectionTitle>Stops</SectionTitle>

      <div className="flex flex-col w-full">
        {stops.map((stop, i) => (
          <StopRow
            key={stop.id}
            stop={stop}
            isFirst={i === 0}
            isLast={i === stops.length - 1}
            selected={selectedId === stop.id}
            onSelect={() => onSelect(stop.id)}
            onOpenPods={(idx) => onOpenPods(stop.id, idx)}
            onOpenOrder={onOpenOrder}
            rowRef={
              rowRefs
                ? (el) => {
                    rowRefs.current[stop.id] = el
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

function StopRow({
  stop,
  isFirst,
  isLast,
  selected,
  onSelect,
  onOpenPods,
  onOpenOrder,
  rowRef,
}: {
  stop: Stop
  isFirst: boolean
  isLast: boolean
  selected: boolean
  onSelect: () => void
  onOpenPods: (idx: number) => void
  onOpenOrder?: (order: string) => void
  rowRef?: (el: HTMLElement | null) => void
}) {
  const stopLabel = String(stop.index)
  const isCancelled = stop.status === 'cancelled'
  const hasPods = !isCancelled && stop.pods && stop.pods.length > 0

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={onSelect}
      className={`tp-stop-row${selected ? ' is-selected' : ''} flex gap-2 -mx-2 px-2 rounded text-left`}
    >
      {/* Node + line column — node sits at fixed top offset so it aligns with
          the body's first line of text; both line segments fill their share
          so adjacent rows' lines meet flush at the row boundary. */}
      <div
        className="flex flex-col items-center shrink-0 self-stretch"
        style={{ width: 16 }}
      >
        <div
          className="flex justify-center shrink-0"
          style={{ height: 6, width: '100%' }}
        >
          {!isFirst && (
            <span
              style={{
                width: 1,
                height: '100%',
                background: 'var(--color-border-primary)',
              }}
            />
          )}
        </div>

        <StopNode stop={stop} label={stopLabel} selected={selected} />

        <div
          className="flex justify-center"
          style={{ flex: '1 0 0', width: '100%' }}
        >
          {!isLast && (
            <span
              style={{
                width: 1,
                height: '100%',
                background: 'var(--color-border-primary)',
              }}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 min-w-0 pt-1 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="truncate"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--tp-body-size, 12px)',
              lineHeight: 'var(--tp-body-line, 18px)',
              fontWeight: 500,
            }}
          >
            {stop.name}
          </span>
        </div>
        <span
          className="truncate"
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--tp-body-size, 12px)',
            lineHeight: 'var(--tp-body-line, 18px)',
            fontWeight: 400,
          }}
        >
          {stop.address}
        </span>
        {isCancelled ? (
          <CancelledTag />
        ) : (
          <PayloadLine stop={stop} onOpenOrder={onOpenOrder} />
        )}
        <AnimatePresence initial={false}>
          {hasPods && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden"
            >
              <PodThumbStrip pods={stop.pods!} onOpen={onOpenPods} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side: ETA (hidden for a cancelled stop — it won't be reached) */}
      <div className="flex items-start shrink-0 pt-px">
        {!isCancelled && (
          <span
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--tp-body-size, 12px)',
              lineHeight: 'var(--tp-body-line, 18px)',
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {stop.eta}
          </span>
        )}
      </div>
    </button>
  )
}

/**
 * Payload manifest. Multi-PO pickups (edge case) default to a quiet summary —
 * "4 orders · 14 items" — and expand on click into stacked `PO · N items`
 * lines. In the booker view each PO is a link into that receiver's tracking
 * view; in the receiver view it's plain text and only their own PO shows.
 */
function PayloadLine({
  stop,
  onOpenOrder,
}: {
  stop: Stop
  onOpenOrder?: (order: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const multi = stop.orders && stop.orders.length > 1

  if (!multi) {
    const line = stop.orders?.[0] ?? { order: stop.order, items: stop.items }
    return <OrderLine line={line} onOpenOrder={onOpenOrder} />
  }

  return (
    <span className="flex flex-col items-start">
      <span
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        className="tp-payload-summary inline-flex items-center gap-1"
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--tp-body-size, 12px)',
          lineHeight: 'var(--tp-body-line, 18px)',
          fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setExpanded((x) => !x)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation()
            setExpanded((x) => !x)
          }
        }}
      >
        {stop.orders!.length} orders · {stop.items} item
        {stop.items === 1 ? '' : 's'}
        <CaretDown
          size={10}
          style={{
            color: 'var(--color-icon-tertiary)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </span>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden flex flex-col"
          >
            {stop.orders!.map((line) => (
              <OrderLine
                key={line.order}
                line={line}
                onOpenOrder={onOpenOrder}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

function OrderLine({
  line,
  onOpenOrder,
}: {
  line: { order: string; items: number }
  onOpenOrder?: (order: string) => void
}) {
  return (
    <span
      className="truncate"
      style={{
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--tp-body-size, 12px)',
        lineHeight: 'var(--tp-body-line, 18px)',
        fontWeight: 400,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {onOpenOrder ? (
        <span
          role="link"
          tabIndex={0}
          className="tp-payload-link"
          onClick={(e) => {
            e.stopPropagation()
            onOpenOrder(line.order)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation()
              onOpenOrder(line.order)
            }
          }}
        >
          {line.order}
        </span>
      ) : (
        line.order
      )}
      {' · '}
      {line.items} item{line.items === 1 ? '' : 's'}
    </span>
  )
}

/**
 * "Canceled" badge — matches the status badge on the delivery-history page:
 * a red-tinted pill with a #cc2222 dot and the label in primary text.
 */
function CancelledTag() {
  return (
    <span
      className="inline-flex items-center rounded-full mt-0.5 self-start"
      style={{
        gap: 4,
        padding: '0 6px',
        background: 'rgba(255, 80, 80, 0.12)',
        color: 'var(--color-text-primary)',
        fontSize: 'var(--tp-body-size, 12px)',
        lineHeight: 'var(--tp-body-line, 18px)',
        fontWeight: 500,
      }}
    >
      <span
        aria-hidden
        className="rounded-full"
        style={{ width: 6, height: 6, background: '#cc2222' }}
      />
      Canceled
    </span>
  )
}

function StopNode({
  stop,
  label,
  selected,
}: {
  stop: Stop
  label: string
  selected: boolean
}) {
  const isDone = stop.status === 'delivered'
  const isActive = stop.status === 'arrived' || stop.status === 'en-route'
  const isPending = stop.status === 'pending'
  const isCancelled = stop.status === 'cancelled'

  let bg = 'var(--color-icon-primary)'
  let color = 'var(--color-text-primary-inverse)'
  let ring: string | undefined

  if (isDone) {
    bg = 'var(--color-background-brand-primary)'
    color = 'var(--color-text-brand-button)'
  } else if (isActive) {
    bg = 'var(--color-icon-primary)'
    color = 'var(--color-text-primary-inverse)'
  } else if (isCancelled) {
    // Uniform neutral node, dimmed — status lives in the badge (matches delivery history).
    bg = 'var(--color-background-neutral-primary-pressed)'
    color = 'var(--color-text-tertiary)'
  } else if (isPending) {
    bg = 'var(--color-background-neutral-primary-pressed)'
    color = 'var(--color-text-tertiary)'
  }

  return (
    <motion.span
      initial={false}
      animate={{ scale: selected ? 1.05 : 1 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-[4px] flex items-center justify-center"
      style={{
        width: 16,
        height: 16,
        background: bg,
        color,
        boxShadow: ring,
        opacity: isCancelled ? 0.7 : 1,
      }}
    >
      {isDone ? (
        <Check size={10} weight="bold" />
      ) : (
        <span
          className="text-[11px]"
          style={{
            fontWeight: 600,
            lineHeight: '14px',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      )}
    </motion.span>
  )
}


function PodThumbStrip({
  pods,
  onOpen,
}: {
  pods: Pod[]
  onOpen: (idx: number) => void
}) {
  return (
    <div
      className="mt-2 flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {pods.map((pod, i) => (
        <motion.button
          key={pod.src}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpen(i)
          }}
          initial={{ opacity: 0, scale: 0.94, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: i * 0.06,
            duration: 0.32,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="rounded-[4px] overflow-hidden shrink-0"
          style={{
            width: 36,
            height: 36,
            border: '0.5px solid var(--color-border-primary)',
            boxShadow: '0 0.5px 1px rgba(0,0,0,0.1)',
          }}
          aria-label={pod.label}
        >
          <img
            src={pod.src}
            alt={pod.label}
            className="w-full h-full object-cover"
          />
        </motion.button>
      ))}
    </div>
  )
}
