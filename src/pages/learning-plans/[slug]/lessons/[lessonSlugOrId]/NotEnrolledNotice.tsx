import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './lessons.module.scss';

import PageContainer from '@/components/PageContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { getCourseNavigationUrl } from '@/utils/navigation';
import { stripHTMLTags } from '@/utils/string';

export interface NotEnrolledNoticeProps {
  slug: string;
  onNavigationLinkClick?: () => void;
}

const NotEnrolledNotice: React.FC<NotEnrolledNoticeProps> = ({ slug, onNavigationLinkClick }) => {
  const noticeToast = useToast();
  const { t: tLearn } = useTranslation('learn');
  const noticeRouter = useRouter();
  const hasHandledNotEnrolledRef = useRef(false);
  const routerReplaceRef = useRef(noticeRouter.replace);
  const toastFnRef = useRef(noticeToast);

  useEffect(() => {
    routerReplaceRef.current = noticeRouter.replace;
    toastFnRef.current = noticeToast;
  }, [noticeRouter, noticeToast]);

  useEffect(() => {
    if (hasHandledNotEnrolledRef.current) return;
    hasHandledNotEnrolledRef.current = true;
    toastFnRef.current(stripHTMLTags(tLearn('not-enrolled')), { status: ToastStatus.Error });
    routerReplaceRef.current(getCourseNavigationUrl(slug));
  }, [slug, tLearn]);

  return (
    <div className={styles.container}>
      <PageContainer>
        <Trans
          i18nKey="learn:not-enrolled"
          components={{
            link: (
              <Link
                onClick={onNavigationLinkClick}
                key={0}
                href={getCourseNavigationUrl(slug)}
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
