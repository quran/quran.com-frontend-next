import React, { useCallback, useState, useRef, useEffect } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { useDispatch } from 'react-redux';

import usePopoverPosition from './usePopoverPosition';
import styles from './WordPopover.module.scss';

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
  onOpenChange: (isOpen: boolean) => void;
};

const ReadingViewWordPopover: React.FC<Props> = ({ word, children, onOpenChange }) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const wordRef = useRef<HTMLDivElement>(null);

  const { popoverDirection, hasEnoughHorizontalSpace, marginLeft, marginTop } = usePopoverPosition({
    wordRef,
    containerSelector: '#quran-reader-container',
    isMenuOpened,
  });

  const dispatch = useDispatch();

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsMenuOpened(isOpen);
      logEvent(`reading_view_overflow_menu_${isOpen ? 'open' : 'close'}`);
      dispatch(setReadingViewSelectedVerseKey(isOpen ? word.verseKey : null));

      if (isOpen) {
        onOpenChange(isOpen);
      }
    },
    [dispatch, word.verseKey, onOpenChange],
  );

  const onHoverChange = useCallback(
    (isHovering: boolean) => {
      dispatch(setReadingViewHoveredVerseKey(isHovering ? word.verseKey : null));
    },
    [dispatch, word.verseKey],
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

  useEffect(() => {
    if (isMenuOpened) {
      document.documentElement.style.setProperty('--popover-margin-left', marginLeft);
      document.documentElement.style.setProperty('--popover-margin-top', marginTop);
    }
  }, [marginLeft, marginTop, isMenuOpened]);

  return (
    <>
      <PopoverMenu
        trigger={
          <div
            ref={wordRef}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={styles.popoverContainer}
          >
            {children}
          </div>
        }
        isOpen={isMenuOpened}
        onOpenChange={handleOpenChange}
        expandDirection={popoverDirection}
        contentClassName={
          hasEnoughHorizontalSpace
            ? classNames({
                [styles.leftSidePopover]: popoverDirection === PopoverMenuExpandDirection.LEFT,
                [styles.rightSidePopover]: popoverDirection === PopoverMenuExpandDirection.RIGHT,
              })
            : undefined
        }
      >
        <ReadingViewWordActionsMenu
          word={word}
          onActionTriggered={onActionTriggered}
          openShareModal={openShareModal}
        />
      </PopoverMenu>
      {isShareModalOpen && (
        <ShareQuranModal isOpen={isShareModalOpen} onClose={onCloseShareModal} verse={word.verse} />
      )}
    </>
  );
};

export default ReadingViewWordPopover;
