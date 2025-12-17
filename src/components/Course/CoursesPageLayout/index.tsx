/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './CoursesPageLayout.module.scss';

import ContentContainer from '@/components/Course/ContentContainer';
import CoursesList from '@/components/Course/CoursesList';
import DataFetcher from '@/components/DataFetcher';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import { selectLearningPlanLanguageIsoCodes } from '@/redux/slices/defaultSettings';
import { Course, CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';

const Loading = () => <Spinner />;

type Props = {
  isMyCourses?: boolean;
  initialCourses?: Course[];
};

const CoursesPageLayout: React.FC<Props> = ({ isMyCourses = false, initialCourses }) => {
  const { t } = useTranslation('learn');
  const languageIsoCodes = useSelector(selectLearningPlanLanguageIsoCodes);

  const renderCourses = (courses: Course[] | undefined) => {
    if (!courses) {
      return <Spinner />;
    }
    return <CoursesList courses={courses} isMyCourses={isMyCourses} />;
  };

  const shouldUseInitialData = !isMyCourses && initialCourses;

  return (
    <div className={layoutStyles.pageContainer}>
      <ContentContainer>
        <p className={styles.title}>
          {isMyCourses ? t('common:my-learning-plans') : t('common:learning-plans')}
        </p>
        {!isMyCourses && (
          <div className={styles.desc}>
            <Trans
              i18nKey="learn:learning-plans-desc"
              components={{
                br: <br key={0} />,
              }}
            />
          </div>
        )}

        <div className={classNames(layoutStyles.flow, styles.container)}>
          {shouldUseInitialData ? (
            renderCourses(initialCourses)
          ) : (
            <DataFetcher
              loading={Loading}
              fetcher={privateFetcher}
              queryKey={makeGetCoursesUrl({
                myCourses: isMyCourses,
                languages: languageIsoCodes,
              })}
              render={(data: CoursesResponse) => renderCourses(data.data)}
            />
          )}
        </div>
      </ContentContainer>
    </div>
  );
};

export default CoursesPageLayout;
