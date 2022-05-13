import React from 'react';

import ChapterControls from './ChapterControls';
import styles from './EndOfScrollingControls.module.scss';
import JuzControls from './JuzControls';
import PageControls from './PageControls';
import VerseControls from './VerseControls';

import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Verse from 'types/Verse';

interface Props {
  quranReaderDataType: QuranReaderDataType;
  lastVerse: Verse;
  initialData: VersesResponse;
}

const EndOfScrollingControls: React.FC<Props> = ({
  quranReaderDataType,
  lastVerse,
  initialData,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        {quranReaderDataType === QuranReaderDataType.Chapter && (
          <ChapterControls lastVerse={lastVerse} initialData={initialData} />
        )}
        {(quranReaderDataType === QuranReaderDataType.Verse ||
          quranReaderDataType === QuranReaderDataType.VerseRange) && (
          <VerseControls lastVerse={lastVerse} />
        )}
        {quranReaderDataType === QuranReaderDataType.Page && <PageControls lastVerse={lastVerse} />}
        {quranReaderDataType === QuranReaderDataType.Juz && <JuzControls lastVerse={lastVerse} />}
      </div>
    </div>
  );
};

export default EndOfScrollingControls;
