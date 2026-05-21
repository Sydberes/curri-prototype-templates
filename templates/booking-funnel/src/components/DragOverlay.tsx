import { CoreIntelligenceIcon } from './CoreIntelligence'

export function DragOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-200"
      style={{
        opacity: visible ? 1 : 0,
        background: 'var(--color-blanket-blanket)',
        backdropFilter: visible ? 'blur(2px)' : 'none',
      }}
      aria-hidden={!visible}
    >
      <div
        key={visible ? 'on' : 'off'}
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
      >
        <span
          style={{
            color: 'var(--color-icon-primary)',
            animation: visible
              ? 'pulse-once 1200ms ease-in-out 1 both'
              : undefined,
          }}
        >
          <CoreIntelligenceIcon size={56} />
        </span>
        <p
          className="text-[14px] leading-[21px]"
          style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
        >
          Drop to autofill
        </p>
      </div>
    </div>
  )
}
