import React from 'react';

import dynamic from 'next/dynamic';

import StudyModeTabLayout, {
  useStudyModeTabScroll,
  studyModeTabStyles as styles,
} from './StudyModeTabLayout';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import ContentType from '@/types/QuranReflect/ContentType';

const ReflectionBodyContainer = dynamic(
  () => import('@/components/QuranReader/ReflectionView/ReflectionBodyContainer'),
  {
    ssr: false,
    loading: TafsirSkeleton,
  },
);

interface StudyModeLessonsTabProps {
  chapterId: string;
  verseNumber: string;
}

const StudyModeLessonsTab: React.FC<StudyModeLessonsTabProps> = ({ chapterId, verseNumber }) => {
  const { containerRef, scrollToTop } = useStudyModeTabScroll();

  return (
    <div ref={containerRef} className={styles.container}>
      <ReflectionBodyContainer
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        initialContentType={ContentType.LESSONS}
        scrollToTop={scrollToTop}
        isModal
        showEndActions={false}
        showTabs={false}
        render={({ body, languageSelection }) => (
          <StudyModeTabLayout
            selectionControl={languageSelection}
            body={body}
            fontType="lesson"
          />
        )}
      />
    </div>
  );
};

export default StudyModeLessonsTab;
