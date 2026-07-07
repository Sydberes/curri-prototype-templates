import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretDown, Copy } from '@phosphor-icons/react'
import type { Stop } from '../data/stops'

type Props = {
  stops: Stop[]
  /** Recipient view: hide route-wide price/stop count; relabel booker as the sender. */
  singleLeg?: boolean
}

export function DeliveryDetailsCard({ stops, singleLeg = false }: Props) {
  const [open, setOpen] = useState(false)
  const dropoffs = stops.filter((s) => s.kind === 'dropoff').length
  const timing = singleLeg
    ? 'Rush'
    : `Rush · ${dropoffs} stop${dropoffs === 1 ? '' : 's'}`
  const summary = singleLeg ? `Box Truck · Rush` : `Box Truck · Rush · $248.50`
  return (
    <div className="flex flex-col items-start w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between gap-3 w-full py-1 text-left"
      >
        <div className="flex flex-col min-w-0">
          <SectionTitle>Delivery details</SectionTitle>
          {!open && (
            <span
              className="text-[12px] truncate"
              style={{
                color: 'var(--color-text-tertiary)',
                lineHeight: '18px',
                fontWeight: 500,
              }}
            >
              {summary}
            </span>
          )}
        </div>
        <CaretDown
          size={12}
          style={{
            color: 'var(--color-icon-tertiary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 180ms cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="overflow-hidden w-full"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <DeliveryFields timing={timing} singleLeg={singleLeg} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DeliveryFields({
  timing,
  singleLeg,
}: {
  timing: string
  singleLeg?: boolean
}) {
  return (
    <div
      className="w-full rounded-md overflow-hidden mt-2"
      style={{
        background: 'var(--color-elevation-surface-raised)',
        border: '0.5px solid var(--color-border-primary)',
      }}
    >
      <Field label="ID">
        <span
          className="text-[13px] flex items-center gap-2"
          style={{
            color: 'var(--color-text-primary)',
            lineHeight: '20px',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          del_CWE4ZA78U#
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded-[2px]"
            style={{ color: 'var(--color-icon-tertiary)' }}
            aria-label="Copy delivery ID"
          >
            <Copy size={12} />
          </button>
        </span>
      </Field>
      <Field label="Vehicle">
        <Value>Box Truck</Value>
      </Field>
      <Field label="Timing">
        <Value>{timing}</Value>
      </Field>
      {!singleLeg && (
        <>
          <Field label="Booked">
            <Value>11:08 AM · Thu Mar 26</Value>
          </Field>
          <Field label="Assigned">
            <Value>11:14 AM</Value>
          </Field>
        </>
      )}
      <Field label={singleLeg ? 'From' : 'Booker'} last={singleLeg}>
        <PersonRow
          name="Brian H. · Acme Industrial"
          avatarInitials="BH"
          avatarBg="var(--color-background-brand-primary)"
        />
      </Field>
      {!singleLeg && (
        <Field label="Price" last>
          <Value>$248.50</Value>
        </Field>
      )}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        color: 'var(--color-text-primary)',
        fontSize: 'var(--tp-title-size, 14px)',
        lineHeight: '21px',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}

function Field({
  label,
  children,
  last,
}: {
  label: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: 40,
        borderBottom: last
          ? 'none'
          : '0.5px solid var(--color-border-primary)',
      }}
    >
      <span
        className="text-[11px] shrink-0"
        style={{
          color: 'var(--color-text-tertiary)',
          fontWeight: 500,
          width: 64,
          lineHeight: '14px',
        }}
      >
        {label}
      </span>
      <div className="flex-1 min-w-0 flex items-center justify-end">
        {children}
      </div>
    </div>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[13px]"
      style={{
        color: 'var(--color-text-primary)',
        lineHeight: '20px',
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  )
}

function PersonRow({
  name,
  sub,
  avatarSrc,
  avatarInitials,
  avatarBg,
  badge,
  badgeBg,
  action,
}: {
  name: string
  sub?: string
  avatarSrc?: string
  avatarInitials?: string
  avatarBg?: string
  badge?: React.ReactNode
  badgeBg?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 justify-end min-w-0">
      <div className="flex flex-col items-end min-w-0">
        <span
          className="text-[13px] truncate"
          style={{
            color: 'var(--color-text-primary)',
            lineHeight: '18px',
            fontWeight: 500,
          }}
        >
          {name}
        </span>
        {sub && (
          <span
            className="text-[10px] truncate"
            style={{
              color: 'var(--color-text-tertiary)',
              lineHeight: '14px',
              fontWeight: 400,
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div className="relative shrink-0" style={{ width: 22, height: 22 }}>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: avatarBg,
              color: 'var(--color-text-brand-button)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}
          >
            {avatarInitials}
          </div>
        )}
        {badge && (
          <span
            className="absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center"
            style={{
              width: 12,
              height: 12,
              background: badgeBg,
              boxShadow: '0 0 0 1.5px var(--color-elevation-surface-raised)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  )
}

