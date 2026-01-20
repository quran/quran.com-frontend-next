/**
 * SSR-enabled version of StudyModeReflectionsTab
 *
 * This component imports ReflectionBodyContainer directly (not dynamically) to enable
 * server-side rendering for SEO pages. Use this component in SSR contexts
 * where content needs to be rendered server-side for crawlers.
 */
import React from 'react';

import StudyModeTabLayout, {
  useStudyModeTabScroll,
  studyModeTabStyles as styles,
} from './StudyModeTabLayout';

import ReflectionBodyContainer from '@/components/QuranReader/ReflectionView/ReflectionBodyContainer';
import ContentType from '@/types/QuranReflect/ContentType';

interface StudyModeReflectionsTabSSRProps {
  chapterId: string;
  verseNumber: string;
}

const StudyModeReflectionsTabSSR: React.FC<StudyModeReflectionsTabSSRProps> = ({
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

export default StudyModeReflectionsTabSSR;
