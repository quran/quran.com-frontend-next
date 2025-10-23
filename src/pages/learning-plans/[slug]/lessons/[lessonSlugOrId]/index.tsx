import { useRef } from 'react';

import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import LessonView from '@/components/Course/LessonView';
import DataFetcher from '@/components/DataFetcher';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import layoutStyles from '@/pages/index.module.scss';
import { Lesson } from '@/types/auth/Course';
import { fetcher, privateFetcher } from '@/utils/auth/api';
import { makeGetLessonUrl } from '@/utils/auth/apiPaths';
import { isUserOrGuestEnrolled } from '@/utils/auth/guestCourseEnrollment';
import { isLoggedIn } from '@/utils/auth/login';
import {
  getCanonicalUrl,
  getCourseNavigationUrl,
  getLessonNavigationUrl,
} from '@/utils/navigation';

const LessonPage: NextPage = () => {
  const { lang, t } = useTranslation('learn');
  const router = useRouter();
  const toast = useToast();
  const { slug, lessonSlugOrId } = router.query;
  const userIsLoggedIn = isLoggedIn();
  const hasRedirected = useRef(false);

  const courseSlug = slug as string;
  const lessonSlug = lessonSlugOrId as string;

  const render = (lesson: Lesson) => {
    if (!lesson?.course) return null;

    const { id, isUserEnrolled, allowGuestAccess } = lesson.course;
    const isEnrolled = isUserOrGuestEnrolled(id, isUserEnrolled);

    // Check enrollment
    if (!isEnrolled || (!userIsLoggedIn && !allowGuestAccess)) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        toast(t('not-enrolled').replace(/<\/?link>/g, ''), { status: ToastStatus.Warning });
        router.replace(getCourseNavigationUrl(courseSlug));
      }
      return null;
    }

    return (
      <>
        <NextSeoWrapper
          title={lesson.title}
          url={getCanonicalUrl(lang, getLessonNavigationUrl(courseSlug, lessonSlug))}
        />
        <LessonView lesson={lesson} lessonSlugOrId={lessonSlug} courseSlug={courseSlug} />
      </>
    );
  };

  return (
    <div className={layoutStyles.pageContainer}>
      <DataFetcher
        loading={() => (
          <div className={layoutStyles.loadingContainer}>
            <Spinner />
          </div>
        )}
        queryKey={makeGetLessonUrl(courseSlug, lessonSlug)}
        fetcher={userIsLoggedIn ? privateFetcher : fetcher}
        render={render}
      />
    </div>
  );
};

export default LessonPage;
