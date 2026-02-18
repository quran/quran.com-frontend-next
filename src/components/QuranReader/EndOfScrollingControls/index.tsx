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
import RubControls from './RubControls';
import VerseControls from './VerseControls';

import HomepageFundraisingBanner, {
  FundraisingBannerContext,
} from '@/components/Fundraising/HomepageFundraisingBanner';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import { QuranReaderDataType } from '@/types/QuranReader';
import { VersesResponse } from 'types/ApiResponses';
import Verse from 'types/Verse';

interface Props {
  quranReaderDataType: QuranReaderDataType;
  lastVerse: Verse;
  initialData: VersesResponse;
}

const getReaderAnalyticsParams = (
  dataType: QuranReaderDataType,
  verse: Verse,
): Record<string, any> => {
  switch (dataType) {
    case QuranReaderDataType.Juz:
      return { juzNumber: verse.juzNumber };
    case QuranReaderDataType.Page:
      return { pageNumber: verse.pageNumber };
    case QuranReaderDataType.Verse:
    case QuranReaderDataType.ChapterVerseRanges:
    case QuranReaderDataType.Ranges:
      return { verseKey: verse.verseKey };
    case QuranReaderDataType.Hizb:
      return { hizbNumber: verse.hizbNumber };
    case QuranReaderDataType.Rub:
      return { rubNumber: verse.rubElHizbNumber };
    default:
      return {};
  }
};

const getReaderAnalyticsSource = (dataType: QuranReaderDataType): string => {
  switch (dataType) {
    case QuranReaderDataType.Juz:
      return 'quran_reader_juz';
    case QuranReaderDataType.Page:
      return 'quran_reader_page';
    case QuranReaderDataType.Verse:
    case QuranReaderDataType.ChapterVerseRanges:
    case QuranReaderDataType.Ranges:
      return 'quran_reader_range';
    case QuranReaderDataType.Hizb:
      return 'quran_reader_hizb';
    case QuranReaderDataType.Rub:
      return 'quran_reader_rub';
    default:
      return 'quran_reader';
  }
};

const EndOfScrollingControls: React.FC<Props> = ({
  quranReaderDataType,
  lastVerse,
  initialData,
}) => {
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  return (
    <>
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
      {quranReaderDataType !== QuranReaderDataType.Chapter && (
        <div className={styles.otherBannerWrapper}>
          <HomepageFundraisingBanner
            context={FundraisingBannerContext.QuranReader}
            analyticsSource={getReaderAnalyticsSource(quranReaderDataType)}
            analyticsParams={getReaderAnalyticsParams(quranReaderDataType, lastVerse)}
          />
        </div>
      )}
    </>
  );
};

export default EndOfScrollingControls;
