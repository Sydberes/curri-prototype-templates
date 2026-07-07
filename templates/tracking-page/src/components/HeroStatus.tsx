import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Stop } from '../data/stops'

type Props = {
  stops: Stop[]
  phase?: 'pre-driver' | 'in-progress' | 'complete' | 'rated'
  delayMin?: number | null
  /** Recipient view: copy reframes the active dropoff as "you", drops route-wide counts. */
  singleLeg?: boolean
}

type EtaPart = { label?: string; value: string }

export function HeroStatus({
  stops,
  phase = 'in-progress',
  delayMin = null,
  singleLeg = false,
}: Props) {
  const arrived = stops.find((s) => s.status === 'arrived')
  const enRoute = stops.find((s) => s.status === 'en-route')
  const deliveredCount = stops.filter((s) => s.status === 'delivered').length
  const cancelledCount = stops.filter((s) => s.status === 'cancelled').length
  // Receiver view: the leg's own dropoff (last node) was pulled from the route.
  const legCancelled =
    singleLeg && stops[stops.length - 1]?.status === 'cancelled'

  let headline: string
  const parts: EtaPart[] = []
  let pillState: PillState = 'on-time'

  if (legCancelled) {
    headline = 'Delivery canceled'
    parts.push({ value: 'This stop was removed from the route' })
    pillState = 'none'
  } else if (phase === 'complete' || phase === 'rated') {
    headline = 'Delivery complete'
    parts.push({
      value: singleLeg
        ? 'Delivered to you'
        : `${deliveredCount} stops delivered`,
    })
    if (!singleLeg && cancelledCount > 0) {
      parts.push({ value: `${cancelledCount} canceled` })
    }
    parts.push({ label: 'Driver', value: 'Demetrius J.' })
    pillState = 'none'
  } else if (phase === 'pre-driver') {
    headline = 'Connecting to a driver'
    parts.push({ label: 'Searching', value: '5 min' })
    pillState = 'on-time'
  } else if (arrived) {
    if (arrived.kind === 'pickup') {
      headline = singleLeg
        ? 'Loading your order'
        : `Loading at ${shortName(arrived.name)}`
    } else {
      headline = singleLeg
        ? 'Your driver has arrived'
        : `Arrived at ${shortName(arrived.name)}`
    }
    parts.push({ label: 'Now', value: arrived.eta })
    const next = nextStop(stops)
    if (next && !singleLeg) parts.push({ label: 'Next ETA', value: next.eta })
  } else if (enRoute) {
    if (enRoute.kind === 'pickup') {
      headline = singleLeg
        ? 'Picking up your order'
        : `Heading to pickup at ${shortName(enRoute.name)}`
    } else {
      headline = singleLeg
        ? 'On the way to you'
        : `Heading to ${shortName(enRoute.name)}`
    }
    parts.push({ label: 'ETA', value: enRoute.eta })
  } else {
    headline = 'Connecting to a driver'
    parts.push({ label: 'Searching', value: '5 min' })
    pillState = 'on-time'
  }

  const isSearching = phase === 'pre-driver'

  if (delayMin && delayMin > 0 && pillState === 'on-time') {
    pillState = 'late'
  }

  return (
    <div className="flex items-start justify-between gap-3 w-full">
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <AnimatedHeadline text={headline} />

        <EtaLine
          pillState={pillState}
          delayMin={delayMin}
          parts={parts}
          searching={isSearching}
        />
      </div>
    </div>
  )
}

function AnimatedHeadline({ text }: { text: string }) {
  return (
    <h1
      style={{
        color: 'var(--color-text-primary)',
        fontSize: 'var(--tp-hero-size, 20px)',
        lineHeight: 'var(--tp-hero-line, 28px)',
        fontWeight: 'var(--font-weight-heading-semi-bold, 600)',
        textWrap: 'pretty',
        margin: 0,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ display: 'inline-block' }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </h1>
  )
}

type PillState = 'on-time' | 'late' | 'none'

function EtaLine({
  pillState,
  delayMin,
  parts,
  searching,
}: {
  pillState: PillState
  delayMin: number | null
  parts: EtaPart[]
  searching?: boolean
}) {
  return (
    <div
      className="flex items-center flex-wrap"
      style={{
        fontSize: 'var(--tp-body-size, var(--text-body-medium, 12px))',
        lineHeight: 'var(--tp-body-line, var(--leading-body-medium, 16px))',
        fontWeight: 'var(--font-weight-medium, 500)',
      }}
    >
      {searching && (
        <span className="inline-flex items-center mr-2">
          <span className="tp-status-dot" aria-label="Live" />
        </span>
      )}
      {!searching && pillState === 'on-time' && (
        <span
          className="inline-flex items-center h-5 px-2 rounded-full mr-2"
          style={{
            background: 'var(--color-background-accent-hivis-subtle)',
            color: 'var(--color-icon-accent-hivis)',
          }}
        >
          On time
        </span>
      )}
      {!searching && pillState === 'late' && (
        <span
          className="inline-flex items-center h-5 px-2 rounded-full mr-2"
          style={{
            background: 'var(--color-background-system-warning)',
            color: 'var(--color-text-warning)',
          }}
        >
          {delayMin} min late
        </span>
      )}
      {parts.map((part, i) => (
        <Fragment key={`${part.label ?? ''}-${part.value}-${i}`}>
          {i > 0 && <Dot />}
          {part.label && (
            <span
              style={{
                color: 'var(--color-text-tertiary)',
                marginRight: 4,
              }}
            >
              {part.label}
            </span>
          )}
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {part.value}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

function Dot() {
  return (
    <span
      aria-hidden
      style={{
        color: 'var(--color-text-tertiary)',
        margin: '0 4px',
      }}
    >
      ·
    </span>
  )
}

function shortName(name: string) {
  return name
}

function nextStop(stops: Stop[]) {
  return stops.find(
    (s) => s.status === 'en-route' || s.status === 'pending'
  )
}
