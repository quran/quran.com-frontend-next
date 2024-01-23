import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from './CourseDetails.module.scss';
import StatusHeader from './StatusHeader';
import MainDetails from './Tabs/MainDetails';
import Syllabus from './Tabs/Syllabus';
import TabSwitcherItem from './TabSwitcherItem';

import ContentContainer from '@/components/Course/ContentContainer';
import Button, { ButtonVariant } from '@/dls/Button/Button';
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
  const { title, image, id, author } = course;
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
        name: <TabSwitcherItem icon={<SyllabusIcon />} value={t('tabs.syllabus')} />,
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
        <p className={styles.backText}>{t('back-to-knowledge-boosters')}</p>
      </Button>
      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.author}>{t('by-author', { author })}</p>
        </div>
        <StatusHeader course={course} />
      </div>

      <div className={styles.imgContainer}>
        <Image alt={title} src={image} layout="fill" />
      </div>

      <Switch selected={selectedTab} items={tabs} onSelect={onTabChange} />
      {tabComponents[selectedTab]}
      {!course.isUserEnrolled && <StatusHeader course={course} isCTA />}
    </ContentContainer>
  );
};

export default CourseDetails;
