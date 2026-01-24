import useTranslation from 'next-translate/useTranslation';

import HeaderNavigation from '../HeaderNavigation';

import ProgressPageGoalWidget from './ProgressPageGoalWidget';
import ProgressPageStreakWidget from './ProgressPageStreakWidget';
import ReadingHistory from './ReadingHistory';
import styles from './ReadingProgressPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getReadingGoalProgressNavigationUrl } from '@/utils/navigation';

const ReadingProgressPage = () => {
  const { t, lang } = useTranslation('reading-progress');
  const { error, goal, weekData, streak, isLoading, currentActivityDay } = useGetStreakWithMetadata(
    {
      showDayName: true,
    },
  );

  if (error) return null;

  return (
    <>
      <NextSeoWrapper
        title={t('reading-progress-header')}
        url={getCanonicalUrl(lang, getReadingGoalProgressNavigationUrl())}
        languageAlternates={getLanguageAlternates(getReadingGoalProgressNavigationUrl())}
        nofollow
        noindex
      />
      <HeaderNavigation title={t('reading-progress-header')} />
      <div className={styles.contentContainer}>
        <PageContainer isSheetsLike>
          <div className={styles.widgetsContainer}>
            <ProgressPageStreakWidget
              weekData={weekData}
              goal={goal}
              streak={streak}
              isLoading={isLoading}
            />

            <ProgressPageGoalWidget
              goal={goal}
              isLoading={isLoading}
              currentActivityDay={currentActivityDay}
            />
          </div>
          <ReadingHistory />
        </PageContainer>
      </div>
    </>
  );
};

export default ReadingProgressPage;
