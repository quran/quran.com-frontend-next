/* eslint-disable react-func/max-lines-per-function */
import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './CourseDetails.module.scss';
import MainDetails from './Tabs/MainDetails';
import Syllabus from './Tabs/Syllabus';

import Button, { ButtonVariant } from '@/dls/Button/Button';
import Tabs from '@/dls/TabsNew/Tabs';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import DetailsIcon from '@/icons/collection.svg';
import SyllabusIcon from '@/icons/developers.svg';
import ArrowLeft from '@/icons/west.svg';
import { Course } from '@/types/auth/Course';
import { postEnrollUser } from '@/utils/auth/api';
import { makeGetCourseUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { getCoursesNavigationUrl, getLoginNavigationUrl } from '@/utils/navigation';

type Props = {
  course: Course;
};

enum Tab {
  MAIN = 'main',
  SYLLABUS = 'syllabus',
  REVIEWS = 'reviews',
}

const CourseDetails: React.FC<Props> = ({ course }) => {
  const { mutate } = useSWRConfig();
  const { title, image, id, author, isUserEnrolled, slug } = course;
  const { t } = useTranslation('learn');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const onEnrollClicked = () => {
    if (isLoggedIn()) {
      logButtonClick('user_enroll_course', { courseId: id });
      setIsLoading(true);
      postEnrollUser(course.id)
        .then(() => {
          toast(t('enroll-success'), {
            status: ToastStatus.Success,
          });
          mutate(
            makeGetCourseUrl(slug, { withLessons: true }),
            (currentCourse: Course) => {
              return {
                ...currentCourse,
                isUserEnrolled: true,
              };
            },
            {
              revalidate: false,
            },
          );
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      logButtonClick('guest_enroll_course', { courseId: id });
      router.replace(getLoginNavigationUrl());
    }
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
        {isUserEnrolled === true ? (
          <>{t('enrolled')}</>
        ) : (
          <Button isDisabled={isLoading} isLoading={isLoading} onClick={onEnrollClicked}>
            {t('enroll')}
          </Button>
        )}
      </div>

      <div className={styles.imgContainer}>
        <Image className={styles.imgContainer} alt={title} src={image} layout="fill" />
      </div>

      <Tabs defaultValue={Tab.MAIN} onValueChange={onTabChange} tabs={tabs} />
    </div>
  );
};

export default CourseDetails;
