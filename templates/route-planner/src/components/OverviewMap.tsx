import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Plus, Minus, Compass, WarningCircle } from '@phosphor-icons/react'
import {
  PLANNER_LANES,
  LANE_GEO,
  laneException,
  type ExceptionRow,
  type LatLng,
} from '../data/exceptions'

const ICON_PRIMARY = '#1c1c1c'
const ICON_INVERSE = '#fcfcfc'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export function OverviewMap({
  onOpenException,
}: {
  onOpenException: (row: ExceptionRow, anchor: HTMLElement) => void
}) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const [routes, setRoutes] = useState<Record<string, LatLng[]>>({})

  const allStops = useMemo(() => {
    const out: LatLng[] = []
    for (const lane of PLANNER_LANES) {
      const g = LANE_GEO[lane.id]
      if (g) {
        out.push(g.pickup, g.dropoff)
      }
    }
    return out
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all(
      PLANNER_LANES.map(async (lane) => {
        const g = LANE_GEO[lane.id]
        if (!g) return null
        try {
          const coordPairs = g.path
            .map(([lat, lng]) => `${lng},${lat}`)
            .join(';')
          const url = `https://router.project-osrm.org/route/v1/driving/${coordPairs}?overview=full&geometries=geojson`
          const res = await fetch(url)
          if (!res.ok) return null
          const data = await res.json()
          const coords = data?.routes?.[0]?.geometry?.coordinates as
            | [number, number][]
            | undefined
          if (!coords) return null
          return [
            lane.id,
            coords.map(([lng, lat]) => [lat, lng] as LatLng),
          ] as const
        } catch {
          return null
        }
      }),
    ).then((results) => {
      if (cancelled) return
      const next: Record<string, LatLng[]> = {}
      for (const r of results) if (r) next[r[0]] = r[1]
      setRoutes(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const exceptionCount = useMemo(
    () => PLANNER_LANES.filter((l) => laneException(l)).length,
    [],
  )

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[37.778, -122.4136]}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={false}
        className="w-full h-full"
        style={{ background: '#e6e9eb' }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <MapBinder onReady={setMapInstance} />
        <FitToStops stops={allStops} />

        {PLANNER_LANES.map((lane) => {
          const geo = LANE_GEO[lane.id]
          if (!geo) return null
          const exc = laneException(lane)
          const hasException = !!exc
          const path = routes[lane.id] ?? geo.path
          return (
            <Fragment key={lane.id}>
              <Polyline
                positions={path}
                pathOptions={{
                  color: lane.colorBar,
                  weight: 4,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              <Marker
                position={geo.pickup}
                icon={stopIcon('pickup')}
              />
              <Marker
                position={geo.dropoff}
                icon={stopIcon('dropoff')}
              />
              {hasException && exc && (
                <Marker
                  position={geo.driverPos}
                  icon={excIcon()}
                  eventHandlers={{
                    click: (e) => {
                      const target = (e.originalEvent.currentTarget ||
                        e.originalEvent.target) as HTMLElement | null
                      const anchor = target?.closest(
                        '.overview-exc-icon',
                      ) as HTMLElement | null
                      if (anchor) onOpenException(exc, anchor)
                    },
                  }}
                  zIndexOffset={1000}
                  title={`${exc.type} · ${lane.routeName}`}
                />
              )}
            </Fragment>
          )
        })}
      </MapContainer>

      <div
        className="absolute top-3 left-3 flex items-center gap-1.5"
        style={{ zIndex: 500 }}
      >
        <MapChip>{PLANNER_LANES.length} routes shown</MapChip>
        {exceptionCount > 0 && (
          <MapChip danger>
            <WarningCircle
              size={11}
              weight="fill"
              style={{ color: 'var(--color-icon-danger)' }}
            />
            {exceptionCount} with exceptions
          </MapChip>
        )}
      </div>

      <MapControls map={mapInstance} stops={allStops} />
    </div>
  )
}

function MapBinder({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  return null
}

function FitToStops({ stops }: { stops: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (!stops.length) return
    const bounds = L.latLngBounds(stops)
    map.fitBounds(bounds, { padding: [80, 80], animate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function stopIcon(kind: 'pickup' | 'dropoff') {
  const shape =
    kind === 'pickup'
      ? `<svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M6 1l5 9H1L6 1z" fill="${ICON_INVERSE}"/></svg>`
      : `<span style="display:inline-block;width:5px;height:5px;background:${ICON_INVERSE};border-radius:1px;"></span>`
  const html = `
    <div style="position:relative;width:16px;height:16px;">
      <div style="position:absolute;inset:0;background:${ICON_PRIMARY};border-radius:3px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.18),0 0 0 1.5px #fff;">
        ${shape}
      </div>
    </div>
  `
  return L.divIcon({
    className: 'overview-stop-marker',
    html,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function excIcon() {
  const html = `
    <div class="overview-exc-pin" role="button">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="10.5" y="6" width="3" height="8" rx="1.5" fill="${ICON_INVERSE}"/>
        <circle cx="12" cy="17" r="1.6" fill="${ICON_INVERSE}"/>
      </svg>
    </div>
  `
  return L.divIcon({
    className: 'overview-exc-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function MapControls({
  map,
  stops,
}: {
  map: L.Map | null
  stops: LatLng[]
}) {
  const recenter = () => {
    if (!map || !stops.length) return
    const bounds = L.latLngBounds(stops)
    map.flyToBounds(bounds, { padding: [80, 80], duration: 0.5 })
  }
  return (
    <div
      className="absolute right-3 bottom-3 flex flex-col gap-1"
      style={{ zIndex: 500 }}
    >
      <CtrlBtn icon={Plus} onClick={() => map?.zoomIn()} />
      <CtrlBtn icon={Minus} onClick={() => map?.zoomOut()} />
      <CtrlBtn icon={Compass} onClick={recenter} />
    </div>
  )
}

function CtrlBtn({
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
      className="w-6 h-6 rounded flex items-center justify-center"
      style={{
        background: 'var(--color-elevation-surface-overlay)',
        border: '0.5px solid var(--color-border-primary)',
        boxShadow: 'var(--shadow-elevation-element)',
      }}
    >
      <Icon size={12} style={{ color: 'var(--color-icon-primary)' }} />
    </button>
  )
}

function MapChip({
  children,
  danger,
}: {
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className="h-6 inline-flex items-center gap-1.5 px-2 rounded"
      style={{
        background: 'var(--color-elevation-surface-overlay)',
        border: `0.5px solid ${
          danger
            ? 'var(--color-border-danger)'
            : 'var(--color-border-primary)'
        }`,
        boxShadow: 'var(--shadow-elevation-element)',
        fontSize: 11,
        fontWeight: 500,
        color: danger
          ? 'var(--color-text-danger)'
          : 'var(--color-text-primary)',
      }}
    >
      {children}
    </div>
  )
}
