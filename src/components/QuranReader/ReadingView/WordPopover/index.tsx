import React, { useState, useCallback } from 'react';

import { useDispatch } from 'react-redux';

import ReadingViewWordActionsMenu from '../WordActionsMenu';

import styles from './WordPopover.module.scss';

import Popover, { ContentSide } from 'src/components/dls/Popover';
import useLongPress from 'src/hooks/useLongPress';
import {
  setReadingViewSelectedVerseKey,
  setReadingViewHoveredVerseKey,
} from 'src/redux/slices/QuranReader/readingViewVerse';
import { logEvent } from 'src/utils/eventLogger';
import Word from 'types/Word';

type Props = {
  word: Word;
};

const ReadingViewWordPopover: React.FC<Props> = ({ word, children }) => {
  const [isTooltipOpened, setIsTooltipOpened] = useState(false);
  const dispatch = useDispatch();

  const onOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsTooltipOpened(isOpen);
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`reading_view_overflow_menu_${isOpen ? 'open' : 'close'}`);
      dispatch(setReadingViewSelectedVerseKey(isOpen ? word.verseKey : null));
    },
    [dispatch, word.verseKey],
  );

  const onLongPress = useCallback(() => {
    onOpenChange(true);
  }, [onOpenChange]);
  const [onTouchStart, onTouchEnd] = useLongPress(onLongPress);
  const onHoverChange = useCallback(
    (isHovering: boolean) => {
      dispatch(setReadingViewHoveredVerseKey(isHovering ? word.verseKey : null));
    },
    [dispatch, word.verseKey],
  );
  const onActionTriggered = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const onMouseEnter = useCallback(() => {
    onHoverChange(true);
  }, [onHoverChange]);

  const onMouseLeave = useCallback(() => {
    onHoverChange(false);
  }, [onHoverChange]);

  const onTouchMove = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Popover
      contentSide={ContentSide.TOP}
      contentSideOffset={-10}
      trigger={
        <div
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchMove={onTouchMove}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {children}
        </div>
      }
      tip
      isModal
      portalled
      contentStyles={styles.content}
      open={isTooltipOpened}
      onOpenChange={onOpenChange}
      triggerStyles={styles.trigger}
      defaultStyling={false}
    >
      <ReadingViewWordActionsMenu word={word} onActionTriggered={onActionTriggered} />
    </Popover>
  );
};

export default ReadingViewWordPopover;
