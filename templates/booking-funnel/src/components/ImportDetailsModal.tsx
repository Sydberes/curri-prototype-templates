import { useEffect, useRef, useState } from 'react'
import {
  X,
  Paperclip,
  Trash,
  CaretDown,
  Check,
  DotsSixVertical,
} from '@phosphor-icons/react'
import { CoreIntelligenceIcon, LogoSpin, LoadingText } from './CoreIntelligence'

type Phase = 'intake' | 'running' | 'done'

type StepId = 'read' | 'identify' | 'addresses' | 'items'

type StepStatus = 'pending' | 'running' | 'done'

interface StepDef {
  id: StepId
  label: string
  /** Real-time duration the prototype waits on this step (ms). */
  duration: number
  /** Status copy shown while the step is running. */
  loadingLabel: string
}

const STEPS: StepDef[] = [
  { id: 'read', label: 'Read document', duration: 9000, loadingLabel: 'Preparing your shipment details' },
  { id: 'identify', label: 'Identify order', duration: 2000, loadingLabel: 'Looking up order references' },
  { id: 'addresses', label: 'Determine addresses', duration: 2000, loadingLabel: 'Geocoding addresses' },
  { id: 'items', label: 'Add item dimensions', duration: 2000, loadingLabel: 'Reading product details' },
]

const ATTACHMENT_TYPES = [
  'Bill of Lading',
  'Invoice',
  'Purchase Order',
  'Shipping ticket',
  'Other',
]

export function ImportDetailsModal({
  open,
  startPhase = 'intake',
  fileName = 'ship-ticket 111.pdf',
  onClose,
  onAutoFill,
}: {
  open: boolean
  startPhase?: Phase
  fileName?: string
  onClose: () => void
  onAutoFill: () => void
}) {
  const [phase, setPhase] = useState<Phase>(startPhase)
  const [attachmentType, setAttachmentType] = useState(ATTACHMENT_TYPES[0])
  const [statuses, setStatuses] = useState<Record<StepId, StepStatus>>({
    read: 'pending',
    identify: 'pending',
    addresses: 'pending',
    items: 'pending',
  })
  const [elapsed, setElapsed] = useState<Record<StepId, number>>({
    read: 0,
    identify: 0,
    addresses: 0,
    items: 0,
  })

  const timersRef = useRef<number[]>([])
  const intervalRef = useRef<number | null>(null)

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Reset whenever modal opens
  useEffect(() => {
    if (!open) return
    setPhase(startPhase)
    setStatuses({ read: 'pending', identify: 'pending', addresses: 'pending', items: 'pending' })
    setElapsed({ read: 0, identify: 0, addresses: 0, items: 0 })
    return clearTimers
  }, [open, startPhase])

  // Auto-start the agent trace when phase = running
  useEffect(() => {
    if (phase !== 'running') return
    clearTimers()

    let cursor = 0
    const runNext = () => {
      if (cursor >= STEPS.length) {
        setPhase('done')
        return
      }
      const step = STEPS[cursor]
      const startedAt = Date.now()

      setStatuses((prev) => ({ ...prev, [step.id]: 'running' }))

      const interval = window.setInterval(() => {
        setElapsed((prev) => ({
          ...prev,
          [step.id]: Math.floor((Date.now() - startedAt) / 1000),
        }))
      }, 250)
      intervalRef.current = interval

      const tid = window.setTimeout(() => {
        window.clearInterval(interval)
        intervalRef.current = null
        setStatuses((prev) => ({ ...prev, [step.id]: 'done' }))
        setElapsed((prev) => ({
          ...prev,
          [step.id]: Math.floor(step.duration / 1000),
        }))
        cursor += 1
        runNext()
      }, step.duration)
      timersRef.current.push(tid)
    }

    runNext()
    return clearTimers
  }, [phase])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center pt-16"
      style={{ background: 'var(--color-blanket-blanket)' }}
      onClick={onClose}
    >
      <div
        className="relative w-[640px] max-h-[calc(100vh-128px)] rounded-lg border flex flex-col overflow-hidden"
        style={{
          background: 'var(--color-elevation-surface-overlay)',
          borderColor: 'var(--color-border-primary)',
          boxShadow: 'var(--shadow-elevation-overlay)',
          animation: 'ai-fade-in 200ms ease-out both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="px-6 py-4 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-2.5">
            {phase === 'running' ? (
              <LogoSpin size={18} />
            ) : (
              <CoreIntelligenceIcon
                size={18}
                style={{ color: 'var(--color-icon-primary)' }}
              />
            )}
            <h2
              className="text-[18px] leading-[24px] tracking-[-0.36px]"
              style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
            >
              Import delivery details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded"
            style={{ color: 'var(--color-icon-secondary)' }}
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-2">
          {phase === 'intake' ? (
            <IntakePane
              fileName={fileName}
              attachmentType={attachmentType}
              onChangeType={setAttachmentType}
            />
          ) : (
            <TracePane statuses={statuses} elapsed={elapsed} />
          )}
        </div>

        <footer
          className="px-6 py-4 flex items-center justify-between border-t shrink-0"
          style={{ borderColor: 'var(--color-border-primary)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded border text-[14px] leading-[20px]"
            style={{
              background: 'var(--color-elevation-surface-raised)',
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          {phase === 'intake' ? (
            <PrimaryCTA onClick={() => setPhase('running')}>
              Process Booking Data
            </PrimaryCTA>
          ) : (
            <PrimaryCTA
              disabled={phase !== 'done'}
              onClick={onAutoFill}
            >
              Auto-fill
            </PrimaryCTA>
          )}
        </footer>
      </div>
    </div>
  )
}

function IntakePane({
  fileName,
  attachmentType,
  onChangeType,
}: {
  fileName: string
  attachmentType: string
  onChangeType: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <div className="flex flex-col gap-1.5">
        <label
          className="text-[12px] leading-[16px]"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        >
          Select attachment type
        </label>
        <div
          className="relative flex items-center rounded border h-10 px-3"
          style={{
            background: 'var(--color-background-input)',
            borderColor: 'var(--color-border-bold)',
          }}
        >
          <select
            value={attachmentType}
            onChange={(e) => onChangeType(e.target.value)}
            className="flex-1 bg-transparent outline-none appearance-none text-[14px] leading-[20px] pr-6"
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            {ATTACHMENT_TYPES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <CaretDown
            size={14}
            className="absolute right-3 pointer-events-none"
            style={{ color: 'var(--color-icon-secondary)' }}
          />
        </div>
      </div>

      <div
        className="flex items-center gap-2 rounded border h-12 px-3"
        style={{
          background: 'var(--color-background-input)',
          borderColor: 'var(--color-border-bold)',
        }}
      >
        <Paperclip
          size={16}
          style={{ color: 'var(--color-icon-secondary)' }}
        />
        <span
          className="flex-1 text-[14px] leading-[20px] truncate"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        >
          {fileName}
        </span>
        <button
          type="button"
          aria-label="Remove file"
          className="w-7 h-7 flex items-center justify-center rounded"
          style={{ color: 'var(--color-icon-secondary)' }}
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  )
}

function TracePane({
  statuses,
  elapsed,
}: {
  statuses: Record<StepId, StepStatus>
  elapsed: Record<StepId, number>
}) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      {STEPS.map((step) => (
        <TraceStep
          key={step.id}
          step={step}
          status={statuses[step.id]}
          elapsed={elapsed[step.id]}
        />
      ))}
    </div>
  )
}

function TraceStep({
  step,
  status,
  elapsed,
}: {
  step: StepDef
  status: StepStatus
  elapsed: number
}) {
  return (
    <div
      className="rounded border overflow-hidden"
      style={{ borderColor: 'var(--color-border-primary)' }}
    >
      <div
        className="px-3 py-2 flex items-center justify-between"
        style={{ background: 'var(--color-elevation-surface-sunken)' }}
      >
        <div className="flex items-center gap-2.5">
          <StepIndicator status={status} />
          {status === 'running' ? (
            <LoadingText
              label={step.label}
              size={14}
              lineHeight={21}
              weight={600}
              ellipsis={false}
            />
          ) : (
            <span
              className="text-[14px] leading-[21px]"
              style={{
                color:
                  status === 'pending'
                    ? 'var(--color-text-tertiary)'
                    : 'var(--color-text-primary)',
                fontWeight: 600,
              }}
            >
              {step.label}
            </span>
          )}
        </div>
        {(status === 'running' || status === 'done') && (
          <span
            className="text-[12px] leading-[16px] tabular-nums"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {elapsed}s
          </span>
        )}
      </div>

      {status === 'running' && (
        <div className="px-3 py-3">
          <LoadingText label={step.loadingLabel} size={13} />
        </div>
      )}
      {status === 'done' && <StepResult id={step.id} />}
    </div>
  )
}

function StepIndicator({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--color-background-system-success-bold)',
          color: 'var(--color-text-primary-inverse)',
        }}
      >
        <Check size={10} weight="bold" />
      </span>
    )
  }
  return (
    <span
      className="w-4 h-4 rounded-full border"
      style={{
        borderColor: 'var(--color-border-primary)',
        background: 'transparent',
      }}
    />
  )
}

function StepResult({ id }: { id: StepId }) {
  switch (id) {
    case 'read':
      return (
        <div
          className="px-3 py-3 text-[13px] leading-[19px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Ship plumbing product from CURRI INC – SEATTLE to Valley HVAC
          Services in Spokane, WA for order S0780208044.178.
        </div>
      )
    case 'identify':
      return (
        <div
          className="px-3 py-3 flex flex-col gap-1 text-[13px] leading-[19px]"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span>Order #: S0780208044.178</span>
          <span>PO #: TS836.79783-51485</span>
        </div>
      )
    case 'addresses':
      return (
        <div className="px-3 py-3 flex flex-col gap-3">
          <AddressRow
            label="Pickup address"
            value="805 Nw 42nd St, Seattle, WA 98107"
            primary
          />
          <AddressRow
            label="Dropoff address"
            value="5202 N Florida St, Spokane, WA 99217"
            primary
          />
          <AddressRow
            label="Found address"
            value="8221 Greenwood Ave N, Seattle, WA 98103"
          />
          <AddressRow
            label="Found address"
            value="5701 Oak Ave, Seattle, WA 98232"
          />
        </div>
      )
    case 'items':
      return (
        <div className="px-3 py-3 flex flex-col gap-1">
          <span
            className="text-[13px] leading-[19px]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Coiled 1/2" Brass Ball Valve (2400602807), 250 ft total length
          </span>
          <span
            className="text-[13px] leading-[19px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            1 item · 60 lbs · 13 × 13 × 5 in
          </span>
        </div>
      )
  }
}

function AddressRow({
  label,
  value,
  primary,
}: {
  label: string
  value: string
  primary?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <DotsSixVertical
        size={14}
        style={{ color: 'var(--color-icon-tertiary)', marginTop: 4 }}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px] leading-[19px]"
          style={{
            color: primary
              ? 'var(--color-text-primary)'
              : 'var(--color-text-tertiary)',
            fontWeight: primary ? 600 : 400,
          }}
        >
          {label}
        </div>
        <div
          className="text-[13px] leading-[19px]"
          style={{
            color: primary
              ? 'var(--color-text-secondary)'
              : 'var(--color-text-tertiary)',
          }}
        >
          {value}
        </div>
      </div>
      {primary && (
        <button
          type="button"
          aria-label="Remove address"
          className="w-6 h-6 flex items-center justify-center"
          style={{ color: 'var(--color-icon-tertiary)' }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

function PrimaryCTA({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-8 px-4 rounded flex items-center text-[14px] leading-[20px] transition-opacity"
      style={{
        background: disabled
          ? 'var(--color-background-disabled)'
          : 'var(--color-background-brand-primary)',
        color: disabled
          ? 'var(--color-text-disabled)'
          : 'var(--color-text-brand-button)',
        fontWeight: 500,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}
