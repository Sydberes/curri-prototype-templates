'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChangelogEntry } from '../components/changelog/types';

const STORAGE_KEY = 'curri_changelog_last_seen';

interface UseChangelogReturn {
  entries: ChangelogEntry[];
  isLoading: boolean;
  isNotifVisible: boolean;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  dismissNotification: () => void;
}

export function useChangelog(): UseChangelogReturn {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  useEffect(() => {
    setLastSeenId(localStorage.getItem(STORAGE_KEY));
  }, []);

  useEffect(() => {
    fetch('/api/changelog')
      .then((r) => r.json())
      .then((data: ChangelogEntry[]) => setEntries(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const markSeen = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setLastSeenId(id);
  }, []);

  const latestId = entries[0]?.id ?? null;
  const isNotifVisible = !isLoading && latestId !== null && latestId !== lastSeenId;

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const dismissNotification = useCallback(() => {
    if (latestId) markSeen(latestId);
  }, [latestId, markSeen]);

  return {
    entries,
    isLoading,
    isNotifVisible,
    isPanelOpen,
    openPanel,
    closePanel,
    dismissNotification,
  };
}
