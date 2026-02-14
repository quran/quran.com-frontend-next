import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, useDispatch } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './EndOfSurahSection.module.scss';
import ExploreCard from './ExploreCard';
import ReadMoreCard from './ReadMoreCard';
import StreakGoalCard from './StreakGoalCard';

import { getChapterMetadata } from '@/api';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import Link from '@/dls/Link/Link';
import useBatchedCountRangeQuestions from '@/hooks/auth/useBatchedCountRangeQuestions';
import useScrollToTop from '@/hooks/useScrollToTop';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { makeChapterMetadataUrl } from '@/utils/apiPaths';
import { getNextChapterNumber } from '@/utils/chapter';
import { getSurahNavigationUrl } from '@/utils/navigation';

interface EndOfSurahSectionProps {
  chapterNumber: number;
}

const EndOfSurahSection: React.FC<EndOfSurahSectionProps> = ({ chapterNumber }) => {
  const { t, lang } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const scrollToTop = useScrollToTop();
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);

  // For Tafsir, Reflections, Lessons, Answers - always use verse 1
  const verseKey = `${chapterNumber}:1`;

  const { data: questionData } = useBatchedCountRangeQuestions(verseKey);
  const hasQuestions = questionData?.total > 0;
  const hasClarificationQuestion = !!questionData?.types?.[QuestionType.CLARIFICATION];

  const { data: metadataResponse } = useSWRImmutable(
    makeChapterMetadataUrl(String(chapterNumber), lang),
    () => getChapterMetadata(String(chapterNumber), lang),
  );

  const handleStudyModeOpen = (tabId: StudyModeTabId, targetVerseKey: string) => {
    dispatch(openStudyMode({ verseKey: targetVerseKey, activeTab: tabId }));
  };

  const chapterMetadata = metadataResponse?.chapterMetadata;

  const nextChapterId = getNextChapterNumber(chapterNumber, isReadingByRevelationOrder);

  return (
    <div className={styles.container} data-testid="end-of-surah-section">
      <div className={styles.ctaContainer}>
        <h2 className={styles.header}>{t('end-of-surah.header')}</h2>
        {nextChapterId && (
          <Link href={getSurahNavigationUrl(nextChapterId)} className={styles.cta}>
            {t('end-of-surah.cta')}
          </Link>
        )}
      </div>

      <div className={styles.cardsGrid}>
        <ReadMoreCard
          cardClassName={styles.card}
          chapterNumber={chapterNumber}
          nextSummaries={chapterMetadata?.nextChapter?.summaries}
          previousSummaries={chapterMetadata?.previousChapter?.summaries}
          onScrollToTop={scrollToTop}
        />

        <ExploreCard
          cardClassName={styles.card}
          chapterNumber={chapterNumber}
          verseKey={verseKey}
          suggestions={chapterMetadata?.suggestions}
          hasQuestions={hasQuestions}
          hasClarificationQuestion={hasClarificationQuestion}
          onStudyModeOpen={handleStudyModeOpen}
        />

        <StreakGoalCard cardClassName={styles.card} />
      </div>
    </div>
  );
};

export default EndOfSurahSection;
