import { useRef } from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import CourseFeedbackForm from '../CourseFeedbackForm';

import styles from './CourseFeedbackModal.module.scss';

import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import { Course } from '@/types/auth/Course';
import { Note } from '@/types/auth/Note';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onNoteUpdated?: (data: Note) => void;
  onNoteDeleted?: () => void;
}

const CourseFeedbackModal: React.FC<NoteModalProps> = ({ onClose, isOpen, course }) => {
  const { t } = useTranslation('learn');
  const contentModalRef = useRef<ContentModalHandles>();

  const { title } = course;

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<div className={styles.headerContainer}>{t('feedback.add-feedback')}</div>}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
    >
      <div className={styles.desc}>
        <Trans
          components={{ br: <br /> }}
          i18nKey="learn:feedback.desc"
          values={{
            courseName: title,
          }}
        />
      </div>
      <CourseFeedbackForm onSuccess={onClose} course={course} />
    </ContentModal>
  );
};

export default CourseFeedbackModal;
