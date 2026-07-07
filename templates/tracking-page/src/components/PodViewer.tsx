import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { CaretLeft, CaretRight, X, DownloadSimple } from '@phosphor-icons/react'
import type { Pod, Stop } from '../data/stops'

type Props = {
  open: boolean
  stop: Stop | null
  pods: Pod[]
  index: number
  onClose: () => void
  onIndexChange: (i: number) => void
}

export function PodViewer({
  open,
  stop,
  pods,
  index,
  onClose,
  onIndexChange,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight')
        onIndexChange(Math.min(index + 1, pods.length - 1))
      if (e.key === 'ArrowLeft') onIndexChange(Math.max(index - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, pods.length, onClose, onIndexChange])

  return (
    <AnimatePresence>
      {open && stop && pods[index] && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            background: 'hsla(0, 0%, 11%, 0.82)',
            zIndex: 9999,
          }}
          onClick={onClose}
        >
          <motion.div
            className="relative inline-flex flex-col items-stretch"
            style={{ maxHeight: '86vh' }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header stop={stop} pod={pods[index]} index={index} total={pods.length} onClose={onClose} />

            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => onIndexChange(Math.max(index - 1, 0))}
                disabled={index === 0}
                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30"
                style={{
                  left: -56,
                  background: 'var(--color-elevation-surface-raised)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 2,
                }}
                aria-label="Previous photo"
              >
                <CaretLeft
                  size={20}
                  style={{ color: 'var(--color-icon-primary)' }}
                />
              </button>

              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={pods[index].src}
                  src={pods[index].src}
                  alt={pods[index].label}
                  className="rounded-lg block"
                  style={{
                    maxHeight: '68vh',
                    maxWidth: '88vw',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                  }}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </AnimatePresence>

              <button
                type="button"
                onClick={() =>
                  onIndexChange(Math.min(index + 1, pods.length - 1))
                }
                disabled={index === pods.length - 1}
                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30"
                style={{
                  right: -56,
                  background: 'var(--color-elevation-surface-raised)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 2,
                }}
                aria-label="Next photo"
              >
                <CaretRight
                  size={20}
                  style={{ color: 'var(--color-icon-primary)' }}
                />
              </button>
            </div>

            <Thumbs pods={pods} index={index} onSelect={onIndexChange} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Header({
  stop,
  pod,
  index,
  total,
  onClose,
}: {
  stop: Stop
  pod: Pod
  index: number
  total: number
  onClose: () => void
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div className="flex flex-col min-w-0">
        <span
          className="text-[12px] truncate"
          style={{
            color: 'rgba(252, 252, 252, 0.6)',
            lineHeight: '18px',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {stop.order} ·{' '}
          {stop.kind === 'pickup' ? 'Pickup' : `Stop ${stop.index}`} ·{' '}
          {pod.label}
        </span>
        <span
          style={{
            color: 'var(--color-text-primary-inverse)',
            fontSize: 'var(--text-heading-small, 16px)',
            lineHeight: 'var(--leading-heading-small, 20px)',
            fontWeight: 'var(--font-weight-heading-semi-bold, 600)',
          }}
        >
          {stop.name}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-[12px] mr-1"
          style={{
            color: 'rgba(252, 252, 252, 0.7)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
            lineHeight: '18px',
          }}
        >
          {index + 1} of {total}
        </span>
        <ScrimButton icon={DownloadSimple} label="Download photo" />
        <ScrimButton icon={X} label="Close" onClick={onClose} />
      </div>
    </div>
  )
}

function ScrimButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-7 h-7 rounded-[4px] flex items-center justify-center"
      style={{
        background: 'rgba(252, 252, 252, 0.12)',
        color: 'var(--color-text-primary-inverse)',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

function Thumbs({
  pods,
  index,
  onSelect,
}: {
  pods: Pod[]
  index: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {pods.map((pod, i) => (
        <button
          key={pod.src}
          type="button"
          onClick={() => onSelect(i)}
          className="w-14 h-14 rounded-md overflow-hidden transition-all"
          style={{
            border:
              i === index
                ? '2px solid #fff'
                : '2px solid rgba(255,255,255,0.2)',
            opacity: i === index ? 1 : 0.7,
          }}
        >
          <img
            src={pod.src}
            alt={pod.label}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  )
}
