import React from 'react';

import NoteReferenceIndicator from '../../NoteReferenceIndicator';

import styles from './NoteRanges.module.scss';

import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import Link from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { NoteReference } from '@/types/auth/Note';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';

type Props = {
  references: NoteReference[];
};

/**
 * A component that will be used to display the ranges of a note.
 * And also a ranges selector in the future.
 *
 * @param {React.FC<Props>} param
 * @returns {React.ReactElement<any, any>}
 */
const NoteReferences: React.FC<Props> = ({ references }: Props) => {
  const onOpenChange = (isCollapseOpen: boolean) => {
    if (isCollapseOpen) {
      logEvent('note_reference_collapse_opened');
    } else {
      logEvent('note_reference_collapse_closed');
    }
  };

  const onNoteSurahReferenceClicked = () => {
    logButtonClick('note_surah_reference');
  };

  return (
    <>
      {references.map((reference) => {
        const { surahId, fromAyah, toAyah, isSurah } = reference;
        if (isSurah) {
          return (
            <Link
              key={reference.surahId}
              className={styles.verseKey}
              href={`/${surahId}`}
              onClick={onNoteSurahReferenceClicked}
              isNewTab
            >
              <div className={styles.headerContainer}>
                <NoteReferenceIndicator reference={reference} />
              </div>
            </Link>
          );
        }
        return (
          <Collapsible
            key={reference.surahId}
            title={
              <div className={styles.headerContainer}>
                <NoteReferenceIndicator reference={reference} />
              </div>
            }
            prefix={<ChevronDownIcon />}
            shouldRotatePrefixOnToggle
            onOpenChange={onOpenChange}
          >
            {({ isOpen: isOpenRenderProp }) => {
              if (!isOpenRenderProp) return null;
              return <VerseAndTranslation chapter={Number(surahId)} from={fromAyah} to={toAyah} />;
            }}
          </Collapsible>
        );
      })}
    </>
  );
};

export default NoteReferences;
