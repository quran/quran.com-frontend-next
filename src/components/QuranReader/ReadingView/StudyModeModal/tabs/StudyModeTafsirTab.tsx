import React from 'react';

import dynamic from 'next/dynamic';

import StudyModeTabLayout, {
  useStudyModeTabScroll,
  studyModeTabStyles as styles,
} from './StudyModeTabLayout';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';

const TafsirBody = dynamic(() => import('@/components/QuranReader/TafsirView/TafsirBody'), {
  ssr: false,
  loading: TafsirSkeleton,
});

interface StudyModeTafsirTabProps {
  chapterId: string;
  verseNumber: string;
}

const StudyModeTafsirTab: React.FC<StudyModeTafsirTabProps> = ({ chapterId, verseNumber }) => {
  const { containerRef, scrollToTop } = useStudyModeTabScroll();

  return (
    <div ref={containerRef} className={styles.container}>
      <TafsirBody
        shouldRender
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        scrollToTop={scrollToTop}
        showArabicText={false}
        showNavigation={false}
        shouldShowFontControl={false}
        hasSeparateTafsirLayout
        render={({ body, languageAndTafsirSelection }) => (
          <StudyModeTabLayout selectionControl={languageAndTafsirSelection} body={body} />
        )}
      />
    </div>
  );
};

export default StudyModeTafsirTab;
