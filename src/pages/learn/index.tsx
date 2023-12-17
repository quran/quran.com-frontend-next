/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyles from '../index.module.scss';

import styles from './learn.module.scss';

import CoursesList from '@/components/Course/CoursesList';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner from '@/dls/Spinner/Spinner';
import useRequireAuth from '@/hooks/auth/useRequireAuth';
import { CoursesResponse } from '@/types/auth/Course';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { makeGetCoursesUrl } from '@/utils/mockoon/apiPath';
import { getCanonicalUrl, getLearnNavigationUrl } from '@/utils/navigation';

const Loading = () => <Spinner />;

const LearnPage: NextPage = () => {
  // we don't want to show the reading goal page if the user is not logged in
  useRequireAuth();

  const { t, lang } = useTranslation('learn');
  return (
    <>
      <NextSeoWrapper
        title={t('common:learn')}
        url={getCanonicalUrl(lang, getLearnNavigationUrl())}
        languageAlternates={getLanguageAlternates(getLearnNavigationUrl())}
        nofollow
        noindex
      />
      <div className={layoutStyles.pageContainer}>
        <div className={classNames(layoutStyles.flow, styles.container)}>
          <DataFetcher
            loading={Loading}
            queryKey={makeGetCoursesUrl()}
            render={(data: CoursesResponse) => <CoursesList courses={data.courses} />}
          />
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

export default LearnPage;
