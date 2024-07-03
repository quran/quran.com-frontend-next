import React from 'react';

import { useSelector } from 'react-redux';

import RevelationOrderNavigationNotice, {
  RevelationOrderNavigationNoticeView,
} from '../RevelationOrderNavigationNotice';

import ChapterControls from './ChapterControls';
import styles from './EndOfScrollingControls.module.scss';
import HizbControls from './HizbControls';
import JuzControls from './JuzControls';
import PageControls from './PageControls';
import QuranReaderReadingStreak from './QuranReaderReadingStreak';
import RubControls from './RubControls';
import VerseControls from './VerseControls';

import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
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
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  return (
    <>
      <div className={styles.progressWidgetContainer}>
        <QuranReaderReadingStreak />
      </div>
      {isReadingByRevelationOrder && quranReaderDataType === QuranReaderDataType.Chapter && (
        <RevelationOrderNavigationNotice
          view={RevelationOrderNavigationNoticeView.EndOfScrollingControls}
        />
      )}
      <div className={styles.container}>
        <div className={styles.buttonsContainer}>
          {quranReaderDataType === QuranReaderDataType.Chapter && (
            <ChapterControls initialData={initialData} />
          )}
          {(quranReaderDataType === QuranReaderDataType.Verse ||
            quranReaderDataType === QuranReaderDataType.ChapterVerseRanges ||
            quranReaderDataType === QuranReaderDataType.Ranges) && (
            <VerseControls lastVerse={lastVerse} />
          )}
          {quranReaderDataType === QuranReaderDataType.Page && (
            <PageControls lastVerse={lastVerse} />
          )}
          {quranReaderDataType === QuranReaderDataType.Juz && <JuzControls lastVerse={lastVerse} />}
          {quranReaderDataType === QuranReaderDataType.Rub && <RubControls lastVerse={lastVerse} />}
          {quranReaderDataType === QuranReaderDataType.Hizb && (
            <HizbControls lastVerse={lastVerse} />
          )}
        </div>
      </div>
    </>
  );
};

export default EndOfScrollingControls;
