'use client';

import { forwardRef } from 'react';
import { Minus } from 'lucide-react';
import { ChangelogEntry } from './types';

interface ChangelogNotificationProps {
  entry: ChangelogEntry;
  onOpen: () => void;
  onDismiss: () => void;
  withPreview?: boolean;
}

export const ChangelogNotification = forwardRef<HTMLDivElement, ChangelogNotificationProps>(
  function ChangelogNotification({ entry, onOpen, onDismiss, withPreview = false }, ref) {
    const firstFeature = entry.features[0];
    const previewSrc =
      withPreview && firstFeature?.media?.[0]?.type === 'image'
        ? firstFeature.media[0].src
        : null;

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === 'Enter' && onOpen()}
        className="relative inline-flex flex-col w-[200px] rounded-sm border border-border bg-surface shadow-overlay overflow-hidden cursor-pointer hover:bg-surface-hover transition-colors"
      >
        {previewSrc && (
          <div className="w-full h-32 overflow-hidden">
            <img
              src={previewSrc}
              alt={firstFeature.media![0].alt ?? firstFeature.title}
              className="w-full object-cover object-top bg-surface-base"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-body-medium text-foreground-tertiary">What's new</span>
            <span className="text-body-base font-semibold text-foreground leading-snug">
              {firstFeature?.title}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            aria-label="Dismiss"
            className="inline-flex items-center justify-center p-0 shrink-0 rounded-xs text-foreground-tertiary hover:text-foreground transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
);
