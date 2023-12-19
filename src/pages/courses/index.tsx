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
import { CoursesResponse } from '@/types/auth/Course';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getCoursesNavigationUrl } from '@/utils/navigation';

const Loading = () => <Spinner />;

const LearnPage: NextPage = () => {
  const { t, lang } = useTranslation('learn');

  return (
    <>
      <NextSeoWrapper
        title={t('common:learn')}
        url={getCanonicalUrl(lang, getCoursesNavigationUrl())}
        languageAlternates={getLanguageAlternates(getCoursesNavigationUrl())}
        nofollow
        noindex
      />
      <div className={layoutStyles.pageContainer}>
        <div className={classNames(layoutStyles.flow, styles.container)}>
          <DataFetcher
            loading={Loading}
            queryKey={makeGetCoursesUrl()}
            render={(data: CoursesResponse) => <CoursesList courses={data.data} />}
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
