import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import QueryParam from '@/types/QueryParam';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

export enum OverlayType {
  TAFSIRS = 'tafsirs',
  REFLECTIONS = 'reflections',
  LESSONS = 'lessons',
  ANSWERS = 'answers',
}

interface UseOverlayModalOptions {
  verseKey: string;
  overlayType: OverlayType;
}

interface UseOverlayModalReturn {
  isOpen: boolean;
  open: (url: string) => void;
  close: () => void;
}

/**
 * Centralized hook for managing overlay modals across reading and translation modes.
 * Handles URL synchronization and ensures only the correct verse's modal opens.
 *
 * @param {UseOverlayModalOptions} options - Hook options
 * @returns {UseOverlayModalReturn} Modal state and control functions
 */
export const useOverlayModal = ({
  verseKey,
  overlayType,
}: UseOverlayModalOptions): UseOverlayModalReturn => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  // Auto-open modal if overlay query param matches this verse
  useEffect(() => {
    const { overlay, startingVerse } = router.query;

    // Reflections and lessons share the same modal, so treat them as equivalent
    const overlayMatches =
      overlay === overlayType ||
      (overlayType === OverlayType.REFLECTIONS && overlay === OverlayType.LESSONS) ||
      (overlayType === OverlayType.LESSONS && overlay === OverlayType.REFLECTIONS);

    const verseMatches = String(startingVerse) === String(verseNumber);

    if (overlayMatches && verseMatches) {
      setIsOpen(true);
    } else if (isOpen && !overlayMatches) {
      // Close if overlay param is removed or changed to different type
      setIsOpen(false);
    }
    // Only query params as deps - overlayType/verseNumber are stable, isOpen would cause loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.overlay, router.query.startingVerse]);

  const open = (url: string) => {
    setIsOpen(true);
    router.push(url, undefined, { shallow: true });
  };

  const close = () => {
    setIsOpen(false);

    // Remove overlay-related query params
    const newQuery = { ...router.query };
    delete newQuery[QueryParam.OVERLAY];
    delete newQuery[QueryParam.TAFSIR_ID];
    delete newQuery[QueryParam.QUESTION_ID];

    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true },
    );
  };

  return { isOpen, open, close };
};
