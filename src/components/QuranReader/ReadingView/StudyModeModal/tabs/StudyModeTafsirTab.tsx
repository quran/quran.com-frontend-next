import React from 'react';

import dynamic from 'next/dynamic';

import StudyModeTabLayout, {
  useStudyModeTabScroll,
  studyModeTabStyles as styles,
} from './StudyModeTabLayout';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';

const TafsirBody = dynamic(() => import('@/components/QuranReader/TafsirView/TafsirBody'), {
  loading: TafsirSkeleton,
});

interface StudyModeTafsirTabProps {
  chapterId: string;
  verseNumber: string;
  tafsirIdOrSlug?: string;
}

const StudyModeTafsirTab: React.FC<StudyModeTafsirTabProps> = ({
  chapterId,
  verseNumber,
  tafsirIdOrSlug,
}) => {
  const { containerRef, scrollToTop } = useStudyModeTabScroll();

  return (
    <div ref={containerRef} className={styles.container}>
      <TafsirBody
        shouldRender
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        initialTafsirIdOrSlug={tafsirIdOrSlug}
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
