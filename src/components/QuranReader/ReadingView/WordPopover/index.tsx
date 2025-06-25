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
import Word from 'types/Word';

const ShareQuranModal = dynamic(
  () => import('@/components/QuranReader/ReadingView/ShareQuranModal'),
  { ssr: false },
);

type Props = {
  word: Word;
  children: React.ReactNode;
};

const ReadingViewWordPopover: React.FC<Props> = ({ word, children }) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const dispatch = useDispatch();

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpened(isOpen);
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`reading_view_overflow_menu_${isOpen ? 'open' : 'close'}`);
      dispatch(setReadingViewSelectedVerseKey(isOpen ? word.verseKey : null));
    },
    [dispatch, word.verseKey],
  );

  const onHoverChange = useCallback(
    (isHovering: boolean) => {
      dispatch(setReadingViewHoveredVerseKey(isHovering ? word.verseKey : null));
    },
    [dispatch, word.verseKey],
  );
  const onActionTriggered = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

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

  return (
    <>
      <PopoverMenu
        trigger={
          <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {children}
          </div>
        }
        isOpen={isMenuOpened}
        onOpenChange={onOpenChange}
        expandDirection={PopoverMenuExpandDirection.BOTTOM}
      >
        <ReadingViewWordActionsMenu
          word={word}
          onActionTriggered={onActionTriggered}
          openShareModal={openShareModal}
        />
      </PopoverMenu>
      <ShareQuranModal isOpen={isShareModalOpen} onClose={onCloseShareModal} verse={word.verse} />
    </>
  );
};

export default ReadingViewWordPopover;
