import React from 'react';

import NoteRangesIndicator from '../../NoteRangesIndicator';

import styles from './NoteRanges.module.scss';

import EmbeddableVerseCell from '@/components/QuranReader/TranslationView/EmbeddableVerseCell';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';
import { parseVerseRange } from '@/utils/verseKeys';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';

type Props = {
  ranges: string[];
};

/**
 * A component that will be used to display the ranges of a note.
 * And also a ranges selector in the future.
 *
 * @param {React.FC<Props>} param
 * @returns {React.ReactElement<any, any>}
 */
const NoteRanges: React.FC<Props> = ({ ranges }: Props) => {
  const onOpenChange = (isCollapseOpen: boolean) => {
    if (isCollapseOpen) {
      logEvent('note_range_collapse_opened');
    } else {
      logEvent('note_range_collapse_closed');
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
          // TODO: ranges[0] is temporary and assumes that a note has only one range and 1 Ayah inside that range
          const [{ chapter, verse }] = parseVerseRange(ranges[0]);

          return <EmbeddableVerseCell chapterId={Number(chapter)} verseNumber={Number(verse)} />;
        }}
      </Collapsible>
    </div>
  );
};

export default NoteRanges;
