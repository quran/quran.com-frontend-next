import React, { useState } from 'react';

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

type Props = { course: Course };

const ShareCourse: React.FC<Props> = ({ course }) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const shareUrl = `${getBasePath()}${getCourseNavigationUrl(course.slug)}`;

  const onShareClicked = () => {
    logButtonClick('share_course_clicked', { courseId: course.id });
    setIsOpen(true);
  };

  return (
    <>
      <Button
        size={isMobile ? ButtonSize.Small : ButtonSize.Medium}
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
          <Modal.Title>{course.title}</Modal.Title>
          <ShareButtons
            url={shareUrl}
            title={course.title}
            analyticsContext="share_course"
            hideVideoGeneration
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShareCourse;
