import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import Image from 'next/image';

import styles from './CourseDetails.module.scss';
import MainDetails from './Tabs/MainDetails';
import Syllabus from './Tabs/Syllabus';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Tabs from '@/dls/TabsNew/Tabs';
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
  REVIEWS = 'reviews',
}

const CourseDetails: React.FC<Props> = ({ course }) => {
  const { title, image, id, author } = course;
  const { t } = useTranslation('learn');

  const onEnrollClicked = () => {
    logButtonClick('enroll_course_details', { courseId: id });
    // TODO: continue here
  };

  const onTabChange = (value: Tab) => {
    logEvent('course_details_tab_change', { courseId: id, tab: value });
  };

  const onBackButtonClicked = () => {
    logButtonClick('back_to_courses_course_details', { courseId: id });
  };

  const tabs = useMemo(
    () => [
      {
        title: t('tabs.main'),
        value: Tab.MAIN,
        body: <MainDetails course={course} />,
        icon: <DetailsIcon />,
      },
      {
        title: t('tabs.syllabus'),
        value: Tab.SYLLABUS,
        body: <Syllabus course={course} />,
        icon: <SyllabusIcon />,
      },
    ],
    [course, t],
  );

  return (
    <div>
      <Button
        onClick={onBackButtonClicked}
        href={getCoursesNavigationUrl()}
        variant={ButtonVariant.Ghost}
      >
        <ArrowLeft />
        <p className={styles.backText}>{t('back-to-courses')}</p>
      </Button>
      <div className={styles.headerContainer}>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.author}>{t('by-author', { author })}</p>
        </div>
        <Button onClick={onEnrollClicked}>{t('enroll')}</Button>
      </div>

      <div className={styles.imgContainer}>
        <Image className={styles.imgContainer} alt={title} src={image} layout="fill" />
      </div>

      <Tabs defaultValue={Tab.MAIN} onValueChange={onTabChange} tabs={tabs} />
    </div>
  );
};

export default CourseDetails;
