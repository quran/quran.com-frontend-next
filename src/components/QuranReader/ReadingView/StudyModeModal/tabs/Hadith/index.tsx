import React, { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import StudyModeTabLayout, { useStudyModeTabScroll } from '../StudyModeTabLayout';

import styles from './StudyModeHadithTab.module.scss';

import Error from '@/components/Error';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import HadithList from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/Hadith/HadithList';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useHadithsPagination from '@/hooks/useHadithsPagination';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { AyahHadithsResponse } from '@/types/Hadith';
import Language from '@/types/Language';
import { makeVerseKey } from '@/utils/verse';

interface StudyModeHadithTabProps {
  chapterId: string;
  verseNumber: string;
  switchTab?: (tabId: StudyModeTabId | null) => void;
  hadithsInitialData?: AyahHadithsResponse;
}

const StudyModeHadithTab: React.FC<StudyModeHadithTabProps> = ({
  chapterId,
  verseNumber,
  switchTab,
  hadithsInitialData,
}) => {
  const { lang } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles);
  const { containerRef } = useStudyModeTabScroll();

  const ayahKey = makeVerseKey(Number(chapterId), Number(verseNumber));
  const scaleClass = styles[`hadith-font-size-${quranReaderStyles.hadithFontScale}`];

  // Use global site language for hadiths
  const { hadiths, hasMore, isLoadingMore, loadMore, isLoading, error, mutate } =
    useHadithsPagination({
      ayahKey,
      language: lang as Language,
      initialData: hadithsInitialData,
    });

  // Auto-close tab when there are no hadiths
  useEffect(() => {
    if (!isLoading && (!hadiths || hadiths.length === 0) && switchTab) {
      switchTab(null);
    }
  }, [isLoading, hadiths, switchTab]);

  const handleRetry = () => {
    mutate?.();
  };

  const renderBody = () => {
    if (isLoading) return <TafsirSkeleton />;

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <Error error={error} onRetryClicked={handleRetry} />
        </div>
      );
    }

    return (
      <div className={classNames(styles.hadithsContainer, scaleClass)}>
        <HadithList
          hadiths={hadiths}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={loadMore}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <StudyModeTabLayout fontType="hadith" selectionControl={null} body={renderBody()} />
    </div>
  );
};

export default StudyModeHadithTab;
