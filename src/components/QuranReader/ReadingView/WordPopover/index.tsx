import React from 'react';

import { useDispatch } from 'react-redux';

import ReadingViewWordActionsMenu from '../WordActionsMenu';

import Popover, { ContentSide } from 'src/components/dls/Popover';
import {
  setReadingViewClickedVerseKey,
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
    dispatch(setReadingViewClickedVerseKey(isOpen ? word.verseKey : null));
  };

  const onHoverChange = (isHovering = true) => {
    dispatch(setReadingViewHoveredVerseKey(isHovering ? word.verseKey : null));
  };

  return (
    <Popover
      contentSide={ContentSide.TOP}
      trigger={
        <div
          onMouseEnter={() => {
            onHoverChange();
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
      open={open}
      useTooltipStyles
      onOpenChange={onOpenChange}
    >
      <ReadingViewWordActionsMenu word={word} />
    </Popover>
  );
};

export default ReadingViewWordPopover;
