import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Minus, MapTrifold, Compass } from '@phosphor-icons/react'
import type { Stop } from '../data/stops'

type Props = {
  stops: Stop[]
  selectedId: string | null
  onSelect: (id: string) => void
  onOpenPods: (stopId: string, index: number) => void
  delayMin?: number | null
  /** Recipient view: show only the dropoff + the driver in its vicinity, zoomed to the neighborhood. */
  singleLeg?: boolean
  /** Mobile: tapping empty map space collapses the bottom sheet back to peek. */
  onMapTap?: () => void
  /** Mobile: the ETA badge lives in the sheet hero instead, so hide it on the map. */
  hideBadge?: boolean
  /** Mobile: lift the floating zoom controls above the sheet's peek line (px from bottom). */
  controlsBottomOffset?: number
}

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export function RouteMap({
  stops,
  selectedId,
  onSelect,
  onOpenPods,
  delayMin = null,
  singleLeg = false,
  onMapTap,
  hideBadge = false,
  controlsBottomOffset,
}: Props) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  // In single-leg mode the recipient only sees their own dropoff. The driver is
  // shown in the dropoff's vicinity (approaching → at the door), never tracing
  // the full route from pickup — they're mid-route by the time they're "yours".
  const legDropoff = useMemo(
    () => (singleLeg ? stops.find((s) => s.kind === 'dropoff') ?? null : null),
    [singleLeg, stops]
  )
  const legDriver = useMemo(
    () => (singleLeg ? computeLegDriverPos(stops) : null),
    [singleLeg, stops]
  )

  // Cancelled stops are dropped from the route, so the planned line skips them.
  const fullPath = stops
    .filter((s) => s.status !== 'cancelled')
    .map((s) => [s.lat, s.lng] as [number, number])
  const driverPos = useMemo(
    () => (singleLeg ? legDriver : computeDriverPosition(stops)),
    [singleLeg, legDriver, stops]
  )
  const completedPath = useMemo(() => {
    if (singleLeg) {
      // Short approach line: just the driver → dropoff hop, when en route.
      if (legDriver && legDropoff && legDropoff.status !== 'delivered') {
        return [
          [legDriver.lat, legDriver.lng],
          [legDropoff.lat, legDropoff.lng],
        ] as [number, number][]
      }
      return []
    }
    const out: [number, number][] = []
    for (const s of stops) {
      if (s.status === 'delivered') out.push([s.lat, s.lng])
    }
    if (driverPos) out.push([driverPos.lat, driverPos.lng])
    return out
  }, [singleLeg, legDriver, legDropoff, stops, driverPos])

  // Points the map frames: the full stop set for route view, just the dropoff
  // (+ nearby driver) for the recipient view.
  const fitPoints = useMemo<Stop[]>(() => {
    if (singleLeg && legDropoff) {
      const pts: Stop[] = [legDropoff]
      if (legDriver) {
        pts.push({ ...legDropoff, lat: legDriver.lat, lng: legDriver.lng })
      }
      return pts
    }
    return stops
  }, [singleLeg, legDropoff, legDriver, stops])

  const renderedStops = singleLeg && legDropoff ? [legDropoff] : stops

  const arrived = renderedStops.find((s) => s.status === 'arrived')
  const enRoute = renderedStops.find((s) => s.status === 'en-route')
  const nextStop = arrived ?? enRoute
  const minutesAway = computeMinutesAway(renderedStops)

  const initialCenter: [number, number] = useMemo(() => {
    const lats = fitPoints.map((s) => s.lat)
    const lngs = fitPoints.map((s) => s.lng)
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ]
  }, [fitPoints])

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={initialCenter}
        zoom={10}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={false}
        className="w-full h-full"
        style={{ background: '#e6e9eb' }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />

        <MapBinder onReady={setMapInstance} />
        {onMapTap && <MapTapHandler onTap={onMapTap} />}
        <FitToStops stops={fitPoints} />
        <PanToSelected stops={renderedStops} selectedId={selectedId} />

        {!singleLeg && (
          <Polyline
            positions={fullPath}
            pathOptions={{
              color: '#7a7a7a',
              weight: 2,
              opacity: 0.5,
              dashArray: '2 6',
              lineCap: 'round',
            }}
          />
        )}

        {completedPath.length > 1 && (
          <Polyline
            positions={completedPath}
            pathOptions={{
              color: '#1c1c1c',
              weight: singleLeg ? 2 : 4,
              opacity: singleLeg ? 0.5 : 0.85,
              dashArray: singleLeg ? '2 6' : undefined,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {renderedStops.map((stop) => {
          const showPods =
            stop.status === 'delivered' && stop.pods && stop.pods.length > 0
          if (showPods) {
            return (
              <PodStackMarker
                key={stop.id}
                stop={stop}
                selected={stop.id === selectedId}
                onSelect={() => onSelect(stop.id)}
                onOpenPods={(i) => onOpenPods(stop.id, i)}
              />
            )
          }
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={stopIcon(stop, stop.id === selectedId)}
              eventHandlers={{ click: () => onSelect(stop.id) }}
              zIndexOffset={stop.id === selectedId ? 1000 : 0}
            >
              {stop.status === 'cancelled' && (
                <Tooltip
                  direction="top"
                  offset={[0, -12]}
                  opacity={1}
                  className="tp-cancel-tooltip"
                >
                  Canceled · {stop.name}
                </Tooltip>
              )}
            </Marker>
          )
        })}

        {driverPos && (
          <Marker
            position={[driverPos.lat, driverPos.lng]}
            icon={driverIcon(
              singleLeg && legDropoff
                ? bearing(driverPos, legDropoff)
                : driverHeading(stops)
            )}
            interactive={false}
            zIndexOffset={2000}
          />
        )}
      </MapContainer>

      {nextStop && !hideBadge && (
        <MinutesAwayBadge
          minutes={minutesAway}
          eta={nextStop.eta}
          label={
            arrived
              ? 'Arrived'
              : singleLeg
                ? 'Arriving'
                : nextStop.kind === 'pickup'
                  ? 'Pickup'
                  : 'Next stop'
          }
          name={nextStop.name}
          delayMin={delayMin}
        />
      )}

      <MapControlsOverlay
        map={mapInstance}
        stops={fitPoints}
        bottomOffset={controlsBottomOffset}
      />
    </div>
  )
}

/** Mobile: a tap on empty map space collapses the bottom sheet back to peek. */
function MapTapHandler({ onTap }: { onTap: () => void }) {
  useMapEvents({ click: () => onTap() })
  return null
}

function PodStackMarker({
  stop,
  selected,
  onSelect,
  onOpenPods,
}: {
  stop: Stop
  selected: boolean
  onSelect: () => void
  onOpenPods: (index: number) => void
}) {
  const pods = stop.pods!.slice(0, 4)
  const total = pods.length
  const center = (total - 1) / 2

  const slotsHtml = pods
    .map((pod, i) => {
      // stack-pos drives the default-tight-deck layout (each photo offset
      // slightly right of the previous; rightmost on top via z-index).
      // spread-pos drives the spread-line layout (centered around the anchor).
      const stackPos = i
      const spreadPos = i - center
      const z = 10 + i
      return `
        <div class="tp-pod-slot" data-pod-index="${i}" style="--stack-pos: ${stackPos}; --spread-pos: ${spreadPos}; z-index: ${z};">
          <div class="tp-pod-photo">
            <img src="${pod.src}" loading="lazy" alt="${pod.label}" />
          </div>
        </div>
      `
    })
    .join('')

  const html = `<div class="tp-pod-stack${selected ? ' is-selected' : ''}">${slotsHtml}</div>`

  const icon = L.divIcon({
    className: 'tp-pod-stack-marker',
    html,
    iconSize: [320, 140],
    iconAnchor: [160, 70],
  })

  return (
    <Marker
      key={stop.id}
      position={[stop.lat, stop.lng]}
      icon={icon}
      zIndexOffset={500 + (selected ? 600 : 0)}
      eventHandlers={{
        click: (e) => {
          onSelect()
          const ev = (e as unknown as { originalEvent?: Event }).originalEvent
          const target = ev?.target as HTMLElement | undefined
          const slot = target?.closest?.('[data-pod-index]') as HTMLElement | null
          if (slot) {
            const idx = parseInt(
              slot.getAttribute('data-pod-index') || '0',
              10
            )
            onOpenPods(idx)
          }
        },
      }}
    />
  )
}

function MapBinder({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  return null
}

function FitToStops({ stops }: { stops: Stop[] }) {
  const map = useMap()
  useEffect(() => {
    if (stops.length === 1) {
      // Single point (dropoff, no driver yet): drop into the neighborhood.
      map.setView([stops[0].lat, stops[0].lng], 14, { animate: false })
      return
    }
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]))
    map.fitBounds(bounds, { padding: [80, 80], animate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function PanToSelected({
  stops,
  selectedId,
}: {
  stops: Stop[]
  selectedId: string | null
}) {
  const map = useMap()
  useEffect(() => {
    const sel = stops.find((s) => s.id === selectedId)
    if (!sel) return
    const target = map.project([sel.lat, sel.lng], map.getZoom())
    // Offset the pan so the pin sits a bit above center (so the badge doesn't overlap)
    target.y -= 60
    const newCenter = map.unproject(target, map.getZoom())
    map.flyTo(newCenter, map.getZoom(), { duration: 0.5 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])
  return null
}

function stopIcon(stop: Stop, selected: boolean) {
  const isDone = stop.status === 'delivered'
  const isCancelled = stop.status === 'cancelled'
  const label = String(stop.index)

  let bg = '#1c1c1c'
  let color = '#fcfcfc'
  if (isDone) {
    bg = '#00e3a3'
    color = '#0a1a15'
  } else if (isCancelled) {
    // Solid muted grey — visible on the map but clearly inactive. Status detail on hover + in the list badge.
    bg = '#8b9096'
    color = '#fcfcfc'
  }

  const ring = selected
    ? 'box-shadow: 0 0 0 3px rgba(0, 227, 163, 0.45), 0 2px 6px rgba(0,0,0,0.12);'
    : 'box-shadow: 0 1px 3px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06);'

  const content = isDone
    ? `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8.5 7 12 13 4"/></svg>`
    : `<span style="font-family:Inter,system-ui,sans-serif;font-size:11px;font-weight:600;line-height:14px;letter-spacing:0.02em;text-transform:uppercase;color:${color};">${label}</span>`

  const scale = selected ? 1.15 : 1
  const html = `
    <div style="position:relative;width:22px;height:22px;transform:scale(${scale});transition:transform 0.2s cubic-bezier(0.2,0.8,0.2,1);">
      <div style="position:absolute;inset:0;background:${bg};border-radius:4px;display:flex;align-items:center;justify-content:center;${ring}">
        ${content}
      </div>
    </div>
  `

  return L.divIcon({
    className: 'tp-stop-marker',
    html,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function driverIcon(heading: number) {
  // van.svg natural orientation has the cab pointing LEFT;
  // rotate by (heading + 90) so the cab faces the bearing.
  const rotation = (heading + 90) % 360

  const html = `
    <div style="position:relative;width:80px;height:80px;display:flex;align-items:center;justify-content:center;">
      <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;transform:rotate(${rotation}deg);transition:transform 0.4s cubic-bezier(0.2,0.8,0.2,1);filter: drop-shadow(0 2.5px 5px rgba(0,0,0,0.3));">
        <img src="/van.svg" style="width:64px;height:auto;display:block;" alt="" />
      </div>
    </div>
  `
  return L.divIcon({
    className: 'tp-driver-marker',
    html,
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  })
}

function driverHeading(stops: Stop[]) {
  const arrivedIdx = stops.findIndex((s) => s.status === 'arrived')
  if (arrivedIdx >= 0) {
    const next = stops.slice(arrivedIdx + 1).find((s) => s.status === 'pending')
    if (next) return bearing(stops[arrivedIdx], next)
    if (arrivedIdx > 0) return bearing(stops[arrivedIdx - 1], stops[arrivedIdx])
    return 90
  }
  const enRouteIdx = stops.findIndex((s) => s.status === 'en-route')
  if (enRouteIdx <= 0) return 90
  return bearing(stops[enRouteIdx - 1], stops[enRouteIdx])
}

function bearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const φ1 = (from.lat * Math.PI) / 180
  const φ2 = (to.lat * Math.PI) / 180
  const Δλ = ((to.lng - from.lng) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

function computeDriverPosition(stops: Stop[]) {
  const arrivedIdx = stops.findIndex((s) => s.status === 'arrived')
  if (arrivedIdx >= 0) {
    return { lat: stops[arrivedIdx].lat, lng: stops[arrivedIdx].lng }
  }
  const enRouteIdx = stops.findIndex((s) => s.status === 'en-route')
  if (enRouteIdx <= 0) return null
  // Interpolate from the last stop actually visited — skip any cancelled stop
  // sitting between it and the en-route target.
  const from =
    stops
      .slice(0, enRouteIdx)
      .reverse()
      .find((s) => s.status === 'delivered') ?? stops[enRouteIdx - 1]
  const to = stops[enRouteIdx]
  const t = 0.55
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  }
}

/**
 * Driver position for the recipient's single-leg map: in the dropoff's vicinity,
 * on the approach side (back along the pickup→dropoff bearing), tightening from
 * "approaching" to "at the door". Null before pickup and after delivery.
 */
function computeLegDriverPos(stops: Stop[]) {
  const pickup = stops[0]
  const dropoff = stops.find((s) => s.kind === 'dropoff')
  if (!pickup || !dropoff) return null
  let offsetKm: number
  if (dropoff.status === 'en-route') offsetKm = 1.6
  else if (dropoff.status === 'arrived') offsetKm = 0.12
  else return null // pending (not yet yours) or delivered (POD shown instead)
  const approachBearing = (bearing(pickup, dropoff) + 180) % 360
  return destinationPoint(dropoff, approachBearing, offsetKm)
}

/** Small-distance destination point from an origin given a bearing (deg) and distance (km). */
function destinationPoint(
  from: { lat: number; lng: number },
  bearingDeg: number,
  km: number
) {
  const b = (bearingDeg * Math.PI) / 180
  const dLat = (km / 111) * Math.cos(b)
  const dLng = (km / (111 * Math.cos((from.lat * Math.PI) / 180))) * Math.sin(b)
  return { lat: from.lat + dLat, lng: from.lng + dLng }
}

function computeMinutesAway(stops: Stop[]) {
  const arrived = stops.find((s) => s.status === 'arrived')
  if (arrived) return 0
  const enRoute = stops.find((s) => s.status === 'en-route')
  if (!enRoute) return null
  const m = parseEta(enRoute.eta)
  const now = 11 * 60 + 30
  return Math.max(1, m - now)
}

function parseEta(eta: string) {
  const match = eta.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
  if (!match) return 0
  let h = parseInt(match[1], 10)
  const min = parseInt(match[2], 10)
  if ((match[3] ?? '').toUpperCase() === 'PM' && h < 12) h += 12
  return h * 60 + min
}

function MinutesAwayBadge({
  minutes,
  eta,
  label,
  delayMin = null,
}: {
  minutes: number | null
  eta: string
  label: string
  name: string
  delayMin?: number | null
}) {
  const isArrived = label === 'Arrived' || minutes === 0
  const leftCaption = isArrived ? 'arrived' : 'ETA'
  const rightValue =
    minutes === null ? '—' : isArrived ? 'On site' : String(minutes)
  const rightCaption =
    minutes === null ? 'calculating' : isArrived ? '' : 'min away'

  const isLate = !!delayMin && delayMin > 0
  const showPill = !isArrived

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        layout: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] },
        opacity: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
        y: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
        scale: { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] },
      }}
      className="absolute right-4 top-4 flex flex-col"
      style={{
        padding: '8px 12px 8px',
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '0.5px solid rgba(255, 255, 255, 0.6)',
        borderRadius: 6,
        boxShadow:
          '0 0 0 0.5px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(15, 23, 42, 0.10), inset 0 0.5px 0 rgba(255, 255, 255, 0.8)',
        zIndex: 500,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence initial={false}>
        {showPill && (
          <motion.span
            key="status-pill"
            layout
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 18, marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center self-start"
            style={{
              padding: '0 8px',
              borderRadius: 16,
              background: isLate
                ? 'var(--color-background-system-warning)'
                : 'var(--color-background-accent-hivis-subtle)',
              color: isLate
                ? 'var(--color-text-warning)'
                : 'var(--color-icon-accent-hivis)',
              fontSize: 11,
              lineHeight: '14px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {isLate ? `${delayMin} min late` : 'On time'}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div layout className="flex items-stretch" style={{ gap: 16 }}>
        <Stat value={eta} caption={leftCaption} />
        <div
          className="self-stretch"
          style={{
            width: 1,
            background: 'rgba(15, 23, 42, 0.08)',
          }}
        />
        <Stat value={rightValue} caption={rightCaption} />
      </motion.div>
    </motion.div>
  )
}

function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        style={{
          color: 'var(--color-text-primary)',
          fontWeight: 600,
          fontSize: 18,
          lineHeight: '22px',
          letterSpacing: '-0.005em',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
      {caption && (
        <span
          style={{
            color: 'var(--color-text-tertiary)',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '16px',
            whiteSpace: 'nowrap',
          }}
        >
          {caption}
        </span>
      )}
    </div>
  )
}

function MapControlsOverlay({
  map,
  stops,
  bottomOffset,
}: {
  map: L.Map | null
  stops: Stop[]
  bottomOffset?: number
}) {
  const recenter = () => {
    if (!map) return
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]))
    map.flyToBounds(bounds, { padding: [80, 80], duration: 0.5 })
  }
  return (
    <div
      className="absolute right-3 flex flex-col gap-1"
      style={{ zIndex: 500, bottom: bottomOffset ?? 12 }}
    >
      <ZoomButton icon={Plus} onClick={() => map?.zoomIn()} />
      <ZoomButton icon={Minus} onClick={() => map?.zoomOut()} />
      <ZoomButton icon={Compass} onClick={recenter} />
      <ZoomButton icon={MapTrifold} />
    </div>
  )
}

function ZoomButton({
  icon: Icon,
  onClick,
}: {
  icon: React.ElementType
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-6 h-6 rounded-[4px] flex items-center justify-center"
      style={{
        background: 'var(--color-elevation-surface-overlay)',
        border: '0.5px solid var(--color-border-primary)',
        boxShadow:
          '0 0 0.5px rgba(9, 30, 66, 0.31), 0 8px 6px rgba(9, 30, 66, 0.15)',
      }}
    >
      <Icon size={12} style={{ color: 'var(--color-icon-primary)' }} />
    </button>
  )
}
