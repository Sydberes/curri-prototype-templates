'use client';

import { useRef, useState } from 'react';
import { ChangelogNotification } from '../../components/changelog/ChangelogNotification';
import { ChangelogPanel } from '../../components/changelog/ChangelogPanel';
import { changelogEntries } from '../../data/changelog-entries';

export default function MockupPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const activeNotifRef = useRef<HTMLDivElement | null>(null);

  const latestEntry = changelogEntries[0];

  const handleOpen = () => {
    activeNotifRef.current = notifRef.current;
    setPanelOpen(true);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100 select-none">
      {/* App screenshot as base */}
      <img
        src="/app-screenshot.png"
        alt="Curri app"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
        draggable={false}
      />

      {/* Notification anchored to bottom-left of sidebar, above Log out */}
      <div className="absolute bottom-[228px] left-2">
        <ChangelogNotification
          ref={notifRef}
          entry={latestEntry}
          onOpen={handleOpen}
          onDismiss={() => {}}
        />
      </div>

      <ChangelogPanel
        entries={changelogEntries}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        notifRef={activeNotifRef}
      />
    </div>
  );
}
