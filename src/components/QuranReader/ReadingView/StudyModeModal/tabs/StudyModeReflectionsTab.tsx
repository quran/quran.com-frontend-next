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
    loading: TafsirSkeleton,
  },
);

interface StudyModeReflectionsTabProps {
  chapterId: string;
  verseNumber: string;
}

const StudyModeReflectionsTab: React.FC<StudyModeReflectionsTabProps> = ({
  chapterId,
  verseNumber,
}) => {
  const { containerRef, scrollToTop } = useStudyModeTabScroll();

  return (
    <div ref={containerRef} className={styles.container}>
      <ReflectionBodyContainer
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        initialContentType={ContentType.REFLECTIONS}
        scrollToTop={scrollToTop}
        isModal
        showEndActions={false}
        showTabs={false}
        render={({ body, languageSelection }) => (
          <StudyModeTabLayout
            selectionControl={languageSelection}
            body={body}
            fontType="reflection"
          />
        )}
      />
    </div>
  );
};

export default StudyModeReflectionsTab;
