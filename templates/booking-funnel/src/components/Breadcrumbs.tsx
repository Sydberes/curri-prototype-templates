import { CaretRight } from '@phosphor-icons/react'

export type Step = 'Stops' | 'Vehicles' | 'Timing' | 'Orders' | 'Info' | 'Review'

export function Breadcrumbs({
  steps,
  current,
  onSelect,
}: {
  steps: Step[]
  current: Step
  onSelect: (s: Step) => void
}) {
  return (
    <nav className="flex items-center gap-1">
      {steps.map((step, idx) => {
        const isActive = step === current
        return (
          <span key={step} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(step)}
              className="text-[10px] leading-[14px]"
              style={{
                color: isActive
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-tertiary)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {step}
            </button>
            {idx < steps.length - 1 && (
              <CaretRight
                size={12}
                weight="regular"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            )}
          </span>
        )
      })}
    </nav>
  )
}
