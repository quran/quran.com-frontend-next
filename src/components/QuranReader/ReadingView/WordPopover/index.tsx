import React from 'react';

import { useDispatch } from 'react-redux';

import ReadingViewWordActionsMenu from '../WordActionsMenu';

import styles from './WordPopover.module.scss';

import Popover, { ContentSide } from 'src/components/dls/Popover';
import {
  setReadingViewSelectedVerseKey,
  setReadingViewHoveredVerseKey,
} from 'src/redux/slices/QuranReader/readingViewVerse';
import Word from 'types/Word';

type Props = {
  word: Word;
  open: boolean;
  setIsTooltipOpened: (isOpen: boolean) => void;
};

const ReadingViewWordPopover: React.FC<Props> = ({ word, open, children, setIsTooltipOpened }) => {
  const dispatch = useDispatch();
  const onOpenChange = (isOpen: boolean) => {
    setIsTooltipOpened(isOpen);
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
      open={open}
      onOpenChange={onOpenChange}
    >
      <ReadingViewWordActionsMenu word={word} />
    </Popover>
  );
};

export default ReadingViewWordPopover;
