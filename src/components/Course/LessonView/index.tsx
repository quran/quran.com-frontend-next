import React from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import ActionButtons from './ActionButtons';
import styles from './Lesson.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';
import Button, { ButtonVariant } from '@/dls/Button/Button';
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

  const onBackButtonClicked = () => {
    logButtonClick('back_to_course', { lessonSlugOrId, courseSlug });
  };

  return (
    <>
      <Button
        onClick={onBackButtonClicked}
        href={getCourseNavigationUrl(courseSlug)}
        variant={ButtonVariant.Ghost}
      >
        <ArrowLeft />
        <p className={styles.backText}>{t('back-to-course')}</p>
      </Button>
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
    </>
  );
};

export default LessonView;
