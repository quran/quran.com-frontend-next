import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ShareCourse.module.scss';

import Button, { ButtonSize } from '@/dls/Button/Button';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import ShareButtons from '@/dls/ShareButtons';
import useIsMobile from '@/hooks/useIsMobile';
import CloseIcon from '@/icons/close.svg';
import ShareIcon from '@/icons/share.svg';
import { Course } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { getCourseNavigationUrl } from '@/utils/navigation';
import { getBasePath } from '@/utils/url';

type Props = {
  course: Pick<Course, 'id' | 'title' | 'slug'>;
  shareUrl?: string;
  analyticsContext?: string;
  buttonAnalyticsName?: string;
  buttonAnalyticsData?: Record<string, string | number>;
  buttonSize?: ButtonSize;
};

const ShareCourse: React.FC<Props> = ({
  course,
  shareUrl: shareUrlProp,
  analyticsContext = 'share_course',
  buttonAnalyticsName = 'share_course_clicked',
  buttonAnalyticsData,
  buttonSize,
}) => {
  const { t } = useTranslation('learn');
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const shareUrl = shareUrlProp || `${getBasePath()}${getCourseNavigationUrl(course.slug)}`;

  const onShareClicked = () => {
    logButtonClick(buttonAnalyticsName, buttonAnalyticsData || { courseId: course.id });
    setIsOpen(true);
  };

  return (
    <>
      <Button
        size={buttonSize || (isMobile ? ButtonSize.Small : ButtonSize.Medium)}
        className={styles.shareButton}
        prefix={
          <span className={styles.shareIcon}>
            <ShareIcon />
          </span>
        }
        onClick={onShareClicked}
      >
        {t('share')}
      </Button>
      <Modal isOpen={isOpen} onClickOutside={() => setIsOpen(false)} size={ModalSize.MEDIUM}>
        <Modal.Body>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            type="button"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <Modal.Title>{`${t('share-title')} ${course.title}`}</Modal.Title>
          <div className={styles.shareButtons}>
            <ShareButtons
              url={shareUrl}
              title={course.title}
              analyticsContext={analyticsContext}
              hideVideoGeneration
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShareCourse;
