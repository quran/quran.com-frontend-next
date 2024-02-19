import React from 'react';

import useTranslation from 'next-translate/useTranslation';
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

import Banner from '@/components/Banner/Banner';
import DonateButton from '@/components/Fundraising/DonateButton';
import ReadingStreak, { ReadingStreakLayout } from '@/components/HomePage/ReadingStreak';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';
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
  const { t } = useTranslation('common');
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  return (
    <>
      <div className={styles.progressWidgetContainer}>
        <ReadingStreak layout={ReadingStreakLayout.QuranReader} />
      </div>
      {isReadingByRevelationOrder && quranReaderDataType === QuranReaderDataType.Chapter && (
        <RevelationOrderNavigationNotice
          view={RevelationOrderNavigationNoticeView.EndOfScrollingControls}
        />
      )}
      <div className={styles.container}>
        <div className={styles.buttonsContainer}>
          {quranReaderDataType === QuranReaderDataType.Chapter && (
            <ChapterControls lastVerse={lastVerse} initialData={initialData} />
          )}
          {(quranReaderDataType === QuranReaderDataType.Verse ||
            quranReaderDataType === QuranReaderDataType.VerseRange) && (
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
      <div className={styles.donationBannerContainer}>
        <Banner
          text={t('common:fundraising-sticky-banner.title')}
          ctaButton={<DonateButton source={DonateButtonClickSource.QURAN_READER} />}
        />
      </div>
    </>
  );
};

export default EndOfScrollingControls;
