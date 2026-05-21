import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, WarningCircle, ArrowRight, Phone } from '@phosphor-icons/react'
import { SEVERITY_LABEL, type ExceptionRow } from '../data/exceptions'

export type PopoverContext = { row: ExceptionRow; anchor: DOMRect }

type Props = {
  context: PopoverContext | null
  onClose: () => void
  onPromote: (row: ExceptionRow) => void
}

const POPOVER_WIDTH = 320
const GAP = 10
const EDGE_PADDING = 12

export function ExceptionPopover({ context, onClose, onPromote }: Props) {
  const popRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    if (!context) {
      setPos(null)
      setOpen(false)
      return
    }
    const measure = () => {
      const el = popRef.current
      if (!el) return
      const anchor = context.anchor
      const popH = el.offsetHeight
      const vw = window.innerWidth
      const vh = window.innerHeight

      let left = anchor.right + GAP
      let placement: 'right' | 'left' | 'below' = 'right'
      if (left + POPOVER_WIDTH > vw - EDGE_PADDING) {
        const leftAttempt = anchor.left - POPOVER_WIDTH - GAP
        if (leftAttempt >= EDGE_PADDING) {
          left = leftAttempt
          placement = 'left'
        } else {
          left = Math.max(
            EDGE_PADDING,
            Math.min(anchor.left, vw - POPOVER_WIDTH - EDGE_PADDING),
          )
          placement = 'below'
        }
      }

      let top: number
      if (placement === 'below') {
        top = anchor.bottom + GAP
        if (top + popH > vh - EDGE_PADDING) {
          top = Math.max(EDGE_PADDING, anchor.top - popH - GAP)
        }
      } else {
        top = anchor.top + anchor.height / 2 - popH / 2
        top = Math.max(
          EDGE_PADDING,
          Math.min(top, vh - popH - EDGE_PADDING),
        )
      }
      setPos({ top, left })
      requestAnimationFrame(() => setOpen(true))
    }
    measure()
  }, [context])

  useEffect(() => {
    if (!context) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(
      () => document.addEventListener('mousedown', onDown),
      0,
    )
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
      document.removeEventListener('mousedown', onDown)
    }
  }, [context, onClose])

  if (!context || typeof document === 'undefined') return null
  const { row } = context

  return createPortal(
    <div
      ref={popRef}
      role="dialog"
      className={`exc-popover ${open ? 'is-open' : ''}`}
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
      }}
    >
      <div className="exc-pop-hdr">
        <div className="flex items-center gap-2 min-w-0">
          <WarningCircle
            size={16}
            weight="fill"
            color="var(--color-icon-danger)"
          />
          <span className="exc-pop-title">{row.type}</span>
        </div>
        <button
          className="curri-icon-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={12} />
        </button>
      </div>

      <div className="exc-pop-meta-row">
        <span className={`badge badge-${row.severity}`}>
          <span className="dot" />
          {SEVERITY_LABEL[row.severity]}
        </span>
        <span className="exc-pop-detected">Detected {row.detected}</span>
      </div>

      <p className="exc-pop-summary text-pretty">{summary(row.type)}</p>

      <div className="exc-pop-stops">
        <StopMini kind="pickup" address={row.pickup} />
        <div className="exc-pop-stop-arrow">
          <ArrowRight size={11} color="var(--color-icon-tertiary)" />
        </div>
        <StopMini kind="dropoff" address={row.dropoff} />
      </div>

      <div className="exc-pop-kv-grid">
        <KV label="Driver" value={row.driver} />
        <KV label="Route" value={row.route} />
        <KV label="Order" value={row.order} />
      </div>

      <div className="exc-pop-footer">
        <button
          className="curri-btn curri-btn-sm curri-btn-primary curri-btn-icon"
          aria-label="Call driver"
        >
          <Phone size={12} />
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="curri-btn curri-btn-sm curri-btn-primary"
            onClick={() => onPromote(row)}
          >
            View details
          </button>
          <button className="curri-btn curri-btn-sm curri-btn-brand">
            Resolve
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function StopMini({
  kind,
  address,
}: {
  kind: 'pickup' | 'dropoff'
  address: string
}) {
  return (
    <div className="exc-pop-stop">
      <div className="exc-pop-stop-tile">
        {kind === 'pickup' ? (
          <span
            style={{
              display: 'inline-block',
              width: 0,
              height: 0,
              borderLeft: '3.5px solid transparent',
              borderRight: '3.5px solid transparent',
              borderBottom: '6px solid var(--color-icon-inverse)',
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
      <div className="min-w-0 flex flex-col">
        <span className="exc-pop-stop-label">
          {kind === 'pickup' ? 'Pickup' : 'Drop-off'}
        </span>
        <span className="exc-pop-stop-addr">{address}</span>
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="exc-pop-kv">
      <span className="exc-pop-kv-label">{label}</span>
      <span className="exc-pop-kv-value">{value}</span>
    </div>
  )
}

function summary(type: string) {
  switch (type) {
    case 'Driver not moving':
      return 'Driver has been stationary for 9 min outside the scheduled stop window.'
    case 'Order failed':
      return 'Driver was unable to complete the pickup or drop-off for this order.'
    default:
      return 'Issue detected on this route.'
  }
}
