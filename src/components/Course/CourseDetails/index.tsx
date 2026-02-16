import React, { useMemo, useState } from 'react';

import classNames from 'classnames';
import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './CourseDetails.module.scss';
import EditorsDetails from './Tabs/MainDetails/DetailSection/EditorsDetails';

import RepeatLearningPlan from '@/components/Course/Buttons/RepeatLearningPlan';
import StartOrContinueLearning from '@/components/Course/Buttons/StartOrContinueLearning';
import ContentContainer from '@/components/Course/ContentContainer';
import StatusHeader from '@/components/Course/CourseDetails/StatusHeader';
import MainDetails from '@/components/Course/CourseDetails/Tabs/MainDetails';
import DetailSection from '@/components/Course/CourseDetails/Tabs/MainDetails/DetailSection';
import AuthorsDetails from '@/components/Course/CourseDetails/Tabs/MainDetails/DetailSection/AuthorsDetails';
import Syllabus from '@/components/Course/CourseDetails/Tabs/Syllabus';
import TabSwitcherItem from '@/components/Course/CourseDetails/TabSwitcherItem';
import CourseFeedback, { FeedbackSource } from '@/components/Course/CourseFeedback';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import Pill from '@/dls/Pill';
import Switch from '@/dls/Switch/Switch';
import DetailsIcon from '@/icons/collection.svg';
import SyllabusIcon from '@/icons/developers.svg';
import ArrowLeft from '@/icons/west.svg';
import { Course } from '@/types/auth/Course';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getCoursesNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

enum Tab {
  MAIN = 'main',
  SYLLABUS = 'syllabus',
}

const CourseDetails: React.FC<Props> = ({ course }) => {
  const { title, image, id, isCompleted } = course;
  const { t } = useTranslation('learn');
  const [selectedTab, setSelectedTab] = useState(Tab.MAIN);

  const onTabChange = (value: Tab) => {
    logEvent('course_details_tab_change', { courseId: id, tab: value });
    setSelectedTab(value);
  };

  const onBackButtonClicked = () => {
    logButtonClick('back_to_courses_course_details', { courseId: id });
  };

  const tabs = useMemo(
    () => [
      {
        name: <TabSwitcherItem icon={<DetailsIcon />} value={t('tabs.main')} />,
        value: Tab.MAIN,
      },
      {
        name: (
          <TabSwitcherItem
            icon={<SyllabusIcon />}
            value={t('tabs.syllabus')}
            data-testid="syllabus-button"
          />
        ),
        value: Tab.SYLLABUS,
      },
    ],
    [t],
  );

  const tabComponents = useMemo(
    () => ({
      [Tab.MAIN]: <MainDetails course={course} />,
      [Tab.SYLLABUS]: <Syllabus course={course} />,
    }),
    [course],
  );

  return (
    <ContentContainer>
      <Button
        onClick={onBackButtonClicked}
        href={getCoursesNavigationUrl()}
        variant={ButtonVariant.Ghost}
      >
        <ArrowLeft />
        <span className={styles.backText}>{t('back-to-learning-plans')}</span>
      </Button>
      <div className={styles.topSection}>
        <div
          className={classNames(styles.headerContainer, { [styles.completedHeader]: isCompleted })}
        >
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {isCompleted && <Pill containerClassName={styles.completedPill}>{t('completed')}</Pill>}
          </div>
          {isCompleted ? (
            <div className={styles.completedActionsRow}>
              <RepeatLearningPlan course={course} />
              {course?.userHasFeedback === false && (
                <CourseFeedback course={course} source={FeedbackSource.CoursePage} />
              )}
            </div>
          ) : (
            <StatusHeader course={course} />
          )}
        </div>

        <div className={styles.imgContainer}>
          <Image alt={title} src={image} width={1920} height={480} />
        </div>
      </div>

      <Switch selected={selectedTab} items={tabs} onSelect={onTabChange} />
      {tabComponents[selectedTab]}
      {selectedTab === Tab.MAIN && (
        <>
          {!course.isUserEnrolled && (
            <>
              <StatusHeader course={course} isCTA />
            </>
          )}
          <DetailSection
            title={t('about-author', { count: course.authors.length })}
            description={<AuthorsDetails authors={course.authors} />}
          />
          {course?.editors?.length > 0 && (
            <DetailSection
              title={t('contributors')}
              description={<EditorsDetails editors={course.editors} />}
            />
          )}
          {course.isUserEnrolled && !isCompleted && (
            <div className={styles.startLearningButton}>
              <StartOrContinueLearning course={course} isHeaderButton={false} />
            </div>
          )}
        </>
      )}
    </ContentContainer>
  );
};

export default CourseDetails;
