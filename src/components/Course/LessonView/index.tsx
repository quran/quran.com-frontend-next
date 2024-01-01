import React from 'react';

import { MilkdownProvider } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';

import styles from './Lesson.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';
import { Lesson } from '@/types/auth/Course';
import { toLocalizedNumber } from '@/utils/locale';

type Props = {
  lesson: Lesson;
};

const LessonView: React.FC<Props> = ({ lesson }) => {
  const { title, content, day } = lesson;
  const { t, lang } = useTranslation('learn');

  return (
    <div>
      <div className={styles.headerContainer}>
        <p className={styles.title}>
          {`${t('day')} ${toLocalizedNumber(day, lang)}`}
          {`: ${title}`}
        </p>
      </div>
      <MilkdownProvider>
        <MarkdownEditor isEditable={false} defaultValue={content} />
      </MilkdownProvider>
    </div>
  );
};

export default LessonView;
