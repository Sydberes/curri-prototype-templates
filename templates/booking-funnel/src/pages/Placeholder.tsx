import { CaretLeft } from '@phosphor-icons/react'

export function Placeholder({
  title,
  onNext,
  onBack,
}: {
  title: string
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-6 pt-6 pb-24">
        <h1
          className="text-[24px] leading-[30px] tracking-[-0.48px] mb-4"
          style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
        >
          {title}
        </h1>
        <p
          className="text-[14px] leading-[21px]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Step placeholder — to be designed.
        </p>
      </div>

      <div className="absolute bottom-3 left-6 right-6 pointer-events-none">
        <div
          className="pointer-events-auto h-[53px] rounded flex items-center px-4 gap-4 border"
          style={{
            background: 'var(--color-elevation-surface-overlay)',
            borderColor: 'var(--color-border-primary)',
            boxShadow: 'var(--shadow-elevation-overlay)',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-7 h-7 flex items-center justify-center rounded"
            style={{ color: 'var(--color-icon-secondary)' }}
          >
            <CaretLeft size={14} />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onNext}
            className="h-7 px-4 rounded text-[14px] leading-[20px]"
            style={{
              background: 'var(--color-background-brand-primary)',
              color: 'var(--color-text-brand-button)',
              fontWeight: 500,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
