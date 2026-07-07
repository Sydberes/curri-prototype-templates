import { Phone, ChatCircle, Star } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

type Props = {
  assigned: boolean
  onMessage: () => void
  /** Recipients can see the driver but can't call/message them — support handles contact. */
  canContact?: boolean
}

export function DriverSection({ assigned, onMessage, canContact = true }: Props) {
  if (!assigned) return null
  return (
    <motion.div
      key="assigned"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex items-center gap-3 w-full"
    >
      <AvatarWithVehicle />
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-heading-small, 16px)',
              lineHeight: 'var(--leading-heading-small, 20px)',
              fontWeight: 'var(--font-weight-heading-semi-bold, 600)',
            }}
          >
            Demetrius J.
          </span>
          <span
            className="inline-flex items-center gap-0.5 shrink-0"
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-body-medium, 12px)',
              lineHeight: 'var(--leading-body-medium, 16px)',
              fontWeight: 'var(--font-weight-medium, 500)',
              fontVariantNumeric: 'tabular-nums',
            }}
            title="Average rating across 487 deliveries"
          >
            <Star
              weight="fill"
              size={11}
              style={{ color: 'var(--color-icon-warning)' }}
            />
            4.9
          </span>
        </div>
        <span
          className="truncate"
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--tp-body-size, var(--text-body-medium, 12px))',
            lineHeight: 'var(--tp-body-line, var(--leading-body-medium, 16px))',
            fontWeight: 'var(--font-weight-medium, 500)',
          }}
        >
          Ford Flex · Black · 7XCV221
        </span>
        <div className="flex items-center gap-1 mt-1">
          <AttributeBadge>On time</AttributeBadge>
          <AttributeBadge>Careful with cargo</AttributeBadge>
        </div>
      </div>
      {canContact && (
        <div className="flex items-center gap-1">
          <ActionButton icon={Phone} label="Call" href="tel:+13105477469" />
          <ActionButton icon={ChatCircle} label="Message" onClick={onMessage} />
        </div>
      )}
    </motion.div>
  )
}

function AttributeBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center shrink-0"
      style={{
        height: 18,
        padding: '0 8px',
        borderRadius: 16,
        background: 'var(--color-background-neutral-primary)',
        border: '0.5px solid var(--color-border-primary)',
        color: 'var(--color-text-secondary)',
        fontSize: 11,
        lineHeight: '14px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

function AvatarWithVehicle() {
  return (
    <div className="relative shrink-0" style={{ width: 56, height: 48 }}>
      <div
        className="rounded-full overflow-hidden"
        style={{
          width: 48,
          height: 48,
          background: 'var(--color-background-disabled)',
        }}
      >
        <img
          src="https://i.pravatar.cc/96?img=12"
          alt="Driver"
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          right: 0,
          bottom: 0,
          width: 22,
          height: 22,
          background: 'var(--color-elevation-surface-raised)',
          boxShadow: '0 0 0 2px var(--color-elevation-surface-primary)',
        }}
        title="Box Truck"
      >
        <img
          src="https://loremflickr.com/96/96/box-truck,delivery?lock=24"
          alt="Box Truck"
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
}) {
  const Tag = (href ? 'a' : 'button') as 'a' | 'button'
  return (
    <Tag
      {...(href
        ? { href, onClick }
        : { type: 'button' as const, onClick })}
      className="tp-action-btn tp-action-ghost h-7 px-2.5 rounded-[4px] inline-flex items-center gap-1 text-[12px]"
      style={{
        border: '0.5px solid var(--color-border-primary)',
        color: 'var(--color-text-primary)',
        fontWeight: 500,
        lineHeight: '18px',
        boxShadow: '0 0.5px 1px rgba(0,0,0,0.1)',
        textDecoration: 'none',
      }}
    >
      <Icon size={14} />
      {label}
    </Tag>
  )
}
