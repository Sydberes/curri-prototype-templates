import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react'
import { LogoPulse, LoadingText } from './CoreIntelligence'

type Phase = 'waiting' | 'captured'

export function ScanModal({
  open,
  onClose,
  onCaptured,
}: {
  open: boolean
  onClose: () => void
  onCaptured: () => void
}) {
  const [phase, setPhase] = useState<Phase>('waiting')

  useEffect(() => {
    if (!open) setPhase('waiting')
  }, [open])

  if (!open) return null

  const simulateCapture = () => {
    setPhase('captured')
    window.setTimeout(onCaptured, 900)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'var(--color-blanket-blanket)' }}
      onClick={onClose}
    >
      <div
        className="relative w-[360px] rounded-lg border overflow-hidden"
        style={{
          background: 'var(--color-elevation-surface-overlay)',
          borderColor: 'var(--color-border-primary)',
          boxShadow: 'var(--shadow-elevation-overlay)',
          animation: 'ai-fade-in 200ms ease-out both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="h-12 px-5 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--color-border-primary)' }}
        >
          <h2
            className="text-[14px] leading-[21px]"
            style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
          >
            Scan a document
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-6 h-6 -mr-1 flex items-center justify-center rounded"
            style={{ color: 'var(--color-icon-secondary)' }}
          >
            <X size={14} />
          </button>
        </header>

        <div className="px-5 pt-6 pb-6">
          {phase === 'waiting' ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={simulateCapture}
                aria-label="Simulate phone capture"
                className="rounded transition-opacity duration-200 hover:opacity-75 active:opacity-60 cursor-pointer"
              >
                <QRCode />
              </button>

              <p
                className="mt-6 text-[13px] leading-[19px] text-center text-balance"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Take a photo of your shipping doc on your phone, it will sync
                to this booking automatically.
              </p>
            </div>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center gap-6">
              <LogoPulse size={36} />
              <LoadingText label="Photo received — handing off" size={13} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QRCode() {
  // Faux QR pattern — deterministic, decorative.
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21
    const y = Math.floor(i / 21)
    const inMarker =
      (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    if (inMarker) {
      const lx = x > 13 ? x - 14 : x
      const ly = y > 13 ? y - 14 : y
      const edge = lx === 0 || lx === 6 || ly === 0 || ly === 6
      const center = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
      return edge || center
    }
    return ((x * 31 + y * 17 + x * y) % 7) < 3
  })
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: 'repeat(21, 7px)',
        gridAutoRows: '7px',
        width: 147,
      }}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          style={{
            background: on
              ? 'var(--color-background-neutral-bold)'
              : 'transparent',
          }}
        />
      ))}
    </div>
  )
}
