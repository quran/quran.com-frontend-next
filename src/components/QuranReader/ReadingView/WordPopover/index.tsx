import React, { useState } from 'react';

import { useDispatch } from 'react-redux';

import ReadingViewWordActionsMenu from '../WordActionsMenu';

import styles from './WordPopover.module.scss';

import Popover, { ContentSide } from 'src/components/dls/Popover';
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

  const onOpenChange = (isOpen: boolean) => {
    setIsTooltipOpened(isOpen);
    // eslint-disable-next-line i18next/no-literal-string
    logEvent(`reading_view_overflow_menu_${isOpen ? 'open' : 'close'}`);
    dispatch(setReadingViewSelectedVerseKey(isOpen ? word.verseKey : null));
  };

  const onHoverChange = (isHovering: boolean) => {
    dispatch(setReadingViewHoveredVerseKey(isHovering ? word.verseKey : null));
  };

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
    >
      <ReadingViewWordActionsMenu word={word} />
    </Popover>
  );
};

export default ReadingViewWordPopover;
