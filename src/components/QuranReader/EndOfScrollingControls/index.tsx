import React from 'react';

import ChapterControls from './ChapterControls';
import styles from './EndOfScrollingControls.module.scss';
import JuzControls from './JuzControls';
import PageControls from './PageControls';
import TafsirControls from './TafsirControls';
import VerseControls from './VerseControls';

import { QuranReaderDataType } from 'src/components/QuranReader/types';
import Verse from 'types/Verse';

interface Props {
  quranReaderDataType: QuranReaderDataType;
  lastVerse: Verse;
}

const EndOfScrollingControls: React.FC<Props> = ({ quranReaderDataType, lastVerse }) => (
  <div className={styles.container}>
    <div className={styles.buttonsContainer}>
      {quranReaderDataType === QuranReaderDataType.Chapter && (
        <ChapterControls lastVerse={lastVerse} />
      )}
      {(quranReaderDataType === QuranReaderDataType.Verse ||
        quranReaderDataType === QuranReaderDataType.Range) && (
        <VerseControls lastVerse={lastVerse} />
      )}
      {quranReaderDataType === QuranReaderDataType.Page && <PageControls lastVerse={lastVerse} />}
      {quranReaderDataType === QuranReaderDataType.Juz && <JuzControls lastVerse={lastVerse} />}
      {quranReaderDataType === QuranReaderDataType.Tafsir && (
        <TafsirControls lastVerse={lastVerse} />
      )}
    </div>
  </div>
);

export default EndOfScrollingControls;
