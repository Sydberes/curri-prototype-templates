'use client';

import { useRef } from 'react';
import { ChangelogPanel } from '../components/changelog/ChangelogPanel';
import { ChangelogNotification } from '../components/changelog/ChangelogNotification';
import { useChangelog } from '../hooks/useChangelog';

export default function ChangelogDemo() {
  const { entries, isLoading, isNotifVisible, isPanelOpen, openPanel, closePanel, dismissNotification } =
    useChangelog();

  const notifTextRef = useRef<HTMLDivElement>(null);
  const notifImageRef = useRef<HTMLDivElement>(null);
  const activeNotifRef = useRef<HTMLDivElement | null>(null);

  const openFrom = (ref: React.RefObject<HTMLDivElement>) => {
    activeNotifRef.current = ref.current;
    openPanel();
  };

  const latestEntry = entries[0];

  return (
    <main className="min-h-screen bg-surface-sunken flex flex-col items-center justify-center gap-10 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-heading-small font-semibold text-foreground mb-1">Changelog component</h1>
        <p className="text-body-base text-foreground-tertiary">
          Interactive handoff. Keyboard: ← → to navigate entries, Esc to close.
        </p>
      </div>

      <div className="flex flex-col gap-8 items-center w-full max-w-sm">
        {!isLoading && latestEntry && (
          <>
            <div className="flex flex-col gap-2 items-center w-full">
              <span className="text-body-medium font-medium text-foreground-tertiary uppercase tracking-wide">
                Notification — text only
              </span>
              {isNotifVisible ? (
                <ChangelogNotification
                  ref={notifTextRef}
                  entry={latestEntry}
                  onOpen={() => openFrom(notifTextRef)}
                  onDismiss={dismissNotification}
                />
              ) : (
                <button
                  onClick={() => { localStorage.removeItem('curri_changelog_last_seen'); window.location.reload(); }}
                  className="text-body-medium text-foreground-tertiary hover:text-foreground underline"
                >
                  Restore notification
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 items-center w-full">
              <span className="text-body-medium font-medium text-foreground-tertiary uppercase tracking-wide">
                Notification — with image preview
              </span>
              {isNotifVisible ? (
                <ChangelogNotification
                  ref={notifImageRef}
                  entry={latestEntry}
                  onOpen={() => openFrom(notifImageRef)}
                  onDismiss={dismissNotification}
                  withPreview
                />
              ) : (
                <button
                  onClick={() => { localStorage.removeItem('curri_changelog_last_seen'); window.location.reload(); }}
                  className="text-body-medium text-foreground-tertiary hover:text-foreground underline"
                >
                  Restore notification
                </button>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => {
            activeNotifRef.current = null;
            openPanel();
          }}
          className="px-[var(--spacing-md)] py-[var(--spacing-button-height)] text-body-medium border border-border rounded-xs bg-surface text-foreground hover:bg-surface-hover transition-colors shadow-raised"
        >
          Open full changelog panel
        </button>
      </div>

      <ChangelogPanel
        entries={entries}
        isOpen={isPanelOpen}
        onClose={closePanel}
        notifRef={activeNotifRef}
      />
    </main>
  );
}
