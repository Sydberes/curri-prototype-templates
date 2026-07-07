import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  animate,
  type PanInfo,
} from 'framer-motion'
import { HeroStatus } from './HeroStatus'
import { DriverSection } from './DriverSection'
import { StopsSection } from './StopsSection'
import { DeliveryDetailsCard } from './DeliveryDetailsCard'
import { RatingPanel } from './RatingPanel'
import { RouteMap } from './RouteMap'
import type { Stop } from '../data/stops'
import type { Phase } from '../App'

type SnapPoint = 'peek' | 'half' | 'full'

type Props = {
  /** Stops scoped to the active view (full route or single leg). */
  viewStops: Stop[]
  /** The full route's stops — delivery details summarize the whole booking. */
  fullStops: Stop[]
  viewPhase: Phase
  viewDelay: number | null
  isLegView: boolean
  driverAssigned: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  onOpenPods: (stopId: string, index: number) => void
  onOpenOrder?: (order: string) => void
  /** complete/rated + this persona owns the rating → show the rating form. */
  showRating: boolean
  driverName: string
  driverAvatarSrc: string
  onRatingSubmit: (stars: number, comment: string) => void
  ratingSubmitted: boolean
  submittedRating?: number
  onMessage: () => void
  canContact: boolean
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

/**
 * Mobile content region: the map fills the card body and a draggable sheet
 * (peek / half / full) rides over it. Lives inside the shared primary-surface
 * card, so heights are measured off this container — not the viewport.
 */
export function MobileContent({
  viewStops,
  fullStops,
  viewPhase,
  viewDelay,
  isLegView,
  driverAssigned,
  selectedId,
  onSelect,
  onOpenPods,
  onOpenOrder,
  showRating,
  driverName,
  driverAvatarSrc,
  onRatingSubmit,
  ratingSubmitted,
  submittedRating,
  onMessage,
  canContact,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerH, setContainerH] = useState(0)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setContainerH(el.clientHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Peek shows exactly the grabber + hero, so measure that zone rather than
  // hardcoding a height (the hero's height shifts a little by phase).
  const peekRef = useRef<HTMLDivElement>(null)
  const [peekHeight, setPeekHeight] = useState(132)
  useLayoutEffect(() => {
    const el = peekRef.current
    if (!el) return
    const measure = () => setPeekHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const sheetFull = containerH > 0 ? Math.round(containerH * 0.94) : 0
  const half = Math.round(containerH * 0.56)
  // translateY offsets, measured from the fully-expanded position (y = 0).
  const offsetFull = 0
  const offsetHalf = Math.max(0, sheetFull - half)
  const offsetPeek = Math.max(0, sheetFull - peekHeight)

  const offsetFor = (s: SnapPoint) =>
    s === 'full' ? offsetFull : s === 'half' ? offsetHalf : offsetPeek

  const y = useMotionValue(0)
  const snapRef = useRef<SnapPoint>('half')
  const bodyRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<string, HTMLElement | null>>({})

  function snapTo(next: SnapPoint) {
    snapRef.current = next
    animate(y, offsetFor(next), {
      type: 'tween',
      duration: 0.42,
      ease: [0.2, 0.8, 0.2, 1],
    })
  }

  // Keep the sheet pinned to its current snap point as the container / peek settle.
  useEffect(() => {
    if (sheetFull > 0) y.set(offsetFor(snapRef.current))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerH, peekHeight, sheetFull])

  // Entering the rating phase: bring the form fully into view.
  useEffect(() => {
    if (showRating) snapTo('full')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRating])

  function handleDrag(_: unknown, info: PanInfo) {
    const next = clamp(y.get() + info.delta.y, offsetFull, offsetPeek)
    y.set(next)
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const current = y.get()
    const v = info.velocity.y
    let target: SnapPoint
    if (v < -350) {
      target = current > offsetHalf ? 'half' : 'full'
    } else if (v > 350) {
      target = current < offsetHalf ? 'half' : 'peek'
    } else {
      const points: SnapPoint[] = ['full', 'half', 'peek']
      target = points.reduce((best, p) =>
        Math.abs(offsetFor(p) - current) < Math.abs(offsetFor(best) - current)
          ? p
          : best
      )
    }
    snapTo(target)
  }

  // Tapping a stop (row or pin) selects it, opens the sheet to half, and
  // scrolls that row into view.
  function handleSelect(id: string | null) {
    onSelect(id)
    if (!id) return
    if (snapRef.current === 'peek') snapTo('half')
    requestAnimationFrame(() => {
      rowRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 min-h-0">
      {/* Map fills the card body */}
      <div className="absolute inset-0">
        <RouteMap
          key={isLegView ? 'leg' : 'route'}
          stops={viewStops}
          selectedId={selectedId}
          onSelect={handleSelect}
          onOpenPods={onOpenPods}
          delayMin={viewDelay}
          singleLeg={isLegView}
          onMapTap={() => snapTo('peek')}
          hideBadge
          controlsBottomOffset={peekHeight + 12}
        />
      </div>

      {/* Draggable sheet, anchored to the container's bottom */}
      {sheetFull > 0 && (
        <motion.div
          className="tp-mobile-sheet absolute left-0 right-0 bottom-0 flex flex-col"
          style={{
            height: sheetFull,
            y,
            background: 'var(--color-elevation-surface-primary)',
            borderTop: '0.5px solid var(--color-border-primary)',
            borderTopLeftRadius: 'var(--radius-sm)',
            borderTopRightRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-elevation-overlay)',
            zIndex: 600,
          }}
        >
          {/* Peek zone — grabber + hero, always visible, drives the drag */}
          <motion.div
            ref={peekRef}
            className="shrink-0 cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (snapRef.current === 'peek') snapTo('half')
            }}
          >
            <div className="flex justify-center pt-3 pb-4">
              <span
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 999,
                  background: 'var(--color-border-bold, #c4c4c4)',
                }}
              />
            </div>
            <div className="px-6 pt-6 pb-3">
              <HeroStatus
                stops={viewStops}
                phase={viewPhase}
                delayMin={viewDelay}
                singleLeg={isLegView}
              />
            </div>
          </motion.div>

          {/* Scrollable body — driver/rating, stops, details. The driver/rating
              block only renders when there's something to show, so the gap to
              "Stops" collapses while we're still connecting to a driver. */}
          <div
            ref={bodyRef}
            className="flex-1 min-h-0 overflow-y-auto px-6 pt-2 pb-10 flex flex-col gap-6"
            style={{ overscrollBehavior: 'contain' }}
          >
            {showRating ? (
              <RatingPanel
                driverName={driverName}
                driverAvatarSrc={driverAvatarSrc}
                onSubmit={onRatingSubmit}
                submitted={ratingSubmitted}
                submittedRating={submittedRating}
              />
            ) : driverAssigned ? (
              <DriverSection
                assigned={driverAssigned}
                onMessage={onMessage}
                canContact={canContact}
              />
            ) : null}
            <StopsSection
              stops={viewStops}
              selectedId={selectedId}
              onSelect={handleSelect}
              onOpenPods={onOpenPods}
              onOpenOrder={onOpenOrder}
              rowRefs={rowRefs}
            />
            <DeliveryDetailsCard stops={fullStops} singleLeg={isLegView} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
