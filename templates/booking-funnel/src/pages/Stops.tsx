import { useEffect, useRef, useState } from 'react'
import {
  ArrowCounterClockwise,
  NotePencil,
  UploadSimple,
  Crosshair,
  CaretLeft,
  DeviceMobile,
} from '@phosphor-icons/react'
import { CoreIntelligenceIcon } from '../components/CoreIntelligence'
import { ScanModal } from '../components/ScanModal'
import { ImportDetailsModal } from '../components/ImportDetailsModal'

type Stop = { id: number; value: string; aiFilled?: boolean }

type Phase = 'idle' | 'filled'

type ImportStart = 'intake' | 'running'

type Variant = 'cards' | 'dropzone' | 'badge'

const VARIANT_STORAGE_KEY = 'aiBooking.variant'

const SAMPLE_FILL: Pick<Stop, 'value'>[] = [
  { value: '805 Nw 42nd St, Seattle, WA 98107' },
  { value: '5202 N Florida St, Spokane, WA 99217' },
]

export function Stops({ onNext }: { onNext: () => void; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [stops, setStops] = useState<Stop[]>([
    { id: 1, value: '' },
    { id: 2, value: '' },
  ])
  const [scanOpen, setScanOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importStart, setImportStart] = useState<ImportStart>('intake')
  const [importFileName, setImportFileName] = useState('ship-ticket 111.pdf')
  const [variant, setVariantState] = useState<Variant>(() => {
    if (typeof window === 'undefined') return 'cards'
    const stored = window.localStorage.getItem(VARIANT_STORAGE_KEY)
    return (stored as Variant) || 'cards'
  })
  const setVariant = (v: Variant) => {
    setVariantState(v)
    window.localStorage.setItem(VARIANT_STORAGE_KEY, v)
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  const anyStopFilled = stops.some((s) => s.value.length > 0)

  const openImport = (start: ImportStart, file?: string) => {
    if (file) setImportFileName(file)
    setImportStart(start)
    setImportOpen(true)
  }

  // Drag/drop UI lives in App.tsx (so the overlay can be scoped to the primary
  // surface). When a file is dropped, App fires `ci:document-dropped` and we
  // open the Import modal with the file name from the event.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ fileName: string }>).detail
      openImport('intake', detail?.fileName ?? 'ship-ticket 111.pdf')
    }
    window.addEventListener('ci:document-dropped', handler)
    return () => window.removeEventListener('ci:document-dropped', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAutoFill = () => {
    setStops(
      SAMPLE_FILL.map((entry, i) => ({
        id: i + 1,
        value: entry.value,
        aiFilled: true,
      })),
    )
    setPhase('filled')
    setImportOpen(false)
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ci:auto-filled'))
    }, 200)
  }

  const resetAll = () => {
    setStops([
      { id: 1, value: '' },
      { id: 2, value: '' },
    ])
    setPhase('idle')
    window.dispatchEvent(new CustomEvent('ci:reset'))
  }

  const update = (id: number, value: string) =>
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value, aiFilled: false } : s)),
    )

  const addStop = () =>
    setStops((prev) => [
      ...prev,
      { id: (prev.at(-1)?.id ?? 0) + 1, value: '' },
    ])

  return (
    <div className="relative h-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.heic"
        onChange={(e) => {
          const name = e.target.files?.[0]?.name ?? 'ship-ticket 111.pdf'
          openImport('intake', name)
          e.target.value = ''
        }}
      />

      <div className="h-full overflow-y-auto px-6 pt-6 pb-24">
        <header className="flex items-center justify-between mb-6">
          <h1
            className="text-[24px] leading-[30px] tracking-[-0.48px]"
            style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Stops
          </h1>
          <div className="flex items-center gap-1">
            <ChipButton
              icon={<ArrowCounterClockwise size={12} weight="regular" />}
              onClick={resetAll}
            >
              Restart
            </ChipButton>
            <ChipButton icon={<NotePencil size={12} />}>Save draft</ChipButton>
            <ChipButton>
              <UploadSimple size={12} />
            </ChipButton>
          </div>
        </header>

        <StopList stops={stops} onChange={update} onAdd={addStop} />

        {phase !== 'filled' && variant === 'cards' && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <ChoiceCard
              title="Upload a file"
              subtitle="Invoice, PO, or shipping doc"
              onClick={() => fileInputRef.current?.click()}
              kind="upload"
            />
            <ChoiceCard
              title="Scan a document"
              subtitle="Use your phone camera"
              onClick={() => setScanOpen(true)}
              kind="scan"
            />
          </div>
        )}

        {phase !== 'filled' && variant === 'dropzone' && !anyStopFilled && (
          <EmptyStateDropzone
            onBrowse={() => fileInputRef.current?.click()}
            onScan={() => setScanOpen(true)}
          />
        )}
      </div>

      {phase !== 'filled' && variant === 'badge' && (
        <CIBadge
          onBrowse={() => fileInputRef.current?.click()}
          onScan={() => setScanOpen(true)}
        />
      )}

      <BottomInfo onNext={onNext} ready={phase === 'filled'} />

      <ScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onCaptured={() => {
          setScanOpen(false)
          openImport('running', 'phone-capture.heic')
        }}
      />

      <ImportDetailsModal
        open={importOpen}
        startPhase={importStart}
        fileName={importFileName}
        onClose={() => setImportOpen(false)}
        onAutoFill={handleAutoFill}
      />

      <VariantSwitcher value={variant} onChange={setVariant} />
    </div>
  )
}

function EmptyStateDropzone({
  onBrowse,
  onScan,
}: {
  onBrowse: () => void
  onScan: () => void
}) {
  return (
    <div
      className="group mt-6 flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed transition-colors duration-200 cursor-pointer
        border-[color:var(--color-border-bold)]
        bg-[color:var(--color-background-neutral-primary)]
        hover:border-[color:var(--color-icon-primary)]
        hover:bg-[color:var(--color-background-neutral-primary-hover)]"
      style={{ animation: 'ai-fade-in 200ms ease-out both' }}
      onClick={onBrowse}
    >
      <span
        className="inline-flex group-hover:[animation:pulse-once_1200ms_ease-in-out_1]"
        style={{ color: 'var(--color-icon-primary)' }}
      >
        <CoreIntelligenceIcon size={20} />
      </span>
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-[13px] leading-[19px]"
          style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
        >
          Drop a document or <span className="underline">browse</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onScan()
          }}
          className="text-[12px] leading-[16px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          or <span className="underline">scan from your phone</span>
        </button>
      </div>
    </div>
  )
}

function CIBadge({
  onBrowse,
  onScan,
}: {
  onBrowse: () => void
  onScan: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="absolute bottom-20 right-4 z-10 flex flex-col items-end gap-2">
      {open && (
        <div
          className="rounded-lg overflow-hidden flex flex-col py-2"
          style={{
            width: 172,
            background: 'var(--color-elevation-surface-overlay)',
            boxShadow: 'var(--shadow-elevation-overlay)',
            animation: 'ai-fade-in 160ms ease-out both',
          }}
        >
          <div className="px-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onBrowse()
              }}
              className="w-full flex items-center gap-2 p-2 rounded text-left transition-colors hover:bg-[var(--color-background-neutral-primary-hover)]"
            >
              <UploadSimple
                size={12}
                style={{ color: 'var(--color-icon-secondary)' }}
              />
              <span
                className="text-[12px] leading-[20px]"
                style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
              >
                Upload a file
              </span>
            </button>
          </div>
          <div className="px-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onScan()
              }}
              className="w-full flex items-center gap-2 p-2 rounded text-left transition-colors hover:bg-[var(--color-background-neutral-primary-hover)]"
            >
              <DeviceMobile
                size={12}
                style={{ color: 'var(--color-icon-secondary)' }}
              />
              <span
                className="text-[12px] leading-[20px]"
                style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
              >
                Scan from phone
              </span>
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Smart fill"
        className="relative w-10 h-10 rounded-full flex items-center justify-center border active:scale-[0.97]"
        style={{
          background: 'var(--color-elevation-surface-overlay)',
          borderColor: 'var(--color-border-primary)',
          boxShadow: 'var(--shadow-elevation-overlay)',
          color: 'var(--color-icon-primary)',
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span
          className="inline-flex"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 480ms cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: '50% 50%',
          }}
        >
          <CoreIntelligenceIcon size={18} />
        </span>
      </button>
    </div>
  )
}

function VariantSwitcher({
  value,
  onChange,
}: {
  value: Variant
  onChange: (v: Variant) => void
}) {
  const options: { key: Variant; label: string }[] = [
    { key: 'cards', label: 'Cards' },
    { key: 'dropzone', label: 'Dropzone' },
    { key: 'badge', label: 'Badge' },
  ]
  return (
    <div
      className="fixed z-50 flex items-center gap-1 p-1 rounded-lg border"
      style={{
        top: 70,
        right: 20,
        background: 'var(--color-elevation-surface-overlay)',
        borderColor: 'var(--color-border-primary)',
        boxShadow: 'var(--shadow-elevation-overlay)',
      }}
    >
      <span
        className="px-2 text-[10px] tracking-[0.06em] uppercase"
        style={{ color: 'var(--color-text-tertiary)', fontWeight: 600 }}
      >
        Variant
      </span>
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className="px-2 h-6 rounded text-[12px] leading-[16px] transition-colors"
          style={{
            background:
              value === opt.key
                ? 'var(--color-background-neutral-bold)'
                : 'transparent',
            color:
              value === opt.key
                ? 'var(--color-text-primary-inverse)'
                : 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function StopList({
  stops,
  onChange,
  onAdd,
}: {
  stops: Stop[]
  onChange: (id: number, value: string) => void
  onAdd: () => void
}) {
  return (
    <div className="relative flex">
      <div className="relative flex flex-col items-center" style={{ width: 16 }}>
        {stops.map((stop, i) => (
          <div key={stop.id} className="flex flex-col items-center">
            {i > 0 && <Connector />}
            <NumberBadge>{i + 1}</NumberBadge>
          </div>
        ))}
        <Connector />
        <button
          type="button"
          onClick={onAdd}
          className="w-4 h-4 rounded flex items-center justify-center text-[14px] leading-none"
          style={{
            background: 'var(--color-background-neutral-bold)',
            color: 'var(--color-text-primary-inverse)',
          }}
          aria-label="Add stop"
        >
          +
        </button>
      </div>

      <div className="flex-1 ml-3 flex flex-col gap-3">
        {stops.map((stop, i) => (
          <StopRow
            key={stop.id}
            value={stop.value}
            placeholder={i === 0 ? 'Enter origin' : 'Enter destination'}
            onChange={(v) => onChange(stop.id, v)}
          />
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="self-start py-1 text-[12px] leading-[20px] text-left"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        >
          Add stop
        </button>
      </div>
    </div>
  )
}

function NumberBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="w-4 h-4 rounded flex items-center justify-center text-[11px] leading-[14px] uppercase"
      style={{
        background: 'var(--color-background-neutral-bold)',
        color: 'var(--color-text-primary-inverse)',
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </span>
  )
}

function Connector() {
  return (
    <div
      className="my-1.5"
      style={{
        width: 0,
        height: 18,
        borderLeft: '1px dashed var(--color-border-bold)',
      }}
    />
  )
}

function StopRow({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 flex items-center rounded h-9 px-2 border gap-2"
        style={{
          background: 'var(--color-background-input)',
          borderColor: 'var(--color-border-bold)',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[14px] leading-[20px]"
          style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
        />
      </div>
      <button
        type="button"
        aria-label="Use current location"
        className="w-7 h-7 flex items-center justify-center rounded"
        style={{ color: 'var(--color-icon-secondary)' }}
      >
        <Crosshair size={16} />
      </button>
    </div>
  )
}

function ChoiceCard({
  title,
  subtitle,
  onClick,
  kind,
}: {
  title: string
  subtitle: string
  onClick?: () => void
  kind: 'upload' | 'scan'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 p-3 rounded border text-left transition-colors duration-200
        bg-[color:var(--color-elevation-surface-raised)]
        border-[color:var(--color-border-primary)]
        hover:bg-[color:var(--color-elevation-surface-raised-hover)]"
    >
      <span
        className="relative w-9 h-9 shrink-0 flex items-center justify-center rounded"
        style={{
          background: 'var(--color-elevation-surface-base-hover)',
          color: 'var(--color-icon-primary)',
        }}
      >
        <CoreIntelligenceIcon size={14} />
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--color-elevation-surface-raised)',
            border: '0.5px solid var(--color-border-primary)',
            color: 'var(--color-icon-secondary)',
          }}
        >
          {kind === 'upload' ? (
            <UploadSimple size={12} weight="bold" />
          ) : (
            <DeviceMobile size={12} weight="bold" />
          )}
        </span>
      </span>
      <div className="min-w-0">
        <div
          className="text-[12px] leading-[15px]"
          style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
        >
          {title}
        </div>
        <div
          className="text-[12px] leading-[15px] truncate"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  )
}

function BottomInfo({
  onNext,
  ready,
}: {
  onNext: () => void
  ready: boolean
}) {
  return (
    <div className="absolute bottom-3 left-6 right-6 pointer-events-none">
      <div
        className="pointer-events-auto h-[53px] rounded flex items-center px-4 gap-4 border"
        style={{
          background: 'var(--color-elevation-surface-overlay)',
          borderColor: 'var(--color-border-primary)',
          boxShadow: 'var(--shadow-elevation-overlay)',
        }}
      >
        <button
          type="button"
          aria-label="Back"
          className="w-7 h-7 flex items-center justify-center rounded"
          style={{ color: 'var(--color-icon-secondary)' }}
        >
          <CaretLeft size={14} />
        </button>
        <div className="flex-1 flex items-center gap-5 min-w-0">
          <Stat label="Distance" value={ready ? '14.2 mi' : '—'} />
          <Stat label="Vehicle" value={ready ? 'Cargo Van' : '—'} />
          <Stat label="Timing" value={ready ? 'Today, 2 PM' : '—'} />
          <Stat label="Est. total" value={ready ? '$182' : '—'} />
        </div>
        <button
          type="button"
          onClick={onNext}
          className="h-7 px-4 rounded text-[14px] leading-[20px]"
          style={{
            background: 'var(--color-background-brand-primary)',
            color: 'var(--color-text-brand-button)',
            fontWeight: 500,
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5 items-start whitespace-nowrap">
      <span
        className="text-[9px] leading-[13px] tracking-[0.02em] uppercase"
        style={{ color: 'var(--color-text-tertiary)', fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        className="text-[13px] leading-[16px]"
        style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
      >
        {value}
      </span>
    </div>
  )
}

function ChipButton({
  icon,
  children,
  onClick,
}: {
  icon?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
}) {
  const isIconOnly = !children
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-6 flex items-center justify-center gap-1 rounded border text-[12px] leading-[20px]"
      style={{
        padding: isIconOnly ? '0 6px' : '0 8px',
        background: 'var(--color-background-neutral-primary)',
        borderColor: 'var(--color-border-primary)',
        color: 'var(--color-text-primary)',
        fontWeight: 500,
        boxShadow: 'var(--shadow-elevation-element)',
      }}
    >
      {icon}
      {children}
    </button>
  )
}

