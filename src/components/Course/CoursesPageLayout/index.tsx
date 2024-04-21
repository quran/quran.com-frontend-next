/* eslint-disable react/no-multi-comp */
import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './CoursesPageLayout.module.scss';

import ContentContainer from '@/components/Course/ContentContainer';
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
          <DataFetcher
            loading={Loading}
            fetcher={privateFetcher}
            queryKey={makeGetCoursesUrl({ myCourses: isMyCourses })}
            render={(data: CoursesResponse) => (
              <CoursesList courses={data.data} isMyCourses={isMyCourses} />
            )}
          />
        </div>
      </ContentContainer>
    </div>
  );
};

export default CoursesPageLayout;
