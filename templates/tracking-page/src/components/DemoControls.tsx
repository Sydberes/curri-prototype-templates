import { Play, Pause } from '@phosphor-icons/react'

export type ViewMode = 'route' | 'leg'

type Props = {
  simulating: boolean
  onToggleSim: () => void
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
  /** Mobile: the bottom sheet owns the bottom edge, so float the remote up top instead. */
  mobile?: boolean
}

/**
 * Floating prototype controls. Intentionally styled OUTSIDE the Curri design
 * language — a dark, glassy remote that reads as scaffolding, not product UI —
 * so it's obvious these knobs (simulate + viewer perspective) aren't shipping.
 */
export function DemoControls({
  simulating,
  onToggleSim,
  mode,
  onModeChange,
  mobile = false,
}: Props) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 flex items-center gap-2.5"
      style={{
        ...(mobile ? { top: 60 } : { bottom: 16 }),
        zIndex: 1200,
        padding: '6px 8px 6px 12px',
        borderRadius: 999,
        background: 'rgba(24, 24, 27, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '0.5px solid rgba(255, 255, 255, 0.14)',
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.12)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <span
        style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: 11,
          lineHeight: '14px',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        Demo
      </span>

      <button
        type="button"
        onClick={onToggleSim}
        aria-label={simulating ? 'Pause simulation' : 'Simulate route'}
        className="flex items-center justify-center shrink-0"
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          transition: 'background-color 160ms ease-out',
        }}
      >
        {simulating ? (
          <Pause size={11} weight="fill" />
        ) : (
          <Play size={11} weight="fill" />
        )}
      </button>

      <span
        aria-hidden
        style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)' }}
      />

      <div
        className="flex items-center"
        style={{ gap: 2, padding: 2, borderRadius: 999, background: 'rgba(0,0,0,0.25)' }}
      >
        <Segment
          label="Booker view"
          active={mode === 'route'}
          onClick={() => onModeChange('route')}
        />
        <Segment
          label="Receiver view"
          active={mode === 'leg'}
          onClick={() => onModeChange('leg')}
        />
      </div>
    </div>
  )
}

function Segment({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 22,
        padding: '0 11px',
        borderRadius: 999,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        transition: 'background-color 180ms ease-out, color 180ms ease-out',
      }}
    >
      {label}
    </button>
  )
}
