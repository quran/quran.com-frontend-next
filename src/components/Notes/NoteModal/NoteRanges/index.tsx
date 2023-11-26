import React from 'react';

import NoteRangesIndicator from '../NoteRangesIndicator';
import { parseNoteRanges } from '../utils/ranges';

import styles from './NoteRanges.module.scss';

import EmbeddableVerseCell from '@/components/QuranReader/TranslationView/EmbeddableVerseCell';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';

type Props = {
  ranges: string[];
  noteId: string;
};

/**
 * A component that will be used to display the ranges of a note.
 * And also a ranges selector in the future.
 *
 * @param {React.FC<Props>} param
 * @returns {React.ReactElement<any, any>}
 */
const NoteRanges: React.FC<Props> = ({ ranges, noteId }: Props) => {
  const onOpenChange = (isCollapseOpen: boolean) => {
    const eventData = {
      noteId,
    };
    if (isCollapseOpen) {
      logEvent('note_range_collapse_opened', eventData);
    } else {
      logEvent('note_range_collapse_closed', eventData);
    }
  };
  return (
    <div className={styles.container}>
      <Collapsible
        title={
          <div className={styles.headerContainer}>
            <NoteRangesIndicator ranges={ranges} />
          </div>
        }
        prefix={<ChevronDownIcon />}
        shouldRotatePrefixOnToggle
        onOpenChange={onOpenChange}
      >
        {({ isOpen: isOpenRenderProp }) => {
          if (!isOpenRenderProp) return null;
          const [, chapterId, verseNumber] = parseNoteRanges(ranges);

          return <EmbeddableVerseCell chapterId={chapterId} verseNumber={verseNumber} />;
        }}
      </Collapsible>
    </div>
  );
};

export default NoteRanges;
