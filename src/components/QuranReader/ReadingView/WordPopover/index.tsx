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
  const [onStart, onEnd] = useLongPress(onLongPress);
  const onHoverChange = (isHovering: boolean) => {
    dispatch(setReadingViewHoveredVerseKey(isHovering ? word.verseKey : null));
  };

  const onActionTriggered = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Popover
      contentSide={ContentSide.TOP}
      contentSideOffset={-10}
      trigger={
        <div
          onMouseEnter={() => {
            onHoverChange(true);
          }}
          onMouseLeave={() => {
            onHoverChange(false);
          }}
          onTouchStart={onStart}
          onTouchEnd={onEnd}
        >
          {children}
        </div>
      }
      tip
      isModal
      portalled={false}
      contentStyles={styles.content}
      open={isTooltipOpened}
      onOpenChange={onOpenChange}
      triggerStyles={styles.trigger}
    >
      <ReadingViewWordActionsMenu word={word} onActionTriggered={onActionTriggered} />
    </Popover>
  );
};

export default ReadingViewWordPopover;
