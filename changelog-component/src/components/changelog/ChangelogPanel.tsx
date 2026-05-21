'use client';

import { useState, useEffect, useLayoutEffect, useRef, RefObject } from 'react';
import { X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChangelogEntry } from './types';
import { ChangelogFeatureCard } from './ChangelogFeatureCard';

function formatEntryDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ChangelogPanelProps {
  entries: ChangelogEntry[];
  isOpen: boolean;
  onClose: () => void;
  notifRef?: RefObject<HTMLElement | null>;
}

export function ChangelogPanel({ entries, isOpen, onClose, notifRef }: ChangelogPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const [transformOrigin, setTransformOrigin] = useState('center center');

  useLayoutEffect(() => {
    if (!isOpen || !notifRef?.current || !modalRef.current) return;
    const notif = notifRef.current.getBoundingClientRect();
    const modal = modalRef.current.getBoundingClientRect();
    const x = notif.left + notif.width / 2 - modal.left;
    const y = notif.top + notif.height / 2 - modal.top;
    setTransformOrigin(`${x}px ${y}px`);
  }, [isOpen, notifRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) setCurrentIndex((i) => i - 1);
      if (e.key === 'ArrowRight' && currentIndex < entries.length - 1) setCurrentIndex((i) => i + 1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, currentIndex, entries.length, onClose]);

  const entry = entries[currentIndex];
  if (!entry) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < entries.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 flex items-center justify-center',
          'bg-blanket transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="What's new"
          onClick={(e) => e.stopPropagation()}
          style={{ transformOrigin }}
          className={[
            'w-[calc(100vw-2rem)] max-w-[520px] max-h-[80vh]',
            'flex flex-col',
            'bg-surface rounded-m shadow-overlay',
            isOpen
              ? 'transition-[transform,opacity] duration-[350ms] ease-[cubic-bezier(0.34,1.3,0.64,1)] opacity-100 scale-100'
              : 'transition-[transform,opacity] duration-200 ease-in opacity-0 scale-75',
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
            <span className="text-body-base text-foreground-tertiary w-16">
              {formatEntryDate(entry.date)}
            </span>

            <a
              href="https://www.curri.com/blog?category=updates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[var(--spacing-xxs)] whitespace-nowrap rounded-xs border border-solid border-border bg-transparent hover:bg-surface-hover text-foreground text-body-medium font-medium py-[var(--spacing-button-height)] px-[var(--spacing-md)] transition-colors duration-150"
            >
              Releases
              <ArrowUpRight className="w-3 h-3" />
            </a>

            <div className="flex items-center w-16 justify-end">
              <button
                onClick={onClose}
                aria-label="Close changelog"
                className="inline-flex items-center justify-center p-[var(--spacing-button-height)] rounded-xs text-foreground-tertiary hover:text-foreground hover:bg-neutral-secondary border border-solid border-transparent transition-colors duration-150"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {entry.features.map((feature) => (
              <ChangelogFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>

          {/* Pagination footer */}
          {entries.length > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
              <button
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={!hasPrev}
                className="inline-flex items-center gap-[var(--spacing-xxs)] py-[var(--spacing-button-height)] px-[var(--spacing-sm)] rounded-xs text-body-medium text-foreground-tertiary disabled:opacity-30 hover:text-foreground hover:bg-neutral-secondary border border-solid border-transparent transition-colors duration-150"
              >
                <ChevronLeft className="w-3 h-3" />
                Newer
              </button>
              <span className="text-body-medium text-foreground-tertiary">
                {currentIndex + 1} / {entries.length}
              </span>
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={!hasNext}
                className="inline-flex items-center gap-[var(--spacing-xxs)] py-[var(--spacing-button-height)] px-[var(--spacing-sm)] rounded-xs text-body-medium text-foreground-tertiary disabled:opacity-30 hover:text-foreground hover:bg-neutral-secondary border border-solid border-transparent transition-colors duration-150"
              >
                Older
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
