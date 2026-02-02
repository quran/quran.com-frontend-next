import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { logErrorToSentry } from '@/lib/sentry';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type UsePendingVerseSelectionProps = {
  lastReadVerseKey?: string;
  onAfterNavigationItemRouted?: () => void;
};

// Only used when Redux does NOT match the pending verse.
// If the delta is small, keep the pending highlight to avoid jumpy UI.
const VERSE_PROXIMITY_THRESHOLD = 3;

const parseVerseKey = (verseKey?: string) => {
  if (!verseKey) return null;
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const parsedVerseNumber = Number(verseNumber);
  if (!chapterId || Number.isNaN(parsedVerseNumber)) return null;
  return { chapterId, verseNumber: parsedVerseNumber };
};

// Keep a temporary selection while navigation is settling.
const usePendingVerseSelection = ({
  lastReadVerseKey,
  onAfterNavigationItemRouted,
}: UsePendingVerseSelectionProps) => {
  const router = useRouter();

  // Local pending selection + navigation flag.
  const [pendingSelectedVerseKey, setPendingSelectedVerseKey] = useState<string | null>(null);
  const [isNavigationPending, setIsNavigationPending] = useState(false);
  const hasReachedNearbyRef = useRef(false);

  useEffect(() => {
    hasReachedNearbyRef.current = false;
  }, [pendingSelectedVerseKey]);

  useEffect(() => {
    if (!pendingSelectedVerseKey || isNavigationPending || !lastReadVerseKey) return;
    if (lastReadVerseKey === pendingSelectedVerseKey) {
      setPendingSelectedVerseKey(null);
      return;
    }

    const pendingParsed = parseVerseKey(pendingSelectedVerseKey);
    const lastReadParsed = parseVerseKey(lastReadVerseKey);
    if (!pendingParsed || !lastReadParsed) {
      setPendingSelectedVerseKey(null);
      return;
    }

    if (pendingParsed.chapterId !== lastReadParsed.chapterId) {
      setPendingSelectedVerseKey(null);
      return;
    }

    // Mismatch within the same chapter: use a proximity threshold to avoid flicker.
    const verseDelta = Math.abs(lastReadParsed.verseNumber - pendingParsed.verseNumber);
    if (verseDelta <= VERSE_PROXIMITY_THRESHOLD) {
      hasReachedNearbyRef.current = true;
      return;
    }

    if (hasReachedNearbyRef.current) {
      // Once we've been nearby, a larger delta means the user moved on.
      setPendingSelectedVerseKey(null);
    }
  }, [isNavigationPending, lastReadVerseKey, pendingSelectedVerseKey]);

  // Function to navigate to a given href and handle post-navigation actions.
  const navigateAndHandleAfterNavigation = useCallback(
    async (href: string) => {
      setIsNavigationPending(true);
      try {
        await router.push(href, undefined, {
          shallow: false, // Use shallow: false to ensure full page reload and proper state synchronization
        });
        if (onAfterNavigationItemRouted) {
          onAfterNavigationItemRouted();
        }
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: 'navigateAndHandleAfterNavigation',
          metadata: { href },
        });

        // As a fallback, we can use window.location
        window.location.href = href;
      } finally {
        // Clear the pending state when navigation completes or errors.
        setIsNavigationPending(false);
      }
    },
    [onAfterNavigationItemRouted, router],
  );

  return {
    pendingSelectedVerseKey,
    setPendingSelectedVerseKey,
    navigateAndHandleAfterNavigation,
  };
};

export default usePendingVerseSelection;
