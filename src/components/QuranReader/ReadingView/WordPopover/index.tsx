import React, { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';

import PopoverMenu, { PopoverMenuExpandDirection } from '@/components/dls/PopoverMenu/PopoverMenu';
import ReadingViewWordActionsMenu from '@/components/QuranReader/ReadingView/WordActionsMenu';
import {
  setReadingViewHoveredVerseKey,
  setReadingViewSelectedVerseKey,
} from '@/redux/slices/QuranReader/readingViewVerse';
import { logEvent } from '@/utils/eventLogger';
import Verse from 'types/Verse';
import Word from 'types/Word';

const ShareQuranModal = dynamic(
  () => import('@/components/QuranReader/ReadingView/ShareQuranModal'),
  { ssr: false },
);

type Props = {
  word?: Word;
  verse?: Verse;
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  bookmarksRangeUrl?: string | null;
};

/**
 * Popover for word/verse actions in reading view.
 * Accepts either a Word (extracts verse from it) or a Verse directly.
 *
 * @returns {React.ReactElement} The popover component wrapping children
 */
const ReadingViewWordPopover: React.FC<Props> = ({
  word,
  verse: verseProp,
  children,
  onOpenChange,
  bookmarksRangeUrl,
}) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const dispatch = useDispatch();

  // Use verse prop directly if provided, otherwise extract from word
  const verse = verseProp || word?.verse;
  const verseKey = verse?.verseKey || word?.verseKey;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpened(isOpen);
      logEvent(`reading_view_overflow_menu_${isOpen ? 'open' : 'close'}`);
      dispatch(setReadingViewSelectedVerseKey(isOpen ? verseKey : null));

      if (isOpen && onOpenChange) {
        onOpenChange(isOpen);
      }
    },
    [dispatch, verseKey, onOpenChange],
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
