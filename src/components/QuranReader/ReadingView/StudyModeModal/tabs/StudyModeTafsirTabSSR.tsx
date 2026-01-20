/**
 * SSR-enabled version of StudyModeTafsirTab
 *
 * This component imports TafsirBody directly (not dynamically) to enable
 * server-side rendering for SEO pages. Use this component in SSR contexts
 * where content needs to be rendered server-side for crawlers.
 */
import React from 'react';

import StudyModeTabLayout, {
  useStudyModeTabScroll,
  studyModeTabStyles as styles,
} from './StudyModeTabLayout';

import TafsirBody from '@/components/QuranReader/TafsirView/TafsirBody';

interface StudyModeTafsirTabSSRProps {
  chapterId: string;
  verseNumber: string;
  /** Tafsir ID or slug for SSR query key matching */
  tafsirIdOrSlug?: string;
  /** Locale for SSR - unused but kept for consistent interface */
  locale?: string;
}

const StudyModeTafsirTabSSR: React.FC<StudyModeTafsirTabSSRProps> = ({
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
        showFontControl={false}
        showSpinnerOnRevalidate={false}
        render={({ body, languageAndTafsirSelection }) => (
          <StudyModeTabLayout selectionControl={languageAndTafsirSelection} body={body} />
        )}
      />
    </div>
  );
};

export default StudyModeTafsirTabSSR;
