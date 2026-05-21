import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CoreIntelligenceIcon, ResponseRating } from './CoreIntelligence'

const AUTO_DISMISS_MS = 6000

export function FilledSnackbar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(onClose, AUTO_DISMISS_MS)
    return () => window.clearTimeout(t)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <motion.div
            key="filled-snackbar"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{
              y: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            }}
            className="pointer-events-auto flex items-center gap-8 rounded-lg px-5 py-2 box-border"
            style={{
              minWidth: 400,
              maxWidth: 488,
              background: 'var(--color-background-neutral-bold)',
              boxShadow: 'var(--shadow-elevation-overlay)',
            }}
            role="status"
            aria-live="polite"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className="shrink-0 inline-flex"
                style={{ color: 'var(--color-icon-inverse)' }}
              >
                <CoreIntelligenceIcon size={16} />
              </span>
              <span
                className="truncate text-[14px] leading-[21px]"
                style={{
                  color: 'var(--color-text-primary-inverse)',
                  fontWeight: 500,
                }}
              >
                Filled by Core Intelligence
              </span>
            </div>

            <ResponseRating
              inverse
              onRate={(r) => {
                if (r) window.setTimeout(onClose, 900)
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
