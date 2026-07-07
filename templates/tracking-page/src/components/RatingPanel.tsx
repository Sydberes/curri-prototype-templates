import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, CheckCircle } from '@phosphor-icons/react'

type Props = {
  driverName: string
  driverAvatarSrc: string
  onSubmit: (rating: number, comment: string) => void
  submitted: boolean
  submittedRating?: number
}

const POSITIVE_TAGS = [
  'On time',
  'Friendly',
  'Careful with cargo',
  'Great communication',
  'Easy to find',
]

const NEGATIVE_TAGS = [
  'Late arrival',
  'Hard to communicate',
  'Cargo issue',
  'Missed instructions',
  'Hard to find me',
]

function tagsForRating(rating: number) {
  return rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS
}

export function RatingPanel({
  driverName,
  driverAvatarSrc,
  onSubmit,
  submitted,
  submittedRating,
}: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())

  // Drop selected tags when the user switches between positive/negative ranges
  function handleRatingChange(next: number) {
    const switchingSentiment =
      (rating >= 4 && next < 4) || (rating < 4 && next >= 4 && rating > 0)
    if (switchingSentiment) setActiveTags(new Set())
    setRating(next)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col items-start gap-2 w-full rounded-md"
        style={{
          padding: 'var(--spacing-md, 16px)',
          background: 'var(--color-elevation-surface-raised)',
          border: '0.5px solid var(--color-border-primary)',
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle
            weight="fill"
            size={16}
            style={{ color: 'var(--color-icon-success)' }}
          />
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body-base, 14px)',
              lineHeight: 'var(--leading-body-base, 18px)',
              fontWeight: 'var(--font-weight-heading-semi-bold, 600)',
            }}
          >
            Thanks for the feedback
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              weight="fill"
              size={14}
              style={{
                color:
                  i < (submittedRating ?? 0)
                    ? 'var(--color-icon-warning)'
                    : 'var(--color-icon-disabled)',
              }}
            />
          ))}
        </div>
        <span
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-body-medium, 12px)',
            lineHeight: 'var(--leading-body-medium, 16px)',
            fontWeight: 500,
          }}
        >
          Curri will share this with {driverName.split(' ')[0]} and use it to
          improve future matches.
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex flex-col gap-4 w-full rounded-md"
      style={{
        padding: 'var(--spacing-md, 16px)',
        background: 'var(--color-elevation-surface-raised)',
        border: '0.5px solid var(--color-border-primary)',
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src={driverAvatarSrc}
          alt=""
          className="rounded-full object-cover"
          style={{ width: 32, height: 32 }}
        />
        <div className="flex flex-col">
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body-base, 14px)',
              lineHeight: 'var(--leading-body-base, 18px)',
              fontWeight: 'var(--font-weight-heading-semi-bold, 600)',
            }}
          >
            How was {driverName.split(' ')[0]}?
          </span>
          <span
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-body-medium, 12px)',
              lineHeight: 'var(--leading-body-medium, 16px)',
              fontWeight: 500,
            }}
          >
            Rate this delivery
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const v = i + 1
          const filled = v <= (hover || rating)
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleRatingChange(v)}
              onMouseEnter={() => setHover(v)}
              className="p-0.5"
              aria-label={`${v} star${v === 1 ? '' : 's'}`}
            >
              <Star
                weight={filled ? 'fill' : 'regular'}
                size={20}
                style={{
                  color: filled
                    ? 'var(--color-icon-warning)'
                    : 'var(--color-icon-tertiary)',
                  transition: 'color 140ms ease-out',
                }}
              />
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mb-3 pt-1">
              {tagsForRating(rating).map((tag) => {
                const active = activeTags.has(tag)
                const isPositive = rating >= 4
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setActiveTags((prev) => {
                        const next = new Set(prev)
                        if (next.has(tag)) next.delete(tag)
                        else next.add(tag)
                        return next
                      })
                    }}
                    className="tp-action-btn inline-flex items-center"
                    style={{
                      height: 22,
                      padding: '0 8px',
                      borderRadius: 16,
                      background: active
                        ? isPositive
                          ? 'var(--color-background-accent-hivis-subtle-hover)'
                          : 'var(--color-background-neutral-bold)'
                        : 'var(--color-background-neutral-primary)',
                      border: `0.5px solid ${
                        active
                          ? isPositive
                            ? 'var(--color-icon-accent-hivis)'
                            : 'var(--color-background-neutral-bold)'
                          : 'var(--color-border-primary)'
                      }`,
                      color: active
                        ? isPositive
                          ? 'var(--color-icon-accent-hivis)'
                          : 'var(--color-text-primary-inverse)'
                        : 'var(--color-text-primary)',
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: '16px',
                      whiteSpace: 'nowrap',
                      boxShadow: active
                        ? 'none'
                        : '0 0.5px 1px rgba(0,0,0,0.06)',
                    }}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note (optional)"
              rows={2}
              className="w-full p-2 outline-none rounded-md resize-none"
              style={{
                background: 'var(--color-elevation-surface-sunken)',
                border: '0.5px solid var(--color-border-primary)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-body-base, 14px)',
                lineHeight: 'var(--leading-body-base, 18px)',
                fontWeight: 400,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <span
          style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--text-body-medium, 12px)',
            lineHeight: 'var(--leading-body-medium, 16px)',
            fontWeight: 500,
          }}
        >
          {rating > 0 ? `${rating} of 5 stars` : 'Tap a star to rate'}
        </span>
        <button
          type="button"
          disabled={rating === 0}
          onClick={() => {
            const tagString = Array.from(activeTags).join(', ')
            const fullComment = [tagString, comment.trim()]
              .filter(Boolean)
              .join(' · ')
            onSubmit(rating, fullComment)
          }}
          className="tp-action-btn tp-action-primary h-7 px-2.5 rounded-[4px] flex items-center gap-1 text-[12px] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            color: 'var(--color-text-brand-button)',
            fontWeight: 500,
            lineHeight: '18px',
          }}
        >
          Submit
        </button>
      </div>
    </motion.div>
  )
}
