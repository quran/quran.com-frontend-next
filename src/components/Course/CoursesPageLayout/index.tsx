/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';

import styles from './CoursesPageLayout.module.scss';

import CoursesList from '@/components/Course/CoursesList';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import { CoursesResponse } from '@/types/auth/Course';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';

const Loading = () => <Spinner />;

type Props = {};

const CoursesPageLayout: React.FC<Props> = ({}) => {
  return (
    <div className={layoutStyles.pageContainer}>
      <div className={classNames(layoutStyles.flow, styles.container)}>
        <DataFetcher
          loading={Loading}
          queryKey={makeGetCoursesUrl()}
          render={(data: CoursesResponse) => <CoursesList courses={data.data} />}
        />
      </div>
    </div>
  );
};

export default CoursesPageLayout;
