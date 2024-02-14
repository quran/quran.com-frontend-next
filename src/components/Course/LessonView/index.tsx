import React, { useState } from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import ActionButtons from './ActionButtons';
import CourseMaterial from './CourseMaterial';
import styles from './Lesson.module.scss';

import ContentContainer from '@/components/Course/ContentContainer';
import MarkdownEditor from '@/components/MarkdownEditor';
import PageContainer from '@/components/PageContainer';
import Button, { ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import ArrowLeft from '@/icons/west.svg';
import { Lesson } from '@/types/auth/Course';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getCourseNavigationUrl } from '@/utils/navigation';

type Props = {
  lesson: Lesson;
  courseSlug: string;
  lessonSlugOrId: string;
};

const LessonView: React.FC<Props> = ({ lesson, courseSlug, lessonSlugOrId }) => {
  const { title, content, day } = lesson;
  const { t, lang } = useTranslation('learn');
  const [isCourseMaterialModalOpen, setCourseMaterialModalOpen] = useState(false);

  const onBackButtonClicked = () => {
    logButtonClick('back_to_course', { lessonSlugOrId, courseSlug });
  };

  const onCourseMaterialClicked = () => {
    logButtonClick('course_material', { lessonSlugOrId, courseSlug });
    setCourseMaterialModalOpen(true);
  };

  return (
    <ContentContainer>
      <div className={styles.viewContainer}>
        <ContentModal
          isOpen={isCourseMaterialModalOpen}
          onClose={() => {
            setCourseMaterialModalOpen(false);
          }}
          hasCloseButton
          header={<p className={styles.modalHeading}>{t('learning-plan-material')}</p>}
        >
          <CourseMaterial
            isModal
            courseSlug={courseSlug}
            currentLessonId={lesson.id}
            lessons={lesson.course.lessons}
          />
        </ContentModal>
        <CourseMaterial
          courseSlug={courseSlug}
          currentLessonId={lesson.id}
          lessons={lesson.course.lessons}
        />
        <div className={styles.container}>
          <PageContainer>
            <div className={styles.headerButtonsContainer}>
              <Button
                onClick={onBackButtonClicked}
                href={getCourseNavigationUrl(courseSlug)}
                variant={ButtonVariant.Ghost}
              >
                <ArrowLeft />
                <p className={styles.backText}>{t('back-to-learning-plan')}</p>
              </Button>
              <Button
                onClick={onCourseMaterialClicked}
                variant={ButtonVariant.Ghost}
                className={styles.courseMaterialButton}
              >
                {t('learning-plan-material')}
              </Button>
            </div>
            <div className={styles.headerContainer}>
              <p className={styles.title}>
                {`${t('day')} ${toLocalizedNumber(day, lang)}`}
                {`: ${title}`}
              </p>
            </div>
            <div className={styles.contentContainer}>
              <MilkdownProvider>
                <MarkdownEditor isEditable={false} defaultValue={content} />
              </MilkdownProvider>
            </div>
            <ActionButtons lesson={lesson} courseSlug={courseSlug} />
          </PageContainer>
        </div>
      </div>
    </ContentContainer>
  );
};

export default LessonView;
