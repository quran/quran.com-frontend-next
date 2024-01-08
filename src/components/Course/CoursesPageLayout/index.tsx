/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CoursesPageLayout.module.scss';

import CoursesList from '@/components/Course/CoursesList';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import { CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';

const Loading = () => <Spinner />;

type Props = {
  isMyCourses?: boolean;
};

const CoursesPageLayout: React.FC<Props> = ({ isMyCourses = false }) => {
  const { t } = useTranslation('learn');
  return (
    <div className={layoutStyles.pageContainer}>
      <p className={styles.title}>{isMyCourses ? t('common:my-courses') : t('common:courses')}</p>
      <div className={classNames(layoutStyles.flow, styles.container)}>
        <DataFetcher
          loading={Loading}
          fetcher={privateFetcher}
          queryKey={makeGetCoursesUrl({ myCourses: isMyCourses })}
          render={(data: CoursesResponse) => (
            <CoursesList courses={data.data} isMyCourses={isMyCourses} />
          )}
        />
      </div>
    </div>
  );
};

export default CoursesPageLayout;
