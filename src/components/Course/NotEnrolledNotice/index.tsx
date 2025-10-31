import React, { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './NotEnrolledNotice.module.scss';

import PageContainer from '@/components/PageContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';
import { getCourseNavigationUrl } from '@/utils/navigation';
import { stripHTMLTags } from '@/utils/string';

interface Props {
  courseSlug: string;
  lessonSlugOrId: string;
}

const NotEnrolledNotice: React.FC<Props> = ({ courseSlug, lessonSlugOrId }) => {
  const { t: tLearn } = useTranslation('learn');
  const router = useRouter();
  const noticeToast = useToast();
  const hasHandledNotEnrolledRef = useRef(false);

  useEffect(() => {
    if (hasHandledNotEnrolledRef.current) return;
    noticeToast(stripHTMLTags(tLearn('not-enrolled')), { status: ToastStatus.Error });
    router.replace(getCourseNavigationUrl(courseSlug));
    hasHandledNotEnrolledRef.current = true;
  }, [tLearn, router, noticeToast, courseSlug]);

  const onUnEnrolledNavigationLinkClicked = () => {
    logButtonClick('unenrolled_course_link', { courseSlugOrId: courseSlug, lessonSlugOrId });
  };

  return (
    <div className={styles.container}>
      <PageContainer>
        <Trans
          i18nKey="learn:not-enrolled"
          components={{
            link: (
              <Link
                onClick={onUnEnrolledNavigationLinkClicked}
                href={getCourseNavigationUrl(courseSlug)}
                variant={LinkVariant.Blend}
              />
            ),
          }}
        />
      </PageContainer>
    </div>
  );
};

export default NotEnrolledNotice;
