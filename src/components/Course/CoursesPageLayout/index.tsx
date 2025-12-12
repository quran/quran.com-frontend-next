/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './CoursesPageLayout.module.scss';

import ContentContainer from '@/components/Course/ContentContainer';
import CoursesList from '@/components/Course/CoursesList';
import useCoursesList from '@/components/Course/CoursesList/useCoursesList';
import Spinner from '@/dls/Spinner/Spinner';
import layoutStyles from '@/pages/index.module.scss';
import { selectLearningPlanLanguageIsoCodes } from '@/redux/slices/defaultSettings';
import { CoursesResponse } from '@/types/auth/Course';

type Props = {
  isMyCourses?: boolean;
  initialCoursesResponse?: CoursesResponse;
  initialLanguages?: string[];
};

const CoursesPageLayout: React.FC<Props> = ({
  isMyCourses = false,
  initialCoursesResponse,
  initialLanguages,
}) => {
  const { t } = useTranslation('learn');
  const languageIsoCodes = useSelector(selectLearningPlanLanguageIsoCodes);
  const languagesForRequest = initialLanguages ?? languageIsoCodes;

  const shouldUseInitialData = !isMyCourses && initialCoursesResponse;
  const { courses, hasNextPage, isLoadingMore, isInitialLoading, sentinelRef } = useCoursesList({
    initialResponse: shouldUseInitialData ? initialCoursesResponse : undefined,
    isMyCourses,
    languages: languagesForRequest,
  });

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
          {isInitialLoading && courses.length === 0 ? (
            <Spinner />
          ) : (
            <CoursesList
              courses={courses}
              isMyCourses={isMyCourses}
              hasNextPage={hasNextPage}
              isLoadingMore={isLoadingMore}
              sentinelRef={sentinelRef}
            />
          )}
        </div>
      </ContentContainer>
    </div>
  );
};

export default CoursesPageLayout;
