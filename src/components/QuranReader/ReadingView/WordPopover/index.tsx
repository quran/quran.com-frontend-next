import React, { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';

import PopoverMenu, {
  PopoverMenuAlign,
  PopoverMenuExpandDirection,
} from '@/components/dls/PopoverMenu/PopoverMenu';
import ReadingViewWordActionsMenu from '@/components/QuranReader/ReadingView/WordActionsMenu';
import {
  setReadingViewHoveredVerseKey,
  setReadingViewSelectedVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';

const ShareQuranModal = dynamic(
  () => import('@/components/QuranReader/ReadingView/ShareQuranModal'),
  { ssr: false },
);

type Props = {
  verse?: Verse;
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  isOpen?: boolean;
  bookmarksRangeUrl?: string | null;
};

/**
 * Popover for word/verse actions in reading view.
 *
 * @returns {React.ReactElement} The popover component wrapping children
 */
const ReadingViewWordPopover: React.FC<Props> = ({
  verse,
  children,
  onOpenChange,
  isOpen: isOpenProp,
  bookmarksRangeUrl,
}) => {
  const [isMenuOpenedInternal, setIsMenuOpenedInternal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const dispatch = useDispatch();

  // Use controlled state if provided, otherwise use internal state
  const isMenuOpened = isOpenProp !== undefined ? isOpenProp : isMenuOpenedInternal;

  const verseKey = verse?.verseKey;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      // Only update internal state if not controlled
      if (isOpenProp === undefined) {
        setIsMenuOpenedInternal(isOpen);
      }
      logEvent(`reading_view_overflow_menu_${isOpen ? 'open' : 'close'}`);
      dispatch(setReadingViewSelectedVerseKey(isOpen ? verseKey : null));

      if (onOpenChange) {
        onOpenChange(isOpen);
      }
    },
    [dispatch, verseKey, onOpenChange, isOpenProp],
  );

  const onHoverChange = useCallback(
    (isHovering: boolean) => {
      dispatch(setReadingViewHoveredVerseKey(isHovering ? verseKey : null));
    },
    [dispatch, verseKey],
  );
  const onActionTriggered = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const onCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const openShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const onMouseEnter = useCallback(() => {
    onHoverChange(true);
  }, [onHoverChange]);

  const onMouseLeave = useCallback(() => {
    onHoverChange(false);
  }, [onHoverChange]);

  if (!verse) return <>{children}</>;

  return (
    <>
      <PopoverMenu
        trigger={
          <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {children}
          </span>
        }
        isOpen={isMenuOpened}
        onOpenChange={handleOpenChange}
        expandDirection={PopoverMenuExpandDirection.BOTTOM}
        align={PopoverMenuAlign.START}
        sideOffset={4}
      >
        <ReadingViewWordActionsMenu
          verse={verse}
          onActionTriggered={onActionTriggered}
          openShareModal={openShareModal}
          bookmarksRangeUrl={bookmarksRangeUrl}
        />
      </PopoverMenu>
      <ShareQuranModal isOpen={isShareModalOpen} onClose={onCloseShareModal} verse={verse} />
    </>
  );
};

export default ReadingViewWordPopover;
