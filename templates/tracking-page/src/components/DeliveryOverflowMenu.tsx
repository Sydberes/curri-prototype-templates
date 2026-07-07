import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  DotsThree,
  UploadSimple,
  PencilSimple,
  Clock,
  X,
  LinkSimple,
  Check,
  ChatTeardropDots,
} from '@phosphor-icons/react'

export type ActionsVariant = 'booker' | 'receiver' | 'booker-leg'

type MenuItem = {
  icon: React.ElementType
  label: string
  onClick?: () => void
  danger?: boolean
}

/**
 * The delivery actions collapsed into a single `⋯` menu. Used on narrow
 * breakpoints where the labeled toolbar buttons don't fit — same actions,
 * same persona rules, just folded away.
 */
export function DeliveryOverflowMenu({
  variant,
  shareUrl,
}: {
  variant: ActionsVariant
  shareUrl: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    if (shareUrl) navigator.clipboard?.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  let items: MenuItem[]
  if (variant === 'receiver') {
    items = [{ icon: ChatTeardropDots, label: 'Chat with us' }]
  } else if (variant === 'booker-leg') {
    items = [
      {
        icon: copied ? Check : LinkSimple,
        label: copied ? 'Link copied' : 'Copy tracking link',
        onClick: copyLink,
      },
      { icon: ChatTeardropDots, label: 'Chat with us' },
    ]
  } else {
    items = [
      { icon: UploadSimple, label: 'Share tracking' },
      { icon: PencilSimple, label: 'Edit details' },
      { icon: Clock, label: 'Reschedule' },
      { icon: X, label: 'Cancel delivery', danger: true },
      { icon: ChatTeardropDots, label: 'Chat with us' },
    ]
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="More actions"
        aria-expanded={open}
        className="tp-action-btn tp-action-ghost w-8 h-8 flex items-center justify-center"
        style={{
          borderRadius: 'var(--radius-xs)',
          border: '0.5px solid var(--color-border-primary)',
          color: 'var(--color-text-secondary)',
          boxShadow: 'var(--shadow-elevation-element)',
        }}
      >
        <DotsThree size={18} weight="bold" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: 1100 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute right-0 flex flex-col py-1"
              style={{
                top: 'calc(100% + 6px)',
                minWidth: 200,
                background: 'var(--color-elevation-surface-overlay)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-elevation-overflow)',
                zIndex: 1101,
              }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.onClick?.()
                    if (!item.onClick) setOpen(false)
                  }}
                  className="flex items-center gap-3 h-10 px-3 text-left tp-menu-item"
                  style={{
                    color: item.danger
                      ? 'var(--color-text-danger)'
                      : 'var(--color-text-primary)',
                    fontSize: 14,
                    lineHeight: '18px',
                    fontWeight: 500,
                  }}
                >
                  <item.icon
                    size={16}
                    style={{
                      color: item.danger
                        ? 'var(--color-icon-danger)'
                        : 'var(--color-icon-secondary)',
                    }}
                  />
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
