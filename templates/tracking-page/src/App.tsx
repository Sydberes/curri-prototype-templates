import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChatTeardropDots,
  UploadSimple,
  PencilSimple,
  Clock,
  X,
  LinkSimple,
  Check,
} from '@phosphor-icons/react'
import { Sidebar, SidebarDrawer } from './components/Sidebar'
import { TopNav } from './components/TopNav'
import { HeroStatus } from './components/HeroStatus'
import { DeliveryDetailsCard } from './components/DeliveryDetailsCard'
import { DriverSection } from './components/DriverSection'
import { MessagePanel } from './components/MessagePanel'
import { StopsSection } from './components/StopsSection'
import { RouteMap } from './components/RouteMap'
import { PodViewer } from './components/PodViewer'
import { RatingPanel } from './components/RatingPanel'
import { MobileContent } from './components/MobileContent'
import { DeliveryOverflowMenu } from './components/DeliveryOverflowMenu'
import { DemoControls, type ViewMode } from './components/DemoControls'
import {
  INITIAL_STOPS,
  DEFAULT_LEG_STOP_ID,
  deriveLegStops,
  type Stop,
} from './data/stops'

const DELIVERY_ID = 'PO-104839'

/** Resolve the initial view from the URL: ?stop=<id> → single leg, else full route. */
function readInitialView(): { mode: ViewMode; legStopId: string } {
  const params = new URLSearchParams(window.location.search)
  const stop = params.get('stop')
  if (stop && INITIAL_STOPS.some((s) => s.id === stop)) {
    return { mode: 'leg', legStopId: stop }
  }
  return { mode: 'route', legStopId: DEFAULT_LEG_STOP_ID }
}

export type Phase = 'pre-driver' | 'in-progress' | 'complete' | 'rated'

const DRIVER_NAME = 'Demetrius J.'
const DRIVER_AVATAR = 'https://i.pravatar.cc/96?img=12'

const SIMULATION_TICK_MS = 2400

/** Below 1024px we swap the desktop split for the map-first mobile shell. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 1023px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

export default function App() {
  const isMobile = useIsMobile()
  const initialView = useMemo(readInitialView, [])
  const [mode, setMode] = useState<ViewMode>(initialView.mode)
  const [legStopId] = useState<string>(initialView.legStopId)
  // Booker drilling into one receiver's view via a payload link (to grab the
  // sharing link for that customer). Independent of the receiver persona.
  const [bookerLegId, setBookerLegId] = useState<string | null>(null)
  const [stops, setStops] = useState<Stop[]>(() =>
    initialView.mode === 'leg' ? midRouteStops() : INITIAL_STOPS
  )
  const [phase, setPhase] = useState<Phase>(
    initialView.mode === 'leg' ? 'in-progress' : 'pre-driver'
  )
  const [rating, setRating] = useState<{ stars: number; comment: string } | null>(null)
  const [legRating, setLegRating] = useState<{ stars: number; comment: string } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewer, setViewer] = useState<{ stopId: string; index: number } | null>(
    null
  )
  const [simulating, setSimulating] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [delayMin, setDelayMin] = useState<number | null>(null)
  const tickRef = useRef<number | null>(null)

  const viewerStop = useMemo(
    () => stops.find((s) => s.id === viewer?.stopId) ?? null,
    [stops, viewer]
  )

  // Single-leg lens over the same simulation state. The driver still runs the
  // full route under the hood — the recipient just sees their pickup → dropoff.
  // Two ways in: the receiver persona (demo pill / ?stop= link) or the booker
  // drilling into a payload link. Content scopes identically; chrome differs.
  const isReceiver = mode === 'leg'
  const activeLegId = isReceiver ? legStopId : bookerLegId
  const isLegView = activeLegId !== null
  const mine = useMemo(
    () => (activeLegId ? stops.find((s) => s.id === activeLegId) ?? null : null),
    [stops, activeLegId]
  )
  const legStops = useMemo(
    () => (activeLegId ? deriveLegStops(stops, activeLegId) : stops),
    [stops, activeLegId]
  )
  const viewStops = isLegView ? legStops : stops
  const legComplete = mine?.status === 'delivered'
  const shareUrl = mine
    ? `${window.location.origin}${window.location.pathname}?stop=${mine.id}`
    : ''
  const legPhase: Phase =
    phase === 'pre-driver'
      ? 'pre-driver'
      : legComplete
        ? legRating
          ? 'rated'
          : 'complete'
        : 'in-progress'
  const viewPhase = isLegView ? legPhase : phase
  const viewDelay = isLegView ? (legComplete ? null : delayMin) : delayMin

  function handleModeChange(next: ViewMode) {
    setMode(next)
    setBookerLegId(null)
    // Entering the recipient view before the sim has started: jump to the
    // mid-route baseline (picked up, on the way to you) rather than "connecting".
    if (next === 'leg' && phase === 'pre-driver') {
      setStops(midRouteStops())
      setPhase('in-progress')
    }
    const url = new URL(window.location.href)
    if (next === 'leg') {
      url.searchParams.delete('delivery')
      url.searchParams.set('stop', legStopId)
    } else {
      url.searchParams.delete('stop')
      url.searchParams.set('delivery', DELIVERY_ID)
    }
    window.history.replaceState(null, '', url)
  }

  function tick() {
    // pre-driver → in-progress: assign driver, kick stop 1 to en-route
    if (phase === 'pre-driver') {
      setPhase('in-progress')
      setStops((prev) => {
        const next = prev.map((s) => ({ ...s }))
        if (next[0]) next[0].status = 'en-route'
        return next
      })
      return
    }

    if (phase === 'in-progress') {
      setStops((prev) => {
        const next = prev.map((s) => ({ ...s }))
        const arrivedIdx = next.findIndex((s) => s.status === 'arrived')
        if (arrivedIdx >= 0) {
          next[arrivedIdx].status = 'delivered'
          next[arrivedIdx].pods = randomPods(next[arrivedIdx].id)
          const nextEnRouteIdx = next.findIndex((s) => s.status === 'pending')
          if (nextEnRouteIdx >= 0) next[nextEnRouteIdx].status = 'en-route'
        } else {
          const enRouteIdx = next.findIndex((s) => s.status === 'en-route')
          if (enRouteIdx >= 0) next[enRouteIdx].status = 'arrived'
        }
        // A cancelled stop is terminal — it's dropped from the route, so the
        // run completes once every remaining stop is delivered.
        if (
          next.every(
            (s) => s.status === 'delivered' || s.status === 'cancelled'
          )
        ) {
          setPhase('complete')
          setSimulating(false)
        }
        return next
      })
    }
  }

  useEffect(() => {
    if (!simulating) return
    tickRef.current = window.setInterval(tick, SIMULATION_TICK_MS)
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulating, phase])

  // Mid-route, simulate a delay event: once 2 dropoffs are delivered, the
  // driver hits traffic and we start showing "X min late".
  useEffect(() => {
    if (phase !== 'in-progress' || delayMin !== null) return
    const delivered = stops.filter((s) => s.status === 'delivered').length
    if (delivered >= 3) setDelayMin(8)
  }, [stops, phase, delayMin])

  function openPods(stopId: string, index: number) {
    setViewer({ stopId, index })
  }

  function handleSimulateToggle() {
    // If we're done with the cycle, clicking play resets to the beginning
    if (phase === 'rated') {
      resetCycle()
      setSimulating(true)
      return
    }
    setSimulating((s) => !s)
  }

  function resetCycle() {
    setStops(INITIAL_STOPS.map((s) => ({ ...s })))
    setPhase('pre-driver')
    setRating(null)
    setLegRating(null)
    setSelectedId(null)
    setMessageOpen(false)
    setDelayMin(null)
  }

  const driverAssigned = viewPhase !== 'pre-driver'

  // Shared across desktop + mobile so both surfaces stay in lockstep.
  const showRating =
    (viewPhase === 'complete' || viewPhase === 'rated') &&
    (isReceiver || !isLegView)
  const actionsVariant: 'booker' | 'receiver' | 'booker-leg' = isReceiver
    ? 'receiver'
    : isLegView
      ? 'booker-leg'
      : 'booker'
  const legCrumb =
    !isReceiver && isLegView && mine
      ? { label: mine.order, onBack: () => setBookerLegId(null) }
      : undefined
  const handleOpenOrder =
    !isReceiver && !isLegView
      ? (po: string) => {
          const target = stops.find(
            (s) => s.kind === 'dropoff' && s.order === po
          )
          if (target) setBookerLegId(target.id)
        }
      : undefined
  function handleRatingSubmit(stars: number, comment: string) {
    if (isLegView) setLegRating({ stars, comment })
    else {
      setRating({ stars, comment })
      setPhase('rated')
    }
  }

  // Chrome follows the persona, not the breakpoint: the booker keeps the app
  // nav at every width; a share-link recipient never sees the booker's nav.
  const showSidebar = !isReceiver

  return (
    <div
      className="h-screen w-screen flex"
      style={{ background: 'var(--color-elevation-surface-base)' }}
    >
      {showSidebar &&
        (isMobile ? (
          <SidebarDrawer open={navOpen} onClose={() => setNavOpen(false)} />
        ) : (
          <Sidebar />
        ))}

      <main
        className="flex-1 min-w-0 flex flex-col"
        style={
          isMobile
            ? undefined
            : { paddingTop: 6, paddingRight: 6, paddingBottom: 8 }
        }
      >
        <div
          className={`flex-1 min-h-0 flex flex-col overflow-hidden ${
            isMobile ? '' : 'rounded-[10px]'
          }`}
          style={{
            background: 'var(--color-elevation-surface-primary)',
            border: isMobile
              ? 'none'
              : '0.5px solid var(--color-border-primary)',
            boxShadow: isMobile ? 'none' : '0 0.5px 1px rgba(0,0,0,0.04)',
          }}
        >
          <TopNav
            onMenu={
              showSidebar && isMobile ? () => setNavOpen(true) : undefined
            }
            showHomeCrumb={showSidebar && !isMobile}
            legCrumb={legCrumb}
            rightSlot={
              isMobile ? (
                <DeliveryOverflowMenu
                  variant={actionsVariant}
                  shareUrl={shareUrl}
                />
              ) : (
                <DeliveryActions variant={actionsVariant} shareUrl={shareUrl} />
              )
            }
          />

          {isMobile ? (
            <MobileContent
              viewStops={viewStops}
              fullStops={stops}
              viewPhase={viewPhase}
              viewDelay={viewDelay}
              isLegView={isLegView}
              driverAssigned={driverAssigned}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpenPods={openPods}
              onOpenOrder={handleOpenOrder}
              showRating={showRating}
              driverName={DRIVER_NAME}
              driverAvatarSrc={DRIVER_AVATAR}
              onRatingSubmit={handleRatingSubmit}
              ratingSubmitted={viewPhase === 'rated'}
              submittedRating={(isLegView ? legRating : rating)?.stars}
              onMessage={() => setMessageOpen(true)}
              canContact={!isLegView}
            />
          ) : (
            <div className="flex-1 min-h-0 flex">
              <section
                className="w-[550px] shrink-0 overflow-y-auto pl-6 pr-4 pt-6 pb-10"
                style={{ background: 'var(--color-elevation-surface-primary)' }}
              >
                <div className="flex flex-col gap-6 w-[502px]">
                  <HeroStatus
                    stops={viewStops}
                    phase={viewPhase}
                    delayMin={viewDelay}
                    singleLeg={isLegView}
                  />
                  {showRating ? (
                    <RatingPanel
                      driverName={DRIVER_NAME}
                      driverAvatarSrc={DRIVER_AVATAR}
                      onSubmit={handleRatingSubmit}
                      submitted={viewPhase === 'rated'}
                      submittedRating={(isLegView ? legRating : rating)?.stars}
                    />
                  ) : (
                    <DriverSection
                      assigned={driverAssigned}
                      onMessage={() => setMessageOpen(true)}
                      canContact={!isLegView}
                    />
                  )}
                  <StopsSection
                    stops={viewStops}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onOpenPods={openPods}
                    onOpenOrder={handleOpenOrder}
                  />
                  <DeliveryDetailsCard stops={stops} singleLeg={isLegView} />
                </div>
              </section>

              <section className="flex-1 relative pr-4 pt-4 pb-4">
                <div
                  className="absolute inset-y-4 right-4 left-0 rounded-[8px] overflow-hidden"
                  style={{
                    border: '0.5px solid var(--color-border-primary)',
                  }}
                >
                  <RouteMap
                    key={activeLegId ?? 'route'}
                    stops={viewStops}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onOpenPods={openPods}
                    delayMin={viewDelay}
                    singleLeg={isLegView}
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <MessagePanel
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        mobile={isMobile}
      />

      <PodViewer
        open={!!viewer}
        stop={viewerStop}
        pods={viewerStop?.pods ?? []}
        index={viewer?.index ?? 0}
        onClose={() => setViewer(null)}
        onIndexChange={(i) =>
          setViewer((v) => (v ? { ...v, index: i } : v))
        }
      />

      <DemoControls
        simulating={simulating}
        onToggleSim={handleSimulateToggle}
        mode={mode}
        onModeChange={handleModeChange}
        mobile={isMobile}
      />
    </div>
  )
}

function DeliveryActions({
  variant,
  shareUrl,
}: {
  variant: 'booker' | 'receiver' | 'booker-leg'
  shareUrl?: string
}) {
  // Receivers don't own the delivery — only the booker can
  // share/edit/reschedule/cancel. They keep a path to support.
  if (variant === 'receiver') {
    return (
      <div className="flex items-center gap-1">
        <GhostLabeledAction icon={ChatTeardropDots} label="Chat with us" />
      </div>
    )
  }
  // Booker inside one receiver's view: the whole point is grabbing the
  // stop-scoped link to send to that customer.
  if (variant === 'booker-leg') {
    return (
      <div className="flex items-center gap-1">
        <CopyShareLinkAction shareUrl={shareUrl} />
        <span
          className="w-px h-5 mx-2"
          style={{ background: 'var(--color-border-primary)' }}
        />
        <GhostLabeledAction icon={ChatTeardropDots} label="Chat with us" />
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1">
      <PrimaryAction icon={UploadSimple} label="Share tracking" />
      <IconAction icon={PencilSimple} title="Edit details" />
      <IconAction icon={Clock} title="Reschedule" />
      <IconAction icon={X} title="Cancel" danger />
      <span
        className="w-px h-5 mx-2"
        style={{ background: 'var(--color-border-primary)' }}
      />
      <GhostLabeledAction icon={ChatTeardropDots} label="Chat with us" />
    </div>
  )
}

function CopyShareLinkAction({ shareUrl }: { shareUrl?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        if (!shareUrl) return
        navigator.clipboard?.writeText(shareUrl)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      }}
      className="tp-action-btn tp-action-primary h-7 px-2.5 rounded-[4px] flex items-center gap-1 text-[12px]"
      style={{
        color: 'var(--color-text-brand-button)',
        fontWeight: 500,
        lineHeight: '18px',
      }}
    >
      {copied ? <Check size={14} /> : <LinkSimple size={14} />}
      {copied ? 'Link copied' : 'Copy tracking link'}
    </button>
  )
}

function PrimaryAction({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <button
      type="button"
      className="tp-action-btn tp-action-primary h-7 px-2.5 rounded-[4px] flex items-center gap-1 text-[12px]"
      style={{
        color: 'var(--color-text-brand-button)',
        fontWeight: 500,
        lineHeight: '18px',
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

function GhostLabeledAction({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <button
      type="button"
      className="tp-action-btn tp-action-ghost h-7 px-2.5 rounded-[4px] flex items-center gap-1 text-[12px]"
      style={{
        border: '0.5px solid var(--color-border-primary)',
        color: 'var(--color-text-primary)',
        fontWeight: 500,
        boxShadow: '0 0.5px 1px rgba(0,0,0,0.1)',
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

function IconAction({
  icon: Icon,
  title,
  danger,
}: {
  icon: React.ElementType
  title: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      data-tip={title}
      aria-label={title}
      className={`tp-tip-host tp-action-btn ${
        danger ? 'tp-action-danger' : 'tp-action-ghost'
      } w-7 h-7 rounded-[4px] flex items-center justify-center`}
      style={{
        border: '0.5px solid var(--color-border-primary)',
        color: danger
          ? 'var(--color-text-danger)'
          : 'var(--color-text-secondary)',
        boxShadow: '0 0.5px 1px rgba(0,0,0,0.1)',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

/**
 * Seed the sim at the moment a recipient typically receives their tracking link:
 * picked up (pickup delivered, with photos) and the driver on the way to the
 * first dropoff. This is the single-leg view's natural starting state.
 */
function midRouteStops(): Stop[] {
  const next = INITIAL_STOPS.map((s) => ({ ...s }))
  next[0].status = 'delivered'
  next[0].pods = randomPods(next[0].id)
  next[1].status = 'en-route'
  return next
}

function randomPods(seedKey: string) {
  const seed = hash(seedKey)
  const labels = ['Photo', 'Signature']
  const count = 2 + (seed % 2)
  return Array.from({ length: count }, (_, i) => ({
    src: `https://picsum.photos/seed/curri-pod-${seed}-${i}/640/480`,
    label: labels[i % labels.length],
  }))
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
