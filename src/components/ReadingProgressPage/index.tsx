import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import ProgressPageGoalWidget from './ProgressPageGoalWidget';
import ProgressPageStreakWidget from './ProgressPageStreakWidget';
import ReadingHistory from './ReadingHistory';
import styles from './ReadingProgressPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import useGetStreakWithMetadata from '@/hooks/auth/useGetStreakWithMetadata';
import ArrowLeft from '@/icons/arrow-left.svg';
import Background from '@/icons/background.svg';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getReadingGoalNavigationUrl,
  getReadingGoalProgressNavigationUrl,
} from '@/utils/navigation';

const ReadingProgressPage = () => {
  const { t, lang } = useTranslation('reading-progress');
  const { error, goal, weekData, streak, isLoading } = useGetStreakWithMetadata({
    showDayName: true,
  });

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

      <div className={styles.heroContainer}>
        <Head>
          <link rel="preload" as="image" href="/images/background.png" />
        </Head>
        <div className={styles.heroBackgroundImage}>
          <Background />
        </div>
        <div>
          <div className={styles.heroInnerContainer}>
            <Button
              type={ButtonType.Secondary}
              size={ButtonSize.Large}
              variant={ButtonVariant.Compact}
              href={getReadingGoalNavigationUrl()}
            >
              <ArrowLeft />
            </Button>
            <h1>{t('reading-progress-header')}</h1>
          </div>
        </div>
      </div>

      <div className={styles.contentContainer}>
        <PageContainer>
          <div className={styles.widgetsContainer}>
            <ProgressPageStreakWidget
              weekData={weekData}
              goal={goal}
              streak={streak}
              isLoading={isLoading}
            />

            <ProgressPageGoalWidget goal={goal} isLoading={isLoading} />
          </div>

          <ReadingHistory />
        </PageContainer>
      </div>
    </>
  );
};

export default ReadingProgressPage;
