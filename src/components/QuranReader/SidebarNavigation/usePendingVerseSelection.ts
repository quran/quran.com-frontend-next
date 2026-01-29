import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

type UsePendingVerseSelectionProps = {
  lastReadVerseKey?: string;
  onAfterNavigationItemRouted?: () => void;
};

// A custom hook to manage pending verse selection and navigation.
const usePendingVerseSelection = ({
  lastReadVerseKey,
  onAfterNavigationItemRouted,
}: UsePendingVerseSelectionProps) => {
  const router = useRouter();

  // State to track the pending selected verse key and navigation status.
  const [pendingSelectedVerseKey, setPendingSelectedVerseKey] = useState<string | null>(null);
  const [isNavigationPending, setIsNavigationPending] = useState(false);

  useEffect(() => {
    if (!pendingSelectedVerseKey || isNavigationPending) return;
    if (lastReadVerseKey === pendingSelectedVerseKey) {
      setPendingSelectedVerseKey(null);
    }
  }, [isNavigationPending, lastReadVerseKey, pendingSelectedVerseKey]);

  // Function to navigate to a given href and handle post-navigation actions.
  const navigateAndHandleAfterNavigation = useCallback(
    async (href: string) => {
      setIsNavigationPending(true);
      try {
        await router.push(href, undefined, {
          shallow: false, // Change to false to force a full page reload
        });
        if (onAfterNavigationItemRouted) {
          onAfterNavigationItemRouted();
        }
      } catch {
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
