import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Minus,
  PaperPlaneTilt,
  Smiley,
  Paperclip,
} from '@phosphor-icons/react'

type Message = {
  id: string
  from: 'driver' | 'me'
  text: string
  time: string
}

const SEED_MESSAGES: Message[] = [
  {
    id: 'm1',
    from: 'driver',
    text: "Hey — finished loading the pipe & fittings at the Burbank dock, heading out now.",
    time: '11:24 AM',
  },
  {
    id: 'm2',
    from: 'me',
    text: 'Thanks Demetrius — Pacific Plumbing has someone at receiving.',
    time: '11:25 AM',
  },
  {
    id: 'm3',
    from: 'driver',
    text: 'Got it. Will text when I’m a few min out from the next stop.',
    time: '11:25 AM',
  },
]

type Props = {
  open: boolean
  onClose: () => void
  /** Mobile: render as a full-width slide-over layer, drag down to dismiss back to tracking. */
  mobile?: boolean
}

export function MessagePanel({ open, onClose, mobile = false }: Props) {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES)
  const [draft, setDraft] = useState('')
  const [minimized, setMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && !minimized) scrollRef.current?.scrollTo({ top: 99999 })
  }, [open, minimized, messages.length])

  function send() {
    const t = draft.trim()
    if (!t) return
    setMessages((prev) => [
      ...prev,
      { id: `m${prev.length + 1}`, from: 'me', text: t, time: nowLabel() },
    ])
    setDraft('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m${prev.length + 1}`,
          from: 'driver',
          text: 'Got it 👍',
          time: nowLabel(),
        },
      ])
    }, 1100)
  }

  // On mobile the panel never minimizes — it's a full layer the user drags
  // back down to dismiss and return to the live tracking sheet underneath.
  const showBody = mobile || !minimized

  return (
    <AnimatePresence>
      {open && (
        <>
          {mobile && (
            <motion.div
              className="fixed inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ background: 'rgba(9, 30, 66, 0.28)', zIndex: 1300 }}
              onClick={onClose}
            />
          )}
          <motion.aside
            initial={mobile ? { y: '100%' } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={mobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={mobile ? { y: '100%' } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: mobile ? 0.32 : 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed flex flex-col overflow-hidden"
            drag={mobile ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (mobile && (info.offset.y > 120 || info.velocity.y > 600)) {
                onClose()
              }
            }}
            style={
              mobile
                ? {
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '88vh',
                    background: 'var(--color-elevation-surface-primary)',
                    borderTop: '0.5px solid var(--color-border-primary)',
                    borderTopLeftRadius: 'var(--radius-sm)',
                    borderTopRightRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-elevation-overlay)',
                    zIndex: 1310,
                  }
                : {
                    right: 16,
                    bottom: 16,
                    width: 360,
                    height: minimized ? 56 : 600,
                    maxHeight: '85vh',
                    background: 'var(--color-elevation-surface-primary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 10,
                    boxShadow:
                      '0 0 0.5px rgba(9, 30, 66, 0.31), 0 12px 32px rgba(9, 30, 66, 0.20)',
                    zIndex: 800,
                  }
            }
          >
            {mobile && <SheetGrabber />}
            <Header
              minimized={minimized}
              onMinimize={() => setMinimized((m) => !m)}
              onClose={onClose}
              mobile={mobile}
            />
            {showBody && (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
                  style={{ background: 'var(--color-elevation-surface-sunken, #f7f7f7)' }}
                >
                  <DayDivider label="Today" />
                  {messages.map((m) => (
                    <Bubble key={m.id} message={m} />
                  ))}
                </div>
                <Composer
                  draft={draft}
                  onChange={setDraft}
                  onSend={send}
                />
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function SheetGrabber() {
  return (
    <div className="shrink-0 flex justify-center pt-2 pb-1">
      <span
        style={{
          width: 36,
          height: 4,
          borderRadius: 999,
          background: 'var(--color-border-bold, #c4c4c4)',
        }}
      />
    </div>
  )
}

function Header({
  minimized,
  onMinimize,
  onClose,
  mobile = false,
}: {
  minimized: boolean
  onMinimize: () => void
  onClose: () => void
  mobile?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 shrink-0"
      style={{
        borderBottom:
          !mobile && minimized
            ? 'none'
            : '0.5px solid var(--color-border-primary)',
        background: 'var(--color-elevation-surface-primary)',
      }}
    >
      <button
        type="button"
        onClick={mobile ? undefined : onMinimize}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
        title={mobile ? undefined : minimized ? 'Expand' : 'Minimize'}
      >
        <div
          className="relative shrink-0"
          style={{ width: 32, height: 32 }}
        >
          <img
            src="https://i.pravatar.cc/96?img=12"
            alt="Driver"
            className="w-full h-full rounded-full object-cover"
          />
          <span
            className="absolute rounded-full"
            style={{
              right: 0,
              bottom: 0,
              width: 10,
              height: 10,
              background: '#009571',
              boxShadow: '0 0 0 2px var(--color-elevation-surface-primary)',
            }}
            aria-label="Active"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="truncate"
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-body-base, 14px)',
              lineHeight: 'var(--leading-body-base, 18px)',
              fontWeight: 'var(--font-weight-heading-semi-bold, 600)',
            }}
          >
            Demetrius J.
          </span>
          <span
            className="truncate"
            style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-body-medium, 12px)',
              lineHeight: 'var(--leading-body-medium, 16px)',
              fontWeight: 500,
            }}
          >
            Active · En route to Harbor Mechanical
          </span>
        </div>
      </button>
      <div className="flex items-center gap-1 shrink-0">
        {!mobile && (
          <IconButton icon={Minus} title="Minimize" onClick={onMinimize} />
        )}
        <IconButton icon={X} title="Close" onClick={onClose} />
      </div>
    </div>
  )
}

function Bubble({ message }: { message: Message }) {
  const mine = message.from === 'me'
  return (
    <div
      className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
      style={{ maxWidth: '100%' }}
    >
      <div
        style={{
          maxWidth: '78%',
          padding: '8px 12px',
          borderRadius: 12,
          borderBottomRightRadius: mine ? 4 : 12,
          borderBottomLeftRadius: mine ? 12 : 4,
          background: mine
            ? 'var(--color-background-neutral-bold)'
            : 'var(--color-elevation-surface-primary)',
          color: mine
            ? 'var(--color-text-primary-inverse)'
            : 'var(--color-text-primary)',
          fontSize: 'var(--text-body-base, 14px)',
          lineHeight: 'var(--leading-body-base, 18px)',
          fontWeight: 400,
          textWrap: 'pretty',
          border: mine
            ? 'none'
            : '0.5px solid var(--color-border-primary)',
          boxShadow: mine ? 'none' : '0 0.5px 1px rgba(0,0,0,0.04)',
        }}
      >
        {message.text}
      </div>
      <span
        style={{
          marginTop: 2,
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-body-small, 10px)',
          lineHeight: 'var(--leading-body-small, 12px)',
          fontWeight: 500,
        }}
      >
        {message.time}
      </span>
    </div>
  )
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div
        className="flex-1 h-px"
        style={{ background: 'var(--color-border-primary)' }}
      />
      <span
        style={{
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-body-small, 10px)',
          fontWeight: 500,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: '14px',
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: 'var(--color-border-primary)' }}
      />
    </div>
  )
}

function Composer({
  draft,
  onChange,
  onSend,
}: {
  draft: string
  onChange: (v: string) => void
  onSend: () => void
}) {
  return (
    <div
      className="shrink-0 flex items-center gap-1 px-2 py-2"
      style={{
        borderTop: '0.5px solid var(--color-border-primary)',
        background: 'var(--color-elevation-surface-primary)',
      }}
    >
      <IconButton icon={Paperclip} title="Attach" />
      <input
        type="text"
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder="Write a message…"
        className="flex-1 outline-none bg-transparent px-1"
        style={{
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-body-base, 14px)',
          lineHeight: 'var(--leading-body-base, 18px)',
          fontWeight: 400,
        }}
      />
      <IconButton icon={Smiley} title="Emoji" />
      <button
        type="button"
        onClick={onSend}
        disabled={!draft.trim()}
        className="tp-action-btn tp-action-primary w-7 h-7 rounded-[4px] flex items-center justify-center disabled:opacity-40"
        style={{
          color: 'var(--color-text-brand-button)',
        }}
        title="Send"
        aria-label="Send"
      >
        <PaperPlaneTilt size={13} weight="fill" />
      </button>
    </div>
  )
}

function IconButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: React.ElementType
  title: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      title={title}
      aria-label={title}
      className="tp-action-btn w-7 h-7 rounded-[4px] flex items-center justify-center"
      style={{
        background: 'transparent',
        color: 'var(--color-icon-tertiary)',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

function nowLabel() {
  const d = new Date()
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}
