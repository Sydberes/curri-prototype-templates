import { CornersOut, Plus, Minus, MapTrifold } from '@phosphor-icons/react'

export function MapCanvas() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <iframe
        title="Map"
        className="absolute inset-0 w-full h-full border-0"
        src="https://www.google.com/maps?q=Magnolia,TX&z=11&output=embed"
        loading="lazy"
      />
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 pointer-events-none">
        <MapControl>
          <CornersOut size={12} />
        </MapControl>
        <MapControl>
          <Plus size={12} />
        </MapControl>
        <MapControl>
          <Minus size={12} />
        </MapControl>
        <MapControl>
          <MapTrifold size={12} />
        </MapControl>
      </div>
    </div>
  )
}

function MapControl({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-6 h-6 flex items-center justify-center rounded border"
      style={{
        background: 'var(--color-elevation-surface-overlay)',
        borderColor: 'var(--color-border-primary)',
        color: 'var(--color-icon-secondary)',
        boxShadow: 'var(--shadow-elevation-overlay)',
      }}
    >
      {children}
    </div>
  )
}
