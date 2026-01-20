/**
 * SSR-enabled version of StudyModeReflectionsTab
 *
 * This component uses ReflectionBodyContainerSSR which imports components directly
 * (not dynamically with ssr: false) to enable server-side rendering for SEO pages.
 * Use this component in SSR contexts where content needs to be rendered server-side for crawlers.
 */
import React from 'react';

import StudyModeTabLayout, {
  useStudyModeTabScroll,
  studyModeTabStyles as styles,
} from './StudyModeTabLayout';

import ReflectionBodyContainerSSR from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer/ReflectionBodyContainerSSR';
import ContentType from '@/types/QuranReflect/ContentType';

interface StudyModeReflectionsTabSSRProps {
  chapterId: string;
  verseNumber: string;
  /** Tafsir ID or slug - unused but kept for consistent interface */
  tafsirIdOrSlug?: string;
  /** Locale for SSR query key matching */
  locale?: string;
}

const StudyModeReflectionsTabSSR: React.FC<StudyModeReflectionsTabSSRProps> = ({
  chapterId,
  verseNumber,
  locale,
}) => {
  const { containerRef, scrollToTop } = useStudyModeTabScroll();

  return (
    <div ref={containerRef} className={styles.container}>
      <ReflectionBodyContainerSSR
        initialChapterId={chapterId}
        initialVerseNumber={verseNumber}
        initialContentType={ContentType.REFLECTIONS}
        initialLocale={locale}
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

export default StudyModeReflectionsTabSSR;
