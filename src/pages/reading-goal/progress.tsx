import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../index.module.scss';

import styles from './readingGoalProgressPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getReadingGoalProgressNavigationUrl } from '@/utils/navigation';

const ReadingGoalProgressPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  useRequireAuth();

  const { t, lang } = useTranslation('reading-goal');

  return (
    <>
      <NextSeoWrapper
        title={t('reading-goal')}
        url={getCanonicalUrl(lang, getReadingGoalProgressNavigationUrl())}
        languageAlternates={getLanguageAlternates(getReadingGoalProgressNavigationUrl())}
        nofollow
        noindex
      />
      <div className={layoutStyle.pageContainer}>
        <div className={layoutStyle.flow}>
          <div className={classNames(layoutStyle.flowItem, styles.wrapper)}>
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <h1>Not implemented yet</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default ReadingGoalProgressPage;
